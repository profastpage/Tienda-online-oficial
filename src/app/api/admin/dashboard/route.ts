import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    const [totalProducts, totalOrders, totalCustomers, recentOrders, revenueData] = await Promise.all([
      db.product.count({ where: { storeId } }),
      db.order.count({ where: { storeId } }),
      db.storeUser.count({ where: { storeId, role: 'customer' } }),
      db.order.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } }),
      db.order.aggregate({ where: { storeId, status: { in: ['delivered', 'shipped', 'confirmed'] } }, _sum: { total: true } }),
    ])

    const pendingOrders = await db.order.count({ where: { storeId, status: 'pending' } })
    const pending = await db.order.count({ where: { storeId, status: 'pending' } })
    const totalRevenue = revenueData._sum.total || 0

    return NextResponse.json({ totalProducts, totalOrders, totalCustomers, pendingOrders: pending, totalRevenue, recentOrders })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
