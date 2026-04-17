import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/api-auth'
import { verifyToken, signToken } from '@/lib/auth'

const SUPER_SECRET = '46a175d2f1801e73d6944abe8cd28a01c393e33eb0c19e7e863b9e0aa0c84d84'

async function verifySuperAdmin(request: Request): Promise<boolean> {
  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  // Try cookie (using next/headers for Next.js App Router compatibility)
  let cookieToken: string | undefined
  try {
    const cookieStore = await cookies()
    cookieToken = cookieStore.get('super-admin-token')?.value
  } catch {
    // cookies() not available in some contexts
  }

  const token = bearerToken || cookieToken
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

    // Verify super admin auth
    const isAuthorized = await verifySuperAdmin(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    let db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error('[super-admin] Database connection failed:', dbError)
      return NextResponse.json({
        stats: { totalStores: 0, activeStores: 0, totalUsers: 0, totalProducts: 0, totalOrders: 0, totalLeads: 0, planDistribution: {} },
        stores: [],
        users: [],
        leads: [],
        recentActivity: [],
        _dbWarning: 'No se pudo conectar a la base de datos. Verifica TURSO_URL y DATABASE_AUTH_TOKEN en Vercel.',
      })
    }

    // Fetch each data source independently with error handling
    let stores: any[] = []
    let allUsers: any[] = []
    let leads: any[] = []
    let totalLeads = 0
    const errors: string[] = []

    // 1. Fetch stores
    try {
      stores = await db.store.findMany({
        include: {
          _count: { select: { users: true, products: true, orders: true, categories: true } },
          users: {
            select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) {
      console.error('[super-admin] Error fetching stores:', err)
      errors.push('Tiendas: error al cargar')
    }

    // 2. Fetch all users
    try {
      allUsers = await db.storeUser.findMany({
        include: {
          store: { select: { id: true, name: true, slug: true, plan: true, isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) {
      console.error('[super-admin] Error fetching users:', err)
      errors.push('Usuarios: error al cargar')
    }

    // 3. Fetch leads
    try {
      leads = await db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    } catch (err) {
      console.error('[super-admin] Error fetching leads:', err)
      errors.push('Leads: error al cargar')
    }

    // 4. Count leads
    try {
      totalLeads = await db.lead.count()
    } catch {
      totalLeads = leads.length
    }

    // Aggregate stats
    const totalStores = stores.length
    const activeStores = stores.filter(s => s.isActive).length
    const totalUsers = allUsers.length
    const totalProducts = stores.reduce((sum: number, s: any) => sum + s._count.products, 0)
    const totalOrders = stores.reduce((sum: number, s: any) => sum + s._count.orders, 0)

    // Plan distribution
    const planDistribution: Record<string, number> = {}
    for (const store of stores) {
      const plan = store.plan || 'basico'
      planDistribution[plan] = (planDistribution[plan] || 0) + 1
    }

    // Recent activity
    const recentActivity = allUsers.slice(0, 10).map((u: any) => ({
      type: 'registration',
      userName: u.name,
      storeName: u.store?.name || '—',
      role: u.role,
      date: u.createdAt,
    }))

    const response: any = {
      stats: { totalStores, activeStores, totalUsers, totalProducts, totalOrders, totalLeads, planDistribution },
      stores,
      users: allUsers,
      leads,
      recentActivity,
    }

    if (errors.length > 0) {
      response._partialErrors = errors
    }

    return NextResponse.json(response)
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

    // Verify super admin auth
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
            select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, createdAt: true },
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
        maxAge: 60 * 60 * 24,
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
