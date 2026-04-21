import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'
import { sendEmail } from '@/lib/email'
import { orderConfirmationEmail } from '@/lib/email-templates'
import { validateRequest, createOrderSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const { storeId, customerName, customerPhone, customerAddress, items, notes, userId, paymentMethodId } = await request.json()

    // Validate with Zod
    const validation = validateRequest(createOrderSchema, { customerName, customerPhone, customerAddress, items, notes, paymentMethodId })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Validate required fields
    if (!storeId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tienda' },
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

    // Send order confirmation email (fire and forget)
    if (customerPhone && customerPhone.includes('@')) {
      const emailTemplate = orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName,
        storeName: store.name,
        total: order.total,
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        status: order.status,
      })
      sendEmail({ to: customerPhone, subject: emailTemplate.subject, html: emailTemplate.html })
        .catch((err) => console.error('[checkout] Failed to send order confirmation email:', err))
    }

    // Also notify store admin if email available
    const storeAdmin = await db.storeUser.findFirst({
      where: { storeId, role: 'admin' },
      select: { email: true },
    })
    if (storeAdmin?.email) {
      const adminTemplate = orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName,
        storeName: store.name,
        total: order.total,
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
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
    return NextResponse.json(
      { error: 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
