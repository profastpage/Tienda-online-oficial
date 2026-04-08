import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api-auth'
import { verifyToken, signToken } from '@/lib/auth'

const SUPER_SECRET = '46a175d2f1801e73d6944abe8cd28a01c393e33eb0c19e7e863b9e0aa0c84d84'

async function verifySuperAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const authCookie = request.cookies.get('super-admin-token')?.value
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) || authCookie
  if (!token) return false

  // Check 1: Direct secret match
  if (token === (process.env.SUPER_ADMIN_SECRET || SUPER_SECRET)) return true

  // Check 2: JWT token with super-admin role
  try {
    const payload = await verifyToken(token)
    if (payload && payload.role === 'super-admin') return true
  } catch {
    // not a valid JWT, ignore
  }

  return false
}

export async function GET(request: Request) {
  try {
    // Rate limit protection
    if (!checkRateLimit(request, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Verify super admin auth (secret OR JWT with super-admin role)
    const isAuthorized = await verifySuperAdmin(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const db = await getDb()

    // Get all stores with user counts and product counts
    const stores = await db.store.findMany({
      include: {
        _count: { select: { users: true, products: true, orders: true, categories: true } },
        users: {
          select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get all users across all stores
    const allUsers = await db.storeUser.findMany({
      include: {
        store: { select: { id: true, name: true, slug: true, plan: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get leads
    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Aggregate stats
    const totalStores = stores.length
    const activeStores = stores.filter(s => s.isActive).length
    const totalUsers = allUsers.length
    const totalProducts = stores.reduce((sum, s) => sum + s._count.products, 0)
    const totalOrders = stores.reduce((sum, s) => sum + s._count.orders, 0)
    const totalLeads = await db.lead.count()

    // Plan distribution
    const planDistribution: Record<string, number> = {}
    for (const store of stores) {
      const plan = store.plan || 'basico'
      planDistribution[plan] = (planDistribution[plan] || 0) + 1
    }

    // Recent activity (last 10 registrations)
    const recentActivity = allUsers.slice(0, 10).map(u => ({
      type: 'registration',
      userName: u.name,
      storeName: u.store.name,
      role: u.role,
      date: u.createdAt,
    }))

    return NextResponse.json({
      stats: {
        totalStores,
        activeStores,
        totalUsers,
        totalProducts,
        totalOrders,
        totalLeads,
        planDistribution,
      },
      stores,
      users: allUsers,
      leads,
      recentActivity,
    })
  } catch (error) {
    console.error('[super-admin] Error:', error)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    // Rate limit protection
    if (!checkRateLimit(request, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Verify super admin auth (secret OR JWT with super-admin role)
    const isAuthorized = await verifySuperAdmin(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const db = await getDb()

    if (action === 'toggle-store') {
      const { storeId, isActive } = body
      if (!storeId || typeof isActive !== 'boolean') {
        return NextResponse.json({ error: 'storeId e isActive requeridos' }, { status: 400 })
      }

      const store = await db.store.update({
        where: { id: storeId },
        data: { isActive },
        include: {
          _count: { select: { users: true, products: true, orders: true, categories: true } },
          users: {
            select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Tienda ${isActive ? 'activada' : 'suspendida'} exitosamente`,
        store,
      })
    }

    if (action === 'delete-store') {
      const { storeId } = body
      if (!storeId) {
        return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
      }

      await db.store.delete({ where: { id: storeId } })

      return NextResponse.json({
        success: true,
        message: 'Tienda eliminada exitosamente',
      })
    }

    if (action === 'store-token') {
      const { storeId } = body
      if (!storeId) {
        return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
      }

      // Get store info
      const store = await db.store.findUnique({ where: { id: storeId } })
      if (!store) {
        return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
      }

      // Generate a temporary admin JWT for this store
      const tempToken = await signToken({
        userId: 'super-admin-impersonate',
        email: 'profastpage@gmail.com',
        role: 'super-admin',
        storeId: store.id,
      })

      const response = NextResponse.json({
        success: true,
        token: tempToken,
        user: {
          id: 'super-admin-impersonate',
          email: 'profastpage@gmail.com',
          name: 'Super Admin',
          phone: '',
          address: '',
          role: 'super-admin',
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
        },
      })

      // Set auth-token cookie so middleware allows access to /admin routes
      response.cookies.set('auth-token', tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day (temporary token)
        path: '/',
      })

      return response
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('[super-admin] PATCH error:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
