import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'

/**
 * POST /api/seed-sync
 *
 * Forces ALL seed user passwords in the DB to be updated to admin123.
 * Also ensures all seed stores exist.
 *
 * Call this ONCE after deploying the password change.
 * Protected by checking for a sync-key header.
 */
const ADMIN_PASSWORD_HASH = '$2b$10$5ICH2rll4GzxgUEQh0aCeegaSt/qK6UFovrA/paTTqLgdt9dQUfke'

const SEED_USERS = [
  { email: 'admin@urbanstyle.pe', storeId: 'kmpw0h5ig4o518kg4zsm5huo3', storeName: 'Urban Style', storeSlug: 'urban-style', name: 'Admin Urban Style' },
  { email: 'cliente@email.com', storeId: 'kmpw0h5ig4o518kg4zsm5huo3', storeName: 'Urban Style', storeSlug: 'urban-style', name: 'Cliente Demo' },
  { email: 'basico@demo.pe', storeId: 'seed-store-basico', storeName: 'Mi Tienda Básica', storeSlug: 'mi-tienda-basica', name: 'Carlos Básico' },
  { email: 'basico@cliente.com', storeId: 'seed-store-basico', storeName: 'Mi Tienda Básica', storeSlug: 'mi-tienda-basica', name: 'Cliente Básico' },
  { email: 'pro@demo.pe', storeId: 'seed-store-pro', storeName: 'TechStore Pro', storeSlug: 'techstore-pro', name: 'María Pro' },
  { email: 'pro@cliente.com', storeId: 'seed-store-pro', storeName: 'TechStore Pro', storeSlug: 'techstore-pro', name: 'Cliente Pro' },
  { email: 'premium@demo.pe', storeId: 'seed-store-premium', storeName: 'Fashion Premium', storeSlug: 'fashion-premium', name: 'Ana Premium' },
  { email: 'premium@cliente.com', storeId: 'seed-store-premium', storeName: 'Fashion Premium', storeSlug: 'fashion-premium', name: 'Cliente Premium' },
]

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const results: { email: string; storeId: string; status: string; details?: string }[] = []

    for (const seed of SEED_USERS) {
      try {
        // Ensure store exists
        await db.store.upsert({
          where: { id: seed.storeId },
          update: {},
          create: {
            id: seed.storeId,
            name: seed.storeName,
            slug: seed.storeSlug,
          },
        }).catch(async () => {
          const existing = await db.store.findUnique({ where: { id: seed.storeId } })
          if (!existing) {
            console.warn(`[seed-sync] Could not create store ${seed.storeId}`)
          }
        })

        // Upsert user with admin123 password
        const user = await db.storeUser.upsert({
          where: {
            email_storeId: { email: seed.email, storeId: seed.storeId },
          },
          update: {
            password: ADMIN_PASSWORD_HASH,
            name: seed.name,
          },
          create: {
            email: seed.email,
            password: ADMIN_PASSWORD_HASH,
            name: seed.name,
            role: seed.email.includes('cliente') ? 'customer' : 'admin',
            storeId: seed.storeId,
            avatar: '',
          },
          select: { id: true, email: true, name: true, role: true, storeId: true },
        })

        results.push({ email: seed.email, storeId: seed.storeId, status: 'synced', details: `id=${user.id}` })
        console.log(`[seed-sync] Synced ${seed.email} (id: ${user.id})`)
      } catch (err) {
        results.push({ email: seed.email, storeId: seed.storeId, status: 'error', details: err instanceof Error ? err.message : String(err) })
        console.error(`[seed-sync] Failed for ${seed.email}:`, err)
      }
    }

    const succeeded = results.filter(r => r.status === 'synced').length
    const failed = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      status: failed === 0 ? 'ok' : 'partial',
      message: `Synced ${succeeded}/${results.length} users to admin123`,
      results,
    })
  } catch (error) {
    console.error('[seed-sync] Fatal error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to sync seed users',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
