import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin, verifyStoreOwnership } from '@/lib/api-auth'

async function fetchOrdersWithPaymentMethod(db: any, where: Record<string, unknown>, orderBy: Record<string, string>) {
  return db.order.findMany({
    where,
    include: {
      items: true,
      paymentMethod: { select: { name: true, type: true } },
      mercadoPagoPayment: {
        select: {
          id: true,
          preferenceId: true,
          paymentId: true,
          status: true,
          paymentType: true,
          lastFourDigits: true,
          installments: true,
          payerEmail: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: orderBy.direction as 'asc' | 'desc' },
  })
}

async function fetchOrdersWithoutPaymentMethod(db: any, where: Record<string, unknown>, orderBy: Record<string, string>) {
  return db.order.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: orderBy.direction as 'asc' | 'desc' },
  })
}

async function fetchOrderWithPaymentMethod(db: any, id: string, data: Record<string, unknown>) {
  return db.order.update({
    where: { id },
    data,
    include: {
      items: true,
      paymentMethod: { select: { name: true, type: true } },
      mercadoPagoPayment: {
        select: {
          id: true,
          preferenceId: true,
          paymentId: true,
          status: true,
          paymentType: true,
          lastFourDigits: true,
          installments: true,
          payerEmail: true,
          createdAt: true,
        },
      },
    },
  })
}

async function fetchOrderWithoutPaymentMethod(db: any, id: string, data: Record<string, unknown>) {
  return db.order.update({
    where: { id },
    data,
    include: {
      items: true,
    },
  })
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const sort = searchParams.get('sort') || 'desc'
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    // Verify the admin can only access their own store's data
    if (storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const where: Record<string, unknown> = { storeId }
    if (status) where.status = status

    // Search by order number or customer name (case-insensitive)
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
      ]
    }

    // Date range filtering
    if (from || to) {
      where.createdAt = {}
      if (from) {
        ;(where.createdAt as Record<string, unknown>).gte = new Date(from + 'T00:00:00.000Z')
      }
      if (to) {
        ;(where.createdAt as Record<string, unknown>).lte = new Date(to + 'T23:59:59.999Z')
      }
    }

    const orderBy = { direction: sort === 'asc' ? 'asc' : 'desc' }

    let orders
    try {
      orders = await fetchOrdersWithPaymentMethod(db, where, orderBy)
    } catch {
      // MercadoPagoPayment or PaymentMethod table may not exist on fresh deploy
      orders = await fetchOrdersWithoutPaymentMethod(db, where, orderBy)
    }
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { id, status, notes } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify store ownership before update
    const ownership = await verifyStoreOwnership(request, 'order', id)
    if (!ownership.authorized) return ownership.error

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    let order
    try {
      order = await fetchOrderWithPaymentMethod(db, id, updateData)
    } catch {
      // MercadoPagoPayment or PaymentMethod table may not exist on fresh deploy
      order = await fetchOrderWithoutPaymentMethod(db, id, updateData)
    }
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify store ownership before delete
    const ownership = await verifyStoreOwnership(request, 'order', id)
    if (!ownership.authorized) return ownership.error

    // Delete related OrderItems explicitly (cascade should handle, but be safe)
    await db.orderItem.deleteMany({ where: { orderId: id } })
    // Delete related MercadoPagoPayment if exists
    try {
      await db.mercadoPagoPayment.deleteMany({ where: { orderId: id } })
    } catch {
      // Table may not exist on fresh deploy
    }

    await db.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
