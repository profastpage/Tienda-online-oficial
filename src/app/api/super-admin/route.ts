import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api-auth'
import { verifyToken, signToken } from '@/lib/auth'
import { STORE_SAFE_FIELDS } from '@/lib/store-helpers'

// Force dynamic rendering - prevent Next.js from caching this API response
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // 0. Direct COUNT queries for accurate stats (independent of detail queries)
    let directTotalStores = 0, directActiveStores = 0, directTotalUsers = 0, directTotalProducts = 0, directTotalOrders = 0, directTotalCoupons = 0
    try {
      const [storeCount, activeCount, userCount, productCount, orderCount, couponCount] = await Promise.all([
        db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Store`,
        db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Store WHERE isActive = 1`,
        db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM StoreUser`,
        db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Product`,
        db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM \`Order\``,
        db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Coupon`,
      ])
      directTotalStores = storeCount[0]?.count || 0
      directActiveStores = activeCount[0]?.count || 0
      directTotalUsers = userCount[0]?.count || 0
      directTotalProducts = productCount[0]?.count || 0
      directTotalOrders = orderCount[0]?.count || 0
      directTotalCoupons = couponCount[0]?.count || 0
      console.log('[super-admin] Direct counts:', { directTotalStores, directActiveStores, directTotalUsers, directTotalProducts, directTotalOrders, directTotalCoupons })
    } catch (err) {
      console.error('[super-admin] Direct count queries failed:', err)
    }

    // 1. Stores with full details - use raw SQL for robustness
    try {
      const rawStores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        logo: string
        whatsappNumber: string
        address: string
        description: string
        isActive: number
        plan: string
        subscriptionExpiresAt: string | null
        trialDays: number
        createdAt: Date
        updatedAt: Date
      }[]>`SELECT id, name, slug, logo, whatsappNumber, address, description, isActive, plan, subscriptionExpiresAt, trialDays, createdAt, updatedAt FROM Store ORDER BY createdAt DESC`
      
      // Get counts for each store
      stores = await Promise.all(rawStores.map(async (store) => {
        try {
          const userCount = await db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM StoreUser WHERE storeId = ${store.id}`
          const productCount = await db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Product WHERE storeId = ${store.id}`
          const orderCount = await db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM \`Order\` WHERE storeId = ${store.id}`
          const categoryCount = await db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Category WHERE storeId = ${store.id}`
          
          // Get users for this store
          const users = await db.$queryRaw<{
            id: string
            email: string
            name: string
            phone: string
            role: string
            avatar: string
            createdAt: Date
          }[]>`SELECT id, email, name, phone, role, avatar, createdAt FROM StoreUser WHERE storeId = ${store.id} ORDER BY createdAt DESC`
          
          return {
            ...store,
            isActive: store.isActive === 1,
            _count: {
              users: userCount[0]?.count || 0,
              products: productCount[0]?.count || 0,
              orders: orderCount[0]?.count || 0,
              categories: categoryCount[0]?.count || 0,
              coupons: 0,
            },
            users: users || [],
          }
        } catch {
          return {
            ...store,
            isActive: store.isActive === 1,
            _count: { users: 0, products: 0, orders: 0, categories: 0, coupons: 0 },
            users: [],
          }
        }
      }))
    } catch (err) { errors.push('Tiendas'); console.error(err) }

    // 2. All users
    try {
      allUsers = await db.$queryRaw<{
        id: string
        email: string
        name: string
        phone: string
        address: string
        role: string
        avatar: string
        createdAt: Date
        storeId: string
      }[]>`SELECT id, email, name, phone, address, role, avatar, createdAt, storeId FROM StoreUser ORDER BY createdAt DESC`
      
      // Add store info to users
      allUsers = await Promise.all(allUsers.map(async (user) => {
        try {
          const store = await db.$queryRaw<{
            id: string
            name: string
            slug: string
            plan: string
            isActive: number
          }[]>`SELECT id, name, slug, plan, isActive FROM Store WHERE id = ${user.storeId}`
          return { ...user, store: store[0] || null }
        } catch {
          return { ...user, store: null }
        }
      }))
    } catch (err) { errors.push('Usuarios'); console.error(err) }

    // 3. Leads
    try {
      leads = await db.$queryRaw<any[]>`SELECT * FROM Lead ORDER BY createdAt DESC LIMIT 100`
      const leadCount = await db.$queryRaw<[{ count: number }]>`SELECT COUNT(*) as count FROM Lead`
      totalLeads = leadCount[0]?.count || leads.length
    } catch (err) { errors.push('Leads'); console.error(err); totalLeads = leads.length }

    // 4. Coupons
    try {
      coupons = await db.$queryRaw<{
        id: string
        code: string
        type: string
        value: number
        minPurchase: number | null
        maxUses: number
        usedCount: number
        isActive: number
        expiresAt: Date | null
        createdAt: Date
        storeId: string
      }[]>`SELECT id, code, type, value, minPurchase, maxUses, usedCount, isActive, expiresAt, createdAt, storeId FROM Coupon ORDER BY createdAt DESC`
      
      // Add store info to coupons
      coupons = await Promise.all(coupons.map(async (coupon) => {
        try {
          const store = await db.$queryRaw<{
            id: string
            name: string
            slug: string
          }[]>`SELECT id, name, slug FROM Store WHERE id = ${coupon.storeId}`
          return { ...coupon, store: store[0] || null }
        } catch {
          return { ...coupon, store: null }
        }
      }))
    } catch (err) { errors.push('Coupons'); console.error(err) }

    // Aggregate stats - use direct counts when available (more reliable)
    const totalStores = directTotalStores || stores.length
    const activeStores = directActiveStores || stores.filter(s => s.isActive).length
    const totalUsers = directTotalUsers || allUsers.length
    const totalProducts = directTotalProducts || stores.reduce((sum, s) => sum + (s._count?.products || 0), 0)
    const totalOrders = directTotalOrders || stores.reduce((sum, s) => sum + (s._count?.orders || 0), 0)
    const totalCoupons = directTotalCoupons || coupons.length

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

    // No-cache headers to ensure real-time sync
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
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
      console.log('[super-admin] toggle-store:', { storeId, isActive, isActiveType: typeof isActive })
      if (!storeId || typeof isActive !== 'boolean') {
        console.log('[super-admin] toggle-store validation failed:', { storeId, isActiveType: typeof isActive })
        return NextResponse.json({ error: 'Datos requeridos', received: { storeId, isActive, isActiveType: typeof isActive } }, { status: 400 })
      }
      
      const result = await db.$executeRaw`UPDATE Store SET isActive = ${isActive ? 1 : 0}, updatedAt = ${new Date().toISOString()} WHERE id = ${storeId}`
      console.log('[super-admin] UPDATE result:', result)
      
      const stores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        logo: string
        whatsappNumber: string
        address: string
        description: string
        isActive: number
        plan: string
      }[]>`SELECT id, name, slug, logo, whatsappNumber, address, description, isActive, plan FROM Store WHERE id = ${storeId}`
      
      console.log('[super-admin] Store after update:', stores[0])
      return NextResponse.json({ success: true, message: `Tienda ${isActive ? 'activada' : 'suspendida'}`, store: stores[0] })
    }

    // ── Delete Store ──
    if (action === 'delete-store') {
      const { storeId } = body
      if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
      await db.$executeRaw`DELETE FROM Store WHERE id = ${storeId}`
      return NextResponse.json({ success: true, message: 'Tienda eliminada con todos sus datos' })
    }

    // ── Change Store Plan ──
    if (action === 'change-plan') {
      const { storeId, plan } = body
      if (!storeId || !plan) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
      const validPlans = ['basico', 'pro', 'premium', 'empresarial', 'gratis']
      if (!validPlans.includes(plan)) return NextResponse.json({ error: 'Plan invalido' }, { status: 400 })
      
      await db.$executeRaw`UPDATE Store SET plan = ${plan}, updatedAt = ${new Date().toISOString()} WHERE id = ${storeId}`
      
      const stores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        plan: string
      }[]>`SELECT id, name, slug, plan FROM Store WHERE id = ${storeId}`
      
      return NextResponse.json({ success: true, message: `Plan cambiado a ${plan}`, store: stores[0] })
    }

    // ── Store Impersonation Token ──
    if (action === 'store-token') {
      const { storeId } = body
      if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
      
      const stores = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`SELECT id, name, slug FROM Store WHERE id = ${storeId}`
      const store = stores[0]
      
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

      const existing = await db.$queryRaw<{ id: string }[]>`SELECT id FROM Coupon WHERE code = ${code.toUpperCase()}`
      if (existing.length > 0) return NextResponse.json({ error: 'El codigo de cupon ya existe' }, { status: 409 })

      const couponId = `coupon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const now = new Date().toISOString()
      
      await db.$executeRaw`
        INSERT INTO Coupon (id, code, storeId, type, value, minPurchase, maxUses, usedCount, isActive, expiresAt, createdAt)
        VALUES (${couponId}, ${code.toUpperCase()}, ${storeId}, ${type || 'percentage'}, ${parseFloat(value)}, ${minPurchase ? parseFloat(minPurchase) : null}, ${maxUses ? parseInt(maxUses) : 0}, 0, 1, ${expiresAt ? new Date(expiresAt).toISOString() : null}, ${now})
      `

      // Create notification for the store
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await db.$executeRaw`
        INSERT INTO AdminNotification (id, storeId, type, title, message, data, createdAt)
        VALUES (${notifId}, ${storeId}, 'coupon', 'Nuevo Cupon de Descuento', ${`Cupon ${code.toUpperCase()} creado: ${type === 'percentage' ? `${value}%` : `S/ ${value}`} de descuento`}, '{}', ${now})
      `

      return NextResponse.json({ success: true, message: 'Cupon creado exitosamente' })
    }

    // ── Toggle Coupon Active ──
    if (action === 'toggle-coupon') {
      const { couponId, isActive } = body
      if (!couponId) return NextResponse.json({ error: 'couponId requerido' }, { status: 400 })
      await db.$executeRaw`UPDATE Coupon SET isActive = ${isActive !== false ? 1 : 0} WHERE id = ${couponId}`
      return NextResponse.json({ success: true, message: `Cupon ${isActive ? 'activado' : 'desactivado'}` })
    }

    // ── Delete Coupon ──
    if (action === 'delete-coupon') {
      const { couponId } = body
      if (!couponId) return NextResponse.json({ error: 'couponId requerido' }, { status: 400 })
      await db.$executeRaw`DELETE FROM Coupon WHERE id = ${couponId}`
      return NextResponse.json({ success: true, message: 'Cupon eliminado' })
    }

    // ── Send Notification to Store ──
    if (action === 'send-notification') {
      const { storeId, type, title, message, broadcast } = body
      if (!title || !message) return NextResponse.json({ error: 'titulo y mensaje requeridos' }, { status: 400 })

      const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const now = new Date().toISOString()

      if (broadcast) {
        // Send to ALL stores
        const allStores = await db.$queryRaw<{ id: string }[]>`SELECT id FROM Store`
        for (const s of allStores) {
          await db.$executeRaw`
            INSERT INTO AdminNotification (id, storeId, type, title, message, data, createdAt)
            VALUES (${`notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`}, ${s.id}, ${type || 'info'}, ${title}, ${message}, '{}', ${now})
          `
        }
        return NextResponse.json({ success: true, message: `Notificacion enviada a ${allStores.length} tiendas` })
      } else {
        if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
        await db.$executeRaw`
          INSERT INTO AdminNotification (id, storeId, type, title, message, data, createdAt)
          VALUES (${notifId}, ${storeId}, ${type || 'info'}, ${title}, ${message}, '{}', ${now})
        `
        return NextResponse.json({ success: true, message: 'Notificacion enviada' })
      }
    }

    // ── Delete Lead ──
    if (action === 'delete-lead') {
      const { leadId } = body
      if (!leadId) return NextResponse.json({ error: 'leadId requerido' }, { status: 400 })
      await db.$executeRaw`DELETE FROM Lead WHERE id = ${leadId}`
      return NextResponse.json({ success: true, message: 'Lead eliminado' })
    }

    // ── Set Subscription Expiry / Extend Time ──
    if (action === 'set-subscription' || action === 'grant-trial') {
      const { storeId, days } = body
      console.log('[super-admin] set-subscription:', { storeId, days, daysType: typeof days })
      
      if (!storeId || !days || typeof days !== 'number' || days <= 0) {
        console.log('[super-admin] set-subscription validation failed')
        return NextResponse.json({ error: 'storeId y days (numero positivo) requeridos', received: { storeId, days, daysType: typeof days } }, { status: 400 })
      }

      // Calculate expiry date from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + days)
      console.log('[super-admin] Setting expiry to:', expiresAt.toISOString())

      const updateResult = await db.$executeRaw`
        UPDATE Store
        SET subscriptionExpiresAt = ${expiresAt.toISOString()}, updatedAt = ${new Date().toISOString()}
        WHERE id = ${storeId}
      `
      console.log('[super-admin] Subscription UPDATE result:', updateResult)

      const stores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        subscriptionExpiresAt: string | null
      }[]>`SELECT id, name, slug, subscriptionExpiresAt FROM Store WHERE id = ${storeId}`
      
      console.log('[super-admin] Store after subscription update:', stores[0])

      return NextResponse.json({
        success: true,
        message: `Suscripción extendida ${days} días`,
        store: stores[0] ? {
          ...stores[0],
          expiresAt: stores[0].subscriptionExpiresAt
        } : null
      })
    }

    return NextResponse.json({ error: `Accion no valida: ${action}` }, { status: 400 })
  } catch (error) {
    console.error('[super-admin] PATCH error:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
