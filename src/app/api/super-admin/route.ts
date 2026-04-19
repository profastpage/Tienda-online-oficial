import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api-auth'
import { verifyToken, signToken } from '@/lib/auth'
import { STORE_SAFE_FIELDS } from '@/lib/store-helpers'

async function verifySuperAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  let cookieToken: string | undefined
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies())
    cookieToken = cookieStore.get('super-admin-token')?.value
  } catch { /* cookies() not available */ }

  const token = bearerToken || cookieToken
  if (!token) return false

  if (token === process.env.SUPER_ADMIN_SECRET) return true

  try {
    const payload = await verifyToken(token)
    if (payload && payload.role === 'super-admin') return true
  } catch { /* not a JWT */ }

  return false
}

// Safe store fields for select (excludes columns that may not exist in older DBs)
const STORE_SELECT_FIELDS = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  whatsappNumber: true,
  address: true,
  description: true,
  isActive: true,
  plan: true,
  createdAt: true,
  updatedAt: true,
}

// ═══════════════════════════════════════════════════════════════
// GET — Fetch all dashboard data
// ═══════════════════════════════════════════════════════════════
export async function GET(request: Request) {
  try {
    if (!checkRateLimit(request, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const isAuthorized = await verifySuperAdmin(request)
    if (!isAuthorized) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    let db
    try { db = await getDb() }
    catch (dbError) {
      console.error('[super-admin] DB connection failed:', dbError)
      return NextResponse.json({
        stats: { totalStores: 0, activeStores: 0, totalUsers: 0, totalProducts: 0, totalOrders: 0, totalLeads: 0, totalCoupons: 0, planDistribution: {} },
        stores: [], users: [], leads: [], coupons: [], recentActivity: [],
        _dbWarning: 'No se pudo conectar a la base de datos. Verifica TURSO_URL y DATABASE_AUTH_TOKEN en Vercel.',
      })
    }

    let stores: any[] = [], allUsers: any[] = [], leads: any[] = [], coupons: any[] = []
    let totalLeads = 0
    const errors: string[] = []

    // 1. Stores with full details - use explicit select
    try {
      stores = await db.store.findMany({
        select: {
          ...STORE_SELECT_FIELDS,
          _count: { select: { users: true, products: true, orders: true, categories: true, coupons: true } },
          users: { select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
          coupons: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) { errors.push('Tiendas'); console.error(err) }

    // 2. All users
    try {
      allUsers = await db.storeUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          role: true,
          avatar: true,
          createdAt: true,
          storeId: true,
          store: { select: { id: true, name: true, slug: true, plan: true, isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) { errors.push('Usuarios'); console.error(err) }

    // 3. Leads
    try {
      leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
      totalLeads = await db.lead.count()
    } catch (err) { errors.push('Leads'); console.error(err); totalLeads = leads.length }

    // 4. Coupons
    try {
      coupons = await db.coupon.findMany({
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          minPurchase: true,
          maxUses: true,
          usedCount: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          storeId: true,
          store: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) { errors.push('Coupons'); console.error(err) }

    // Aggregate stats
    const totalStores = stores.length
    const activeStores = stores.filter(s => s.isActive).length
    const totalUsers = allUsers.length
    const totalProducts = stores.reduce((sum, s) => sum + s._count.products, 0)
    const totalOrders = stores.reduce((sum, s) => sum + s._count.orders, 0)
    const totalCoupons = coupons.length

    const planDistribution: Record<string, number> = {}
    for (const store of stores) {
      const plan = store.plan || 'basico'
      planDistribution[plan] = (planDistribution[plan] || 0) + 1
    }

    // Recent activity
    const recentActivity = allUsers.slice(0, 15).map((u) => ({
      type: 'registration',
      userName: u.name,
      storeName: u.store?.name || '—',
      role: u.role,
      date: u.createdAt,
    }))

    const response: any = {
      stats: { totalStores, activeStores, totalUsers, totalProducts, totalOrders, totalLeads, totalCoupons, planDistribution, expiringStores: 0, expiredStores: 0 },
      stores, users: allUsers, leads, coupons, recentActivity,
    }
    if (errors.length > 0) response._partialErrors = errors

    return NextResponse.json(response)
  } catch (error) {
    console.error('[super-admin] GET error:', error)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH — Super admin actions (full God mode)
// ═══════════════════════════════════════════════════════════════
export async function PATCH(request: Request) {
  try {
    if (!checkRateLimit(request, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const isAuthorized = await verifySuperAdmin(request)
    if (!isAuthorized) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json()
    const { action } = body
    const db = await getDb()

    // ── Toggle Store Active/Suspended ──
    if (action === 'toggle-store') {
      const { storeId, isActive } = body
      if (!storeId || typeof isActive !== 'boolean') return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
      const store = await db.store.update({
        where: { id: storeId },
        data: { isActive },
        select: {
          ...STORE_SELECT_FIELDS,
          _count: { select: { users: true, products: true, orders: true, categories: true, coupons: true } },
          users: { select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, createdAt: true } },
        },
      })
      return NextResponse.json({ success: true, message: `Tienda ${isActive ? 'activada' : 'suspendida'}`, store })
    }

    // ── Delete Store ──
    if (action === 'delete-store') {
      const { storeId } = body
      if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
      await db.store.delete({ where: { id: storeId } })
      return NextResponse.json({ success: true, message: 'Tienda eliminada con todos sus datos' })
    }

    // ── Change Store Plan ──
    if (action === 'change-plan') {
      const { storeId, plan } = body
      if (!storeId || !plan) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
      const validPlans = ['basico', 'pro', 'premium', 'empresarial', 'gratis']
      if (!validPlans.includes(plan)) return NextResponse.json({ error: 'Plan invalido' }, { status: 400 })
      const store = await db.store.update({
        where: { id: storeId },
        data: { plan },
        select: {
          ...STORE_SELECT_FIELDS,
          _count: { select: { users: true, products: true, orders: true, categories: true, coupons: true } },
          users: { select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, createdAt: true } },
        },
      })
      return NextResponse.json({ success: true, message: `Plan cambiado a ${plan}`, store })
    }

    // ── Store Impersonation Token ──
    if (action === 'store-token') {
      const { storeId } = body
      if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
      const store = await db.store.findUnique({ 
        where: { id: storeId },
        select: { id: true, name: true, slug: true },
      })
      if (!store) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

      const tempToken = await signToken({
        userId: 'super-admin-impersonate',
        email: process.env.SUPER_ADMIN_EMAIL || 'profastpage@gmail.com',
        role: 'super-admin',
        storeId: store.id,
      })

      const response = NextResponse.json({
        success: true, token: tempToken,
        user: { id: 'super-admin-impersonate', email: 'profastpage@gmail.com', name: 'Super Admin', phone: '', address: '', role: 'super-admin', storeId: store.id, storeName: store.name, storeSlug: store.slug },
      })
      response.cookies.set('auth-token', tempToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24, path: '/' })
      return response
    }

    // ── Create Coupon ──
    if (action === 'create-coupon') {
      const { storeId, code, type, value, minPurchase, maxUses, expiresAt } = body
      if (!storeId || !code || !type || value === undefined) return NextResponse.json({ error: 'Datos requeridos: storeId, code, type, value' }, { status: 400 })

      const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })
      if (existing) return NextResponse.json({ error: 'El codigo de cupon ya existe' }, { status: 409 })

      const coupon = await db.coupon.create({
        data: {
          code: code.toUpperCase(),
          storeId,
          type: type || 'percentage',
          value: parseFloat(value),
          minPurchase: minPurchase ? parseFloat(minPurchase) : null,
          maxUses: maxUses ? parseInt(maxUses) : 0,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      })

      // Create notification for the store
      await db.adminNotification.create({
        data: {
          storeId,
          type: 'coupon',
          title: 'Nuevo Cupon de Descuento',
          message: `Cupon ${coupon.code.toUpperCase()} creado: ${type === 'percentage' ? `${value}%` : `S/ ${value}`} de descuento`,
          data: JSON.stringify({ couponCode: coupon.code }),
        },
      })

      return NextResponse.json({ success: true, message: 'Cupon creado exitosamente', coupon })
    }

    // ── Toggle Coupon Active ──
    if (action === 'toggle-coupon') {
      const { couponId, isActive } = body
      if (!couponId) return NextResponse.json({ error: 'couponId requerido' }, { status: 400 })
      const coupon = await db.coupon.update({ where: { id: couponId }, data: { isActive: isActive !== false } })
      return NextResponse.json({ success: true, message: `Cupon ${isActive ? 'activado' : 'desactivado'}`, coupon })
    }

    // ── Delete Coupon ──
    if (action === 'delete-coupon') {
      const { couponId } = body
      if (!couponId) return NextResponse.json({ error: 'couponId requerido' }, { status: 400 })
      await db.coupon.delete({ where: { id: couponId } })
      return NextResponse.json({ success: true, message: 'Cupon eliminado' })
    }

    // ── Send Notification to Store ──
    if (action === 'send-notification') {
      const { storeId, type, title, message, broadcast } = body
      if (!title || !message) return NextResponse.json({ error: 'titulo y mensaje requeridos' }, { status: 400 })

      if (broadcast) {
        // Send to ALL stores
        const allStores = await db.store.findMany({ select: { id: true } })
        const notifications = allStores.map(s => ({ storeId: s.id, type: type || 'info', title, message, data: '{}' }))
        await db.adminNotification.createMany({ data: notifications })
        return NextResponse.json({ success: true, message: `Notificacion enviada a ${allStores.length} tiendas` })
      } else {
        if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
        const notification = await db.adminNotification.create({ data: { storeId, type: type || 'info', title, message, data: '{}' } })
        return NextResponse.json({ success: true, message: 'Notificacion enviada', notification })
      }
    }

    // ── Delete Lead ──
    if (action === 'delete-lead') {
      const { leadId } = body
      if (!leadId) return NextResponse.json({ error: 'leadId requerido' }, { status: 400 })
      await db.lead.delete({ where: { id: leadId } })
      return NextResponse.json({ success: true, message: 'Lead eliminado' })
    }

    // ── Set Subscription Expiry / Extend Time (disabled if column doesn't exist) ──
    if (action === 'set-subscription' || action === 'grant-trial') {
      return NextResponse.json({ 
        error: 'Esta funcionalidad requiere una actualización de base de datos. Las columnas subscriptionExpiresAt y trialDays no están disponibles.' 
      }, { status: 400 })
    }

    return NextResponse.json({ error: `Accion no valida: ${action}` }, { status: 400 })
  } catch (error) {
    console.error('[super-admin] PATCH error:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
