import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'
import { sendEmail } from '@/lib/email'
import { orderConfirmationEmail } from '@/lib/email-templates'
import { validateRequest, createOrderSchema } from '@/lib/validations'
import { rateLimit, getClientIp } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Rate limit: 10 orders per minute per IP
    const ip = getClientIp(request)
    if (!rateLimit(ip, 10, 60000)) {
      return NextResponse.json(
        { error: 'Demasiados pedidos. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

    const db = await getDb()
    const { storeId, customerName, customerEmail, customerPhone, customerAddress, items, notes, userId, paymentMethodId } = await request.json()

    // Validate with Zod
    const validation = validateRequest(createOrderSchema, { customerName, customerPhone, customerAddress, items, notes, paymentMethodId })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Se requiere el ID de la tienda' }, { status: 400 })
    }

    // Validate store exists
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Check plan limits
    const plan = store.plan || 'basico'
    const limitCheck = await checkPlanLimit(db, storeId, 'orders', plan)
    if (!limitCheck.allowed) {
      const config = getPlanConfig(plan)
      return NextResponse.json(
        { error: `Esta tienda ha alcanzado el límite mensual de pedidos del plan ${config.name} (${limitCheck.limit}).`, currentPlan: plan, limit: limitCheck.limit },
        { status: 403 }
      )
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    // Generate order number
    const orderCount = await db.order.count({ where: { storeId } })
    const orderNumber = `TOO-${String(orderCount + 1).padStart(5, '0')}`

    // Build order data — now includes customerEmail
    const orderData: Record<string, unknown> = {
      orderNumber,
      customerName,
      customerEmail: customerEmail || '',
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

    if (paymentMethodId) {
      orderData.paymentMethodId = paymentMethodId
    }

    // Create order
    let order
    try {
      order = await db.order.create({
        data: orderData,
        include: { items: true, paymentMethod: { select: { name: true, type: true } } },
      })
    } catch {
      delete orderData.paymentMethodId
      order = await db.order.create({
        data: orderData,
        include: { items: true },
      })
    }

    // Build email template
    const emailItems = order.items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    }))

    // Send confirmation email to customer (using customerEmail field)
    const customerEmailAddress = customerEmail || ''
    if (customerEmailAddress && customerEmailAddress.includes('@')) {
      const emailTemplate = orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName,
        storeName: store.name,
        total: order.total,
        items: emailItems,
        status: order.status,
      })
      sendEmail({ to: customerEmailAddress, subject: emailTemplate.subject, html: emailTemplate.html })
        .catch((err) => console.error('[checkout] Failed to send order confirmation email:', err))
    }

    // Notify store admin of new order
    const storeAdmin = await db.storeUser.findFirst({
      where: { storeId, role: 'admin' },
      select: { email: true },
    })
    if (storeAdmin?.email && storeAdmin.email !== customerEmailAddress) {
      const adminTemplate = orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName,
        storeName: store.name,
        total: order.total,
        items: emailItems,
        status: order.status,
      })
      sendEmail({
        to: storeAdmin.email,
        subject: `[Nuevo Pedido] #${order.orderNumber} - ${store.name}`,
        html: adminTemplate.html,
      }).catch((err) => console.error('[checkout] Failed to notify admin:', err))
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
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 })
  }
}
