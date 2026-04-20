import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api-auth'
import { verifyToken, signToken } from '@/lib/auth'

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
// AUTO-MIGRATE: Ensure all required columns exist in the Store table
// ═══════════════════════════════════════════════════════════════
async function ensureStoreColumns(db: Awaited<ReturnType<typeof getDb>>): Promise<string[]> {
  const added: string[] = []
  try {
    const columns = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("Store")`)
    const colNames = columns.map(c => c.name)

    const required: { name: string; sql: string }[] = [
      { name: 'subscriptionExpiresAt', sql: `ALTER TABLE "Store" ADD COLUMN "subscriptionExpiresAt" DATETIME` },
      { name: 'trialDays', sql: `ALTER TABLE "Store" ADD COLUMN "trialDays" INTEGER DEFAULT 0` },
      { name: 'description', sql: `ALTER TABLE "Store" ADD COLUMN "description" TEXT DEFAULT ''` },
      { name: 'address', sql: `ALTER TABLE "Store" ADD COLUMN "address" TEXT DEFAULT ''` },
      { name: 'whatsappNumber', sql: `ALTER TABLE "Store" ADD COLUMN "whatsappNumber" TEXT DEFAULT ''` },
      { name: 'logo', sql: `ALTER TABLE "Store" ADD COLUMN "logo" TEXT DEFAULT ''` },
    ]

    for (const col of required) {
      if (colNames.includes(col.name)) continue
      try {
        await db.$executeRawUnsafe(col.sql)
        added.push(col.name)
        console.log(`[super-admin] Added column Store.${col.name}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes('duplicate column')) {
          console.warn(`[super-admin] Store.${col.name} migration failed:`, msg)
        }
      }
    }
  } catch (err) {
    console.error('[super-admin] Store column check failed:', err)
  }
  return added
}

