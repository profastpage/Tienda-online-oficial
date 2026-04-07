import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const { storeId, customerName, customerPhone, customerAddress, items, notes, userId, paymentMethodId } = await request.json()

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

    // Check plan limits (monthly orders) before creating order
    const plan = store.plan || 'basico'
    const limitCheck = await checkPlanLimit(db, storeId, 'orders', plan)
    if (!limitCheck.allowed) {
      const config = getPlanConfig(plan)
      return NextResponse.json(
        {
          error: `Esta tienda ha alcanzado el límite mensual de pedidos del plan ${config.name} (${limitCheck.limit}). El vendedor debe actualizar su plan.`,
          currentPlan: plan,
          limit: limitCheck.limit,
        },
        { status: 403 }
      )
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)

    // Generate order number
    const orderCount = await db.order.count({ where: { storeId } })
    const orderNumber = `TOO-${String(orderCount + 1).padStart(5, '0')}`

    // Build order data
    const orderData: Record<string, unknown> = {
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
    }

    // Only include paymentMethodId if it exists
    if (paymentMethodId) {
      orderData.paymentMethodId = paymentMethodId
    }

    // Try creating with paymentMethod include first
    let order
    try {
      order = await db.order.create({
        data: orderData,
        include: {
          items: true,
          paymentMethod: { select: { name: true, type: true } },
        },
      })
    } catch {
      // PaymentMethod table may not exist on fresh deploy – retry without relation
      delete orderData.paymentMethodId
      order = await db.order.create({
        data: orderData,
        include: {
          items: true,
        },
      })
    }

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
