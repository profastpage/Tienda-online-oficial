import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    // Use storeId from JWT token instead of query param
    const storeId = auth.user.storeId
    if (!storeId || storeId === '__super_admin__') {
      // Super admin doesn't have a store — return empty dashboard
      return NextResponse.json({
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        dailySales: [],
        orderStatusDist: [],
        newLeads: 0,
        ordersToday: 0,
        recentPayments: [],
      })
    }

    const db = await getDb()

    // Helper: safely run a query, returning fallback on error
    const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn()
      } catch (err) {
        console.warn('[dashboard] Query error:', err instanceof Error ? err.message : err)
        return fallback
      }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Fetch all dashboard data with individual error handling
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      recentOrders,
      revenueData,
      pendingCount,
      leadsCount,
      ordersToday,
      recentPayments,
    ] = await Promise.all([
      safe(() => db.product.count({ where: { storeId } }), 0),
      safe(() => db.order.count({ where: { storeId } }), 0),
      safe(() => db.storeUser.count({ where: { storeId, role: 'customer' } }), 0),
      safe(() => db.order.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true },
      }), []),
      safe(() => db.order.aggregate({
        where: { storeId, status: { in: ['delivered', 'shipped', 'confirmed', 'preparing'] } },
        _sum: { total: true },
      }), { _sum: { total: 0 } }),
      safe(() => db.order.count({ where: { storeId, status: 'pending' } }), 0),
      safe(() => db.lead.count({ where: { status: 'new' } }), 0),
      safe(() => db.order.count({ where: { storeId, createdAt: { gte: todayStart } } }), 0),
      safe(() => db.order.findMany({
        where: { storeId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          orderNumber: true,
          total: true,
          status: true,
          paymentMethod: { select: { name: true, type: true } },
          createdAt: true,
        },
      }), []),
    ])

    const totalRevenue = revenueData._sum?.total || 0

    // Get daily sales for the last 7 days
    const recentOrdersForChart = await safe(() => db.order.findMany({
      where: { storeId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { total: true, createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    }), [])

    // Group by day
    const dailySales: { date: string; total: number; orders: number }[] = []
    const dayMap = new Map<string, { total: number; orders: number }>()

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      const label = date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
      dayMap.set(key, { total: 0, orders: 0 })
      dailySales.push({ date: label, total: 0, orders: 0 })
    }

    for (const order of recentOrdersForChart) {
      const key = order.createdAt.toISOString().split('T')[0]
      const day = dayMap.get(key)
      if (day) {
        day.total += order.total
        day.orders += 1
      }
    }

    // Map back
    let idx = 0
    for (const [, value] of dayMap) {
      dailySales[idx].total = Math.round(value.total * 100) / 100
      dailySales[idx].orders = value.orders
      idx++
    }

    // Order status distribution
    const statusCounts = await safe(() => db.order.groupBy({
      by: ['status'],
      where: { storeId },
      _count: { status: true },
    }), [])

    const orderStatusDist = statusCounts.map((s: { status: string; _count: { status: number } }) => ({
      status: s.status,
      count: s._count.status,
    }))

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders: pendingCount,
      totalRevenue,
      recentOrders,
      dailySales,
      orderStatusDist,
      newLeads: leadsCount,
      ordersToday,
      recentPayments,
    })
  } catch (error) {
    console.error('[admin/dashboard GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al obtener dashboard', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