// ═══════════════════════════════════════════════════════════════
// AUTO-SEED: Ensure demo stores exist in the database
// Uses dynamic column detection to avoid INSERT failures on
// databases that may not have all expected columns.
// ═══════════════════════════════════════════════════════════════
async function ensureDemoStores(db: Awaited<ReturnType<typeof getDb>>): Promise<{ created: number; errors: string[]; dbMode: string }> {
  const DEMO_STORES = [
    { id: 'kmpw0h5ig4o518kg4zsm5huo3', name: 'Urban Style', slug: 'urban-style', plan: 'pro', whatsappNumber: '51999999999', address: 'Av. Arequipa 1234, Lima' },
    { id: 'seed-store-basico', name: 'Mi Tienda Basica', slug: 'mi-tienda-basica', plan: 'basico', whatsappNumber: '51988888888', address: 'Jr. Lima 456, Lima' },
    { id: 'seed-store-pro', name: 'TechStore Pro', slug: 'techstore-pro', plan: 'pro', whatsappNumber: '51977777777', address: 'Av. Brasil 789, Lima' },
    { id: 'seed-store-premium', name: 'Fashion Premium', slug: 'fashion-premium', plan: 'premium', whatsappNumber: '51966666666', address: 'Av. Larco 321, Lima' },
  ]

  const ADMIN_PASSWORD_HASH = '$2b$10$5ICH2rll4GzxgUEQh0aCeegaSt/qK6UFovrA/paTTqLgdt9dQUfke'
  const SEED_USERS = [
    { email: 'admin@urbanstyle.pe', storeId: 'kmpw0h5ig4o518kg4zsm5huo3', name: 'Admin Urban Style', role: 'admin' as const },
    { email: 'cliente@email.com', storeId: 'kmpw0h5ig4o518kg4zsm5huo3', name: 'Cliente Demo', role: 'customer' as const },
    { email: 'basico@demo.pe', storeId: 'seed-store-basico', name: 'Carlos Basico', role: 'admin' as const },
    { email: 'basico@cliente.com', storeId: 'seed-store-basico', name: 'Cliente Basico', role: 'customer' as const },
    { email: 'pro@demo.pe', storeId: 'seed-store-pro', name: 'Maria Pro', role: 'admin' as const },
    { email: 'pro@cliente.com', storeId: 'seed-store-pro', name: 'Cliente Pro', role: 'customer' as const },
    { email: 'premium@demo.pe', storeId: 'seed-store-premium', name: 'Ana Premium', role: 'admin' as const },
    { email: 'premium@cliente.com', storeId: 'seed-store-premium', name: 'Cliente Premium', role: 'customer' as const },
  ]

  let created = 0
  const errors: string[] = []
  const now = new Date().toISOString()
  let dbMode = 'unknown'

  // ═══ Step 1: Detect available Store columns ═══
  let storeColNames: string[] = []
  try {
    const colInfo = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("Store")`)
    storeColNames = colInfo.map(c => c.name)
    dbMode = storeColNames.length > 5 ? 'turso' : 'local'
    console.log(`[super-admin] Store columns available: [${storeColNames.join(', ')}] (mode: ${dbMode})`)
  } catch (err) {
    errors.push(`Cannot detect Store columns: ${err instanceof Error ? err.message : String(err)}`)
    console.error('[super-admin] PRAGMA table_info failed:', err)
    return { created: 0, errors, dbMode: 'error' }
  }

  // ═══ Step 2: Create stores using ONLY available columns ═══
  for (const store of DEMO_STORES) {
    try {
      const existing = await db.$queryRawUnsafe<{ id: string }[]>(`SELECT id FROM Store WHERE id = '${store.id}'`)
      if (existing && existing.length > 0) {
        console.log(`[super-admin] Store already exists: ${store.name} (${store.id})`)
        continue
      }

      // Build INSERT dynamically using only columns that exist
      const colData: Record<string, string | number> = {
        id: store.id,
        name: store.name,
        slug: store.slug,
        plan: store.plan,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      }
      // Only add optional columns if they exist in the table
      if (storeColNames.includes('whatsappNumber')) colData.whatsappNumber = store.whatsappNumber
      if (storeColNames.includes('address')) colData.address = store.address
      if (storeColNames.includes('description')) colData.description = ''
      if (storeColNames.includes('logo')) colData.logo = ''

      const columns = Object.keys(colData).join(', ')
      const values = Object.values(colData).map(v => {
        if (typeof v === 'number') return String(v)
        return `'${String(v).replace(/'/g, "''")}'`
      }).join(', ')

      await db.$executeRawUnsafe(`INSERT INTO Store (${columns}) VALUES (${values})`)
      created++
      console.log(`[super-admin] Auto-created store: ${store.name} (${store.id})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Store ${store.name}: ${msg}`)
      console.error(`[super-admin] Failed to create store ${store.name}:`, msg)
    }
  }

  // ═══ Step 3: Create seed users ═══
  for (const user of SEED_USERS) {
    try {
      const existing = await db.$queryRawUnsafe<{ id: string }[]>(`SELECT id FROM StoreUser WHERE email = '${user.email}' AND storeId = '${user.storeId}'`)
      if (existing && existing.length > 0) continue

      const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await db.$executeRawUnsafe(`
        INSERT INTO StoreUser (id, email, password, name, role, storeId, avatar, createdAt)
        VALUES ('${userId}', '${user.email}', '${ADMIN_PASSWORD_HASH}', '${user.name}', '${user.role}', '${user.storeId}', '', '${now}')
      `)
      console.log(`[super-admin] Auto-created user: ${user.email}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`User ${user.email}: ${msg}`)
      console.error(`[super-admin] Failed to create user ${user.email}:`, msg)
    }
  }

  return { created, errors, dbMode }
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

    // ═══ STEP 0: Auto-migrate and auto-seed ═══
    const migratedCols = await ensureStoreColumns(db)
    const seedResult = await ensureDemoStores(db)
    if (migratedCols.length > 0 || seedResult.created > 0) {
      console.log(`[super-admin] Auto-repair: migrated ${migratedCols.length} cols, seeded ${seedResult.created} stores`)
    }
    if (seedResult.errors.length > 0) {
      console.warn(`[super-admin] Seed errors:`, seedResult.errors)
    }

    // ═══ STEP 0.5: If still 0 stores, try auto init-db ═══
    let autoInitResult: any = null
    let totalLeads = 0
    const errors: string[] = []

    // Quick check: how many stores exist after seeding?
    try {
      const quickCount = await db.$queryRawUnsafe<[{ count: number }]>('SELECT COUNT(*) as count FROM Store')
      const storeCountAfterSeed = quickCount[0]?.count || 0
      console.log(`[super-admin] Store count after auto-seed: ${storeCountAfterSeed}`)

      if (storeCountAfterSeed === 0) {
        console.log('[super-admin] DB is empty after auto-seed, attempting auto init-db...')
        try {
          // Dynamically import and call the init-db logic
          const initUrl = new URL('/api/init-db', request.url)
          const initRes = await fetch(initUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: request.headers.get('authorization') || '' },
            body: JSON.stringify({}),
          })
          autoInitResult = await initRes.json().catch(() => ({ error: 'init-db fetch failed' }))
          console.log('[super-admin] Auto init-db result:', autoInitResult.success ? 'SUCCESS' : autoInitResult.error)
        } catch (initErr) {
          console.warn('[super-admin] Auto init-db failed (non-critical):', initErr instanceof Error ? initErr.message : initErr)
        }
      }
    } catch (countErr) {
      console.warn('[super-admin] Quick store count failed:', countErr instanceof Error ? countErr.message : countErr)
    }

    // 0. Direct COUNT queries for accurate stats (independent of detail queries)
    let directTotalStores = 0, directActiveStores = 0, directTotalUsers = 0, directTotalProducts = 0, directTotalOrders = 0, directTotalCoupons = 0
    let countQueriesSucceeded = false
    try {
      const [storeCount, activeCount, userCount, productCount, orderCount, couponCount] = await Promise.all([
        db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM Store`),
        db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM Store WHERE isActive = 1`),
        db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM StoreUser`),
        db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM Product`),
        db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \"Order\"`),
        db.$queryRawUnsafe(`SELECT COUNT(*) as count FROM Coupon`),
      ]) as [{count: number}][],
      directTotalStores = storeCount[0]?.count || 0
      directActiveStores = activeCount[0]?.count || 0
      directTotalUsers = userCount[0]?.count || 0
      directTotalProducts = productCount[0]?.count || 0
      directTotalOrders = orderCount[0]?.count || 0
      directTotalCoupons = couponCount[0]?.count || 0
      countQueriesSucceeded = true
      console.log('[super-admin] Direct counts OK:', { directTotalStores, directActiveStores, directTotalUsers, directTotalProducts, directTotalOrders, directTotalCoupons })
    } catch (err) {
      console.error('[super-admin] Direct count queries failed, will use fallback from detail queries:', err)
    }

    // 1. Stores with full details - use raw SQL with dynamic column detection
    try {
      // First, detect available columns to build a resilient query
      const storeColumns = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("Store")`)
      const availableCols = storeColumns.map(c => c.name)
      console.log('[super-admin] Available Store columns:', availableCols)

      // Build SELECT statement with only available columns
      const wantedCols = ['id', 'name', 'slug', 'logo', 'whatsappNumber', 'address', 'description', 'isActive', 'plan', 'subscriptionExpiresAt', 'trialDays', 'createdAt', 'updatedAt']
      const safeCols = wantedCols.filter(c => availableCols.includes(c))
      const selectClause = safeCols.join(', ')

      const rawStores = await db.$queryRawUnsafe<Record<string, any>[]>(
        `SELECT ${selectClause} FROM Store ORDER BY createdAt DESC`
      )

      console.log(`[super-admin] Fetched ${rawStores.length} stores from DB`)

      // Get counts for each store
      stores = await Promise.all(rawStores.map(async (store) => {
        try {
          const [userCount, productCount, orderCount, categoryCount] = await Promise.all([
            db.$queryRawUnsafe<[{ count: number }]>`SELECT COUNT(*) as count FROM StoreUser WHERE storeId = '${store.id}'`,
            db.$queryRawUnsafe<[{ count: number }]>`SELECT COUNT(*) as count FROM Product WHERE storeId = '${store.id}'`,
            db.$queryRawUnsafe<[{ count: number }]>`SELECT COUNT(*) as count FROM \"Order\" WHERE storeId = '${store.id}'`,
            db.$queryRawUnsafe<[{ count: number }]>`SELECT COUNT(*) as count FROM Category WHERE storeId = '${store.id}'`,
          ])

          // Get users for this store
          const users = await db.$queryRawUnsafe<{
            id: string; email: string; name: string; phone: string; role: string; avatar: string; createdAt: string
          }[]>(`SELECT id, email, name, phone, role, avatar, createdAt FROM StoreUser WHERE storeId = '${store.id}' ORDER BY createdAt DESC`)

          return {
            id: store.id,
            name: store.name || '',
            slug: store.slug || '',
            logo: store.logo || '',
            whatsappNumber: store.whatsappNumber || '',
            address: store.address || '',
            description: store.description || '',
            isActive: store.isActive === 1 || store.isActive === true,
            plan: store.plan || 'basico',
            subscriptionExpiresAt: store.subscriptionExpiresAt || null,
            trialDays: store.trialDays || 0,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt,
            _count: {
              users: userCount[0]?.count || 0,
              products: productCount[0]?.count || 0,
              orders: orderCount[0]?.count || 0,
              categories: categoryCount[0]?.count || 0,
              coupons: 0,
            },
            users: (users || []).map(u => ({
              id: u.id, email: u.email, name: u.name, phone: u.phone || '',
              role: u.role, avatar: u.avatar || '', createdAt: u.createdAt
            })),
          }
        } catch {
          return {
            id: store.id,
            name: store.name || 'Tienda',
            slug: store.slug || '',
            logo: '', whatsappNumber: '', address: '', description: '',
            isActive: store.isActive === 1 || store.isActive === true,
            plan: store.plan || 'basico',
            subscriptionExpiresAt: null, trialDays: 0,
            createdAt: store.createdAt, updatedAt: store.updatedAt,
            _count: { users: 0, products: 0, orders: 0, categories: 0, coupons: 0 },
            users: [],
          }
        }
      }))
    } catch (err) {
      errors.push('Tiendas')
      console.error('[super-admin] Store detail query failed:', err instanceof Error ? err.message : err)
    }

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

    // Aggregate stats - use direct counts when available, otherwise compute from detail queries
    const totalStores = countQueriesSucceeded ? directTotalStores : (stores.length || directTotalStores)
    const activeStores = countQueriesSucceeded ? directActiveStores : (stores.filter(s => s.isActive).length || directActiveStores)
    const totalUsers = countQueriesSucceeded ? directTotalUsers : (allUsers.length || directTotalUsers)
    const totalProducts = countQueriesSucceeded ? directTotalProducts : (stores.reduce((sum, s) => sum + (s._count?.products || 0), 0) || directTotalProducts)
    const totalOrders = countQueriesSucceeded ? directTotalOrders : (stores.reduce((sum, s) => sum + (s._count?.orders || 0), 0) || directTotalOrders)
    const totalCoupons = countQueriesSucceeded ? directTotalCoupons : (coupons.length || directTotalCoupons)

    // Calculate expiring stores from stores array
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringStores = stores.filter(s => {
      if (!s.subscriptionExpiresAt) return false
      const exp = new Date(s.subscriptionExpiresAt)
      return exp > now && exp <= thirtyDaysFromNow
    }).length
    const expiredStores = stores.filter(s => {
      if (!s.subscriptionExpiresAt) return false
      return new Date(s.subscriptionExpiresAt) <= now
    }).length

    console.log('[super-admin] Final stats:', { totalStores, activeStores, totalUsers, totalProducts, totalOrders, totalCoupons, expiringStores, expiredStores })

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
      stats: { totalStores, activeStores, totalUsers, totalProducts, totalOrders, totalLeads, totalCoupons, planDistribution, expiringStores, expiredStores },
      stores, users: allUsers, leads, coupons, recentActivity,
    }
    if (errors.length > 0) response._partialErrors = errors
    // Include diagnostic info for debugging
    response._diagnostic = {
      dbMode: seedResult.dbMode,
      seedErrors: seedResult.errors.length > 0 ? seedResult.errors : undefined,
      columnsMigrated: migratedCols.length > 0 ? migratedCols : undefined,
      storesSeeded: seedResult.created,
      autoInit: autoInitResult ? { success: autoInitResult.success, error: autoInitResult.error } : undefined,
    }

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
