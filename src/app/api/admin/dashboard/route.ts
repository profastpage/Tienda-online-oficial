import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    // Use storeId from JWT token instead of query param
    const storeId = auth.user.storeId

    const db = await getDb()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // recentPayments is isolated in case PaymentMethod table doesn't exist
    let recentPayments: any[] = []
    try {
      recentPayments = await db.order.findMany({
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
      })
    } catch {
      // PaymentMethod table may not exist on fresh deploy, fetch without it
      try {
        recentPayments = await db.order.findMany({
          where: { storeId },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        })
      } catch {
        // Even orders table might not exist yet; leave as empty
        recentPayments = []
      }
    }

    const [totalProducts, totalOrders, totalCustomers, recentOrders, revenueData, pendingCount, leadsCount, ordersToday] = await Promise.all([
      db.product.count({ where: { storeId } }),
      db.order.count({ where: { storeId } }),
      db.storeUser.count({ where: { storeId, role: 'customer' } }),
      db.order.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } }),
      db.order.aggregate({ where: { storeId, status: { in: ['delivered', 'shipped', 'confirmed', 'preparing'] } }, _sum: { total: true } }),
      db.order.count({ where: { storeId, status: 'pending' } }),
      db.lead.count({ where: { status: 'new' } }),
      db.order.count({ where: { storeId, createdAt: { gte: todayStart } } }),
    ])

    const totalRevenue = revenueData._sum.total || 0

    // Get daily sales for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentOrdersForChart = await db.order.findMany({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    })

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
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      where: { storeId },
      _count: { status: true },
    })

    const orderStatusDist = statusCounts.map((s) => ({
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
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
