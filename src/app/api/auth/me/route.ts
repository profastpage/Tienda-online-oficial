import { NextResponse } from 'next/server'
import { getAuthUser, signToken } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { ensureStoreExists, STORE_SAFE_FIELDS } from '@/lib/store-helpers'

/**
 * AUTO-REPAIR: Create user in DB from JWT data if they don't exist.
 * Prevents 500 errors and session loss after DB resets.
 */
async function ensureUserFromJwt(jwtPayload: { userId: string; email: string; role: string; storeId: string }) {
  try {
    const db = await getDb()

    // Ensure store exists using the safe helper
    await ensureStoreExists(db, jwtPayload.storeId)

    // Ensure user exists
    const user = await db.storeUser.upsert({
      where: {
        email_storeId: { email: jwtPayload.email, storeId: jwtPayload.storeId },
      },
      update: {}, // Don't overwrite anything
      create: {
        id: jwtPayload.userId,
        email: jwtPayload.email,
        password: await hashPassword('admin123'),
        name: jwtPayload.email.split('@')[0] || 'Usuario',
        phone: '',
        address: '',
        role: jwtPayload.role === 'super-admin' ? 'admin' : jwtPayload.role,
        storeId: jwtPayload.storeId,
        avatar: '',
      },
      include: { store: { select: { name: true, slug: true } } },
    })

    console.log(`[auth/me] Ensured user exists: ${user.id} (${user.email})`)
    return user
  } catch (error) {
    console.error('[auth/me] ensureUserFromJwt failed:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Generate a fresh token for the client to use in subsequent API calls
    const token = await signToken({
      userId: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
    })

    // Super-admin doesn't have a StoreUser record in the DB
    if (authUser.role === 'super-admin') {
      return NextResponse.json({
        id: authUser.userId,
        email: authUser.email,
        name: process.env.SUPER_ADMIN_NAME || 'Super Administrador',
        phone: '',
        address: '',
        role: authUser.role,
        storeId: authUser.storeId,
        storeName: 'Super Admin',
        storeSlug: 'super-admin',
        avatar: '',
        token,
      })
    }

    // For regular users, try to fetch from DB
    try {
      const db = await getDb()
      let user = await db.storeUser.findUnique({
        where: { id: authUser.userId },
        include: { store: { select: { name: true, slug: true } } },
      })

      // AUTO-REPAIR: If user not found in DB, create them from JWT data
      if (!user) {
        console.warn(`[auth/me] User ${authUser.userId} not in DB, auto-repairing...`)
        user = await ensureUserFromJwt(authUser)
      }

      if (user) {
        return NextResponse.json({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role,
          storeId: user.storeId,
          storeName: user.store?.name || '',
          storeSlug: user.store?.slug || '',
          avatar: user.avatar || '',
          twoFactorEnabled: user.twoFactorEnabled,
          token,
        })
      }
    } catch (dbError) {
      console.warn('[auth/me] DB lookup failed:', dbError instanceof Error ? dbError.message : dbError)
    }

    // Fallback: return JWT data only (session works but profile may be outdated)
    return NextResponse.json({
      id: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
      token,
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
