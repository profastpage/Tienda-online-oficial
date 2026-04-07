import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin, verifyStoreOwnership } from '@/lib/api-auth'

async function fetchOrdersWithPaymentMethod(db: any, where: Record<string, unknown>) {
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
    orderBy: { createdAt: 'desc' },
  })
}

async function fetchOrdersWithoutPaymentMethod(db: any, where: Record<string, unknown>) {
  return db.order.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
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
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    // Verify the admin can only access their own store's data
    if (storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const where: Record<string, unknown> = { storeId }
    if (status) where.status = status

    let orders
    try {
      orders = await fetchOrdersWithPaymentMethod(db, where)
    } catch {
      // MercadoPagoPayment or PaymentMethod table may not exist on fresh deploy
      orders = await fetchOrdersWithoutPaymentMethod(db, where)
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
