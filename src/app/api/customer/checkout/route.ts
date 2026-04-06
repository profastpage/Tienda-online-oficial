import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const { storeId, customerName, customerPhone, customerAddress, items, notes, userId } = await request.json()

    // Validate required fields
    if (!storeId || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos del pedido incompletos' },
        { status: 400 }
      )
    }

    // Validate store exists
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)

    // Generate order number
    const orderCount = await db.order.count({ where: { storeId } })
    const orderNumber = `TOO-${String(orderCount + 1).padStart(5, '0')}`

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerAddress: customerAddress || '',
        total,
        notes: notes || '',
        status: 'pending',
        storeId,
        userId: userId || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.image || '',
            price: item.price,
            quantity: item.quantity,
            size: item.size || '',
            color: item.color || '',
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      items: order.items,
      message: 'Pedido creado exitosamente',
    })
  } catch (error) {
    console.error('[checkout] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
