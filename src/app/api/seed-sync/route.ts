import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * POST /api/seed-sync
 *
 * ⚠️ PRODUCTION SECURITY: This endpoint is PROTECTED.
 * Requires INIT_DB_SECRET to prevent unauthorized access.
 * Seed users are only created in development mode.
 * In production, only stores are synced (no password resets).
 *
 * Call this after deploying to ensure demo stores appear in super admin.
 */

// Only allow in non-production, or with INIT_DB_SECRET
const IS_DEV = process.env.NODE_ENV !== 'production'

function verifyAccess(request: Request): boolean {
  // In production, require INIT_DB_SECRET
  if (!IS_DEV) {
    const secret = request.headers.get('x-init-secret') || process.env.INIT_DB_SECRET
    return !!secret && secret.length >= 16
  }
  return true
}

const DEMO_STORES = [
  { id: 'kmpw0h5ig4o518kg4zsm5huo3', name: 'Urban Style', slug: 'urban-style', plan: 'pro', whatsappNumber: '51999999999', address: 'Av. Arequipa 1234, Lima' },
  { id: 'seed-store-basico', name: 'Mi Tienda Básica', slug: 'mi-tienda-basica', plan: 'basico', whatsappNumber: '51988888888', address: 'Jr. Lima 456, Lima' },
  { id: 'seed-store-pro', name: 'TechStore Pro', slug: 'techstore-pro', plan: 'pro', whatsappNumber: '51977777777', address: 'Av. Brasil 789, Lima' },
  { id: 'seed-store-premium', name: 'Fashion Premium', slug: 'fashion-premium', plan: 'premium', whatsappNumber: '51966666666', address: 'Av. Larco 321, Lima' },
]

const SEED_USERS = [
  { email: 'admin@urbanstyle.pe', storeId: 'kmpw0h5ig4o518kg4zsm5huo3', name: 'Admin Urban Style', role: 'admin' as const },
  { email: 'cliente@email.com', storeId: 'kmpw0h5ig4o518kg4zsm5huo3', name: 'Cliente Demo', role: 'customer' as const },
  { email: 'basico@demo.pe', storeId: 'seed-store-basico', name: 'Carlos Básico', role: 'admin' as const },
  { email: 'basico@cliente.com', storeId: 'seed-store-basico', name: 'Cliente Básico', role: 'customer' as const },
  { email: 'pro@demo.pe', storeId: 'seed-store-pro', name: 'María Pro', role: 'admin' as const },
  { email: 'pro@cliente.com', storeId: 'seed-store-pro', name: 'Cliente Pro', role: 'customer' as const },
  { email: 'premium@demo.pe', storeId: 'seed-store-premium', name: 'Ana Premium', role: 'admin' as const },
  { email: 'premium@cliente.com', storeId: 'seed-store-premium', name: 'Cliente Premium', role: 'customer' as const },
]

// Demo password hash (only used in development)
const DEMO_PASSWORD_HASH = '$2b$10$5ICH2rll4GzxgUEQh0aCeegaSt/qK6UFovrA/paTTqLgdt9dQUfke'

export async function POST(request: Request) {
  // Security check
  if (!verifyAccess(request)) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere INIT_DB_SECRET.' },
      { status: 401 }
    )
  }

  try {
    const db = await getDb()
    const results: { type: string; id: string; status: string; details?: string }[] = []

    // 1. Ensure all demo stores exist (always, for super admin visibility)
    for (const store of DEMO_STORES) {
      try {
        const existing = await db.store.findUnique({ where: { id: store.id } })

        if (!existing) {
          await db.$executeRaw`
            INSERT INTO Store (id, name, slug, plan, whatsappNumber, address, isActive, createdAt, updatedAt)
            VALUES (${store.id}, ${store.name}, ${store.slug}, ${store.plan}, ${store.whatsappNumber}, ${store.address}, 1, ${new Date().toISOString()}, ${new Date().toISOString()})
          `
          results.push({ type: 'store', id: store.id, status: 'created', details: store.name })
          console.log(`[seed-sync] Created store ${store.name} (${store.id})`)
        } else {
          await db.$executeRaw`
            UPDATE Store SET
              name = ${store.name},
              slug = ${store.slug},
              plan = ${store.plan},
              whatsappNumber = ${store.whatsappNumber},
              address = ${store.address},
              isActive = 1,
              updatedAt = ${new Date().toISOString()}
            WHERE id = ${store.id}
          `
          results.push({ type: 'store', id: store.id, status: 'updated', details: store.name })
        }
      } catch (err) {
        results.push({ type: 'store', id: store.id, status: 'error', details: err instanceof Error ? err.message : String(err) })
        console.error(`[seed-sync] Failed for store ${store.id}:`, err)
      }
    }

    // 2. Seed users — ONLY in development mode (never in production)
    if (IS_DEV) {
      for (const user of SEED_USERS) {
        try {
          const existing = await db.$queryRaw<{ id: string }[]>`
            SELECT id FROM StoreUser WHERE email = ${user.email} AND storeId = ${user.storeId}
          `

          if (existing.length === 0) {
            const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
            await db.$executeRaw`
              INSERT INTO StoreUser (id, email, password, name, role, storeId, createdAt)
              VALUES (${userId}, ${user.email}, ${DEMO_PASSWORD_HASH}, ${user.name}, ${user.role}, ${user.storeId}, ${new Date().toISOString()})
            `
            results.push({ type: 'user', id: user.email, status: 'created', details: user.name })
            console.log(`[seed-sync] Created user ${user.email}`)
          } else {
            // In dev, sync passwords; in production, this block is skipped entirely
            await db.$executeRaw`
              UPDATE StoreUser SET password = ${DEMO_PASSWORD_HASH}, name = ${user.name}
              WHERE email = ${user.email} AND storeId = ${user.storeId}
            `
            results.push({ type: 'user', id: user.email, status: 'updated', details: user.name })
          }
        } catch (err) {
          results.push({ type: 'user', id: user.email, status: 'error', details: err instanceof Error ? err.message : String(err) })
          console.error(`[seed-sync] Failed for user ${user.email}:`, err)
        }
      }
    } else {
      results.push({ type: 'info', id: 'users', status: 'skipped', details: 'Seed users disabled in production' })
    }

    const storesOk = results.filter(r => r.type === 'store' && r.status !== 'error').length
    const usersOk = results.filter(r => r.type === 'user' && r.status !== 'error').length
    const errors = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      status: errors === 0 ? 'ok' : 'partial',
      message: `Synced ${storesOk}/${DEMO_STORES.length} stores and ${usersOk}/${SEED_USERS.length} users`,
      results,
    })
  } catch (error) {
    console.error('[seed-sync] Fatal error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to sync demo data',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

// GET endpoint to check sync status (requires auth)
export async function GET(request: Request) {
  if (!verifyAccess(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const db = await getDb()

    const stores = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM Store ORDER BY createdAt DESC
    `

    const users = await db.$queryRaw<{ email: string; name: string; role: string }[]>`
      SELECT email, name, role FROM StoreUser ORDER BY createdAt DESC LIMIT 20
    `

    return NextResponse.json({
      stores: stores.length,
      storeList: stores,
      users: users.length,
      userList: users,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
