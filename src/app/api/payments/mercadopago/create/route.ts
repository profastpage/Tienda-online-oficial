import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createPreference } from '@/lib/mercadopago'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Auth is optional for checkout - allow guest checkout
    const authUser = await getAuthUser(request)

    const db = await getDb()
    const body = await request.json()
    const { orderId, storeId, customerEmail, customerName } = body

    if (!orderId || !storeId) {
      return NextResponse.json(
        { error: 'Datos incompletos. Se requiere orderId y storeId.' },
        { status: 400 }
      )
    }

    // Verify order exists and belongs to the store
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.storeId !== storeId) {
      return NextResponse.json({ error: 'El pedido no pertenece a esta tienda' }, { status: 403 })
    }

    // SECURITY: ALWAYS use order items from database for prices.
    // Client-supplied items are used ONLY for name/image override, NEVER for price/quantity.
    // This prevents price manipulation attacks where a client sends items with price: 0.01.
    const preferenceItems = order.items.map((dbItem) => ({
      name: dbItem.productName || 'Producto',
      price: Number(dbItem.price),       // ALWAYS from DB
      quantity: Number(dbItem.quantity),  // ALWAYS from DB
      image: dbItem.productImage || undefined,
    }))

    // Check if a MercadoPago payment already exists for this order
    const existingMp = await db.mercadoPagoPayment.findUnique({
      where: { orderId },
    })

    if (existingMp && existingMp.status === 'pending') {
      // Return existing preference if still pending
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      return NextResponse.json({
        preferenceId: existingMp.preferenceId,
        initPoint: JSON.parse(existingMp.metadata || '{}').initPoint || '',
        sandboxInitPoint: JSON.parse(existingMp.metadata || '{}').sandboxInitPoint || '',
        existing: true,
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create MercadoPago preference
    const mpResult = await createPreference({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: preferenceItems,
      customerEmail: customerEmail || order.customerPhone ? `customer_${order.id.substring(0, 8)}@tienda.com` : undefined,
      customerName: customerName || order.customerName,
      siteUrl,
    })

    // Save MercadoPago payment record
    await db.mercadoPagoPayment.create({
      data: {
        orderId: order.id,
        storeId,
        preferenceId: mpResult.preferenceId,
        status: 'pending',
        metadata: JSON.stringify({
          initPoint: mpResult.initPoint,
          sandboxInitPoint: mpResult.sandboxInitPoint,
        }),
      },
    })

    return NextResponse.json({
      preferenceId: mpResult.preferenceId,
      initPoint: mpResult.initPoint,
      sandboxInitPoint: mpResult.sandboxInitPoint,
    })
  } catch (error: any) {
    console.error('[MercadoPago Create] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear la preferencia de pago' },
      { status: 500 }
    )
  }
}
