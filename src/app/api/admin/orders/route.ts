import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    const where: Record<string, unknown> = { storeId }
    if (status) where.status = status

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        paymentMethod: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
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

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        paymentMethod: { select: { name: true, type: true } },
      },
    })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
