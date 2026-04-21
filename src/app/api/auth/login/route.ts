import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, comparePassword, hashPassword, rateLimit, getClientIp } from '@/lib/auth'
import { ensureStoreExists, STORE_SAFE_FIELDS } from '@/lib/store-helpers'
import { validateRequest, loginSchema } from '@/lib/validations'

// Seed users are ONLY available in development mode for testing
// In production, all credentials must be in the database
const IS_DEV = process.env.NODE_ENV !== 'production'

// Bcrypt hash for demo password (development only)
const DEMO_PASSWORD_HASH = IS_DEV ? '$2b$10$5ICH2rll4GzxgUEQh0aCeegaSt/qK6UFovrA/paTTqLgdt9dQUfke' : ''

// Seed users for development/testing ONLY — disabled in production
const SEED_USERS = IS_DEV ? [
  {
    id: 'seed-admin-001',
    email: 'admin@urbanstyle.pe',
    password: DEMO_PASSWORD_HASH,
    name: 'Admin Urban Style',
    phone: '51999999999',
    address: '',
    role: 'admin' as const,
    storeId: 'kmpw0h5ig4o518kg4zsm5huo3',
    storeName: 'Urban Style',
    storeSlug: 'urban-style',
  },
  {
    id: 'seed-client-001',
    email: 'cliente@email.com',
    password: DEMO_PASSWORD_HASH,
    name: 'Cliente Demo',
    phone: '51988888888',
    address: '',
    role: 'customer' as const,
    storeId: 'kmpw0h5ig4o518kg4zsm5huo3',
    storeName: 'Urban Style',
    storeSlug: 'urban-style',
  },
  {
    id: 'seed-admin-basico',
    email: 'basico@demo.pe',
    password: DEMO_PASSWORD_HASH,
    name: 'Carlos Básico',
    phone: '51999999991',
    address: '',
    role: 'admin' as const,
    storeId: 'seed-store-basico',
    storeName: 'Mi Tienda Básica',
    storeSlug: 'mi-tienda-basica',
  },
  {
    id: 'seed-cliente-basico',
    email: 'basico@cliente.com',
    password: DEMO_PASSWORD_HASH,
    name: 'Cliente Básico',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-basico',
    storeName: 'Mi Tienda Básica',
    storeSlug: 'mi-tienda-basica',
  },
  {
    id: 'seed-admin-pro',
    email: 'pro@demo.pe',
    password: DEMO_PASSWORD_HASH,
    name: 'María Pro',
    phone: '51999999992',
    address: '',
    role: 'admin' as const,
    storeId: 'seed-store-pro',
    storeName: 'TechStore Pro',
    storeSlug: 'techstore-pro',
  },
  {
    id: 'seed-cliente-pro',
    email: 'pro@cliente.com',
    password: DEMO_PASSWORD_HASH,
    name: 'Cliente Pro',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-pro',
    storeName: 'TechStore Pro',
    storeSlug: 'techstore-pro',
  },
  {
    id: 'seed-admin-premium',
    email: 'premium@demo.pe',
    password: DEMO_PASSWORD_HASH,
    name: 'Ana Premium',
    phone: '51999999993',
    address: '',
    role: 'admin' as const,
    storeId: 'seed-store-premium',
    storeName: 'Fashion Premium',
    storeSlug: 'fashion-premium',
  },
  {
    id: 'seed-cliente-premium',
    email: 'premium@cliente.com',
    password: DEMO_PASSWORD_HASH,
    name: 'Cliente Premium',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-premium',
    storeName: 'Fashion Premium',
    storeSlug: 'fashion-premium',
  },
] : []

/**
 * Sync a seed user to the database (development only).
 * In production, this function returns null immediately.
 */
async function syncSeedUserToDb(seedUser: typeof SEED_USERS[number]): Promise<{
  id: string; email: string; password: string; name: string; phone: string;
  address: string; role: string; storeId: string; twoFactorEnabled: boolean;
  avatar: string | null;
  store: { name: string; slug: string };
} | null> {
  if (!IS_DEV) return null
  try {
    const db = await getDb()
    await ensureStoreExists(db, seedUser.storeId)
    const dbUser = await db.storeUser.upsert({
      where: {
        email_storeId: { email: seedUser.email, storeId: seedUser.storeId },
      },
      update: {
        password: seedUser.password,
      },
      create: {
        email: seedUser.email,
        password: seedUser.password,
        name: seedUser.name,
        phone: seedUser.phone,
        address: seedUser.address,
        role: seedUser.role,
        storeId: seedUser.storeId,
        avatar: '',
      },
      include: { store: { select: { name: true, slug: true } } },
    })
    return {
      id: dbUser.id, email: dbUser.email, password: dbUser.password,
      name: dbUser.name, phone: dbUser.phone, address: dbUser.address,
      role: dbUser.role, storeId: dbUser.storeId,
      twoFactorEnabled: dbUser.twoFactorEnabled, avatar: dbUser.avatar,
      store: { name: dbUser.store.name, slug: dbUser.store.slug },
    }
  } catch (err) {
    console.error('[login] Failed to sync seed user to DB:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    if (!rateLimit(ip, 10, 60000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    const validation = validateRequest(loginSchema, { email, password })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const { email: validEmail, password: validPassword } = validation.data

    // ── Super Admin check ──
    const superEmail = process.env.SUPER_ADMIN_EMAIL
    const superPlainTextPassword = process.env.SUPER_ADMIN_PASSWORD
    const superSecret = process.env.SUPER_ADMIN_SECRET

    // Skip super-admin check entirely if not configured (don't block regular login)
    if (superEmail && validEmail === superEmail) {
      let passwordValid = false

      // Priority 1: Plain text password (if SUPER_ADMIN_PASSWORD env var is set)
      if (superPlainTextPassword && validPassword === superPlainTextPassword) {
        passwordValid = true
      } else {
        // Priority 2: Hash comparison (backwards compatible)
        let superPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH
        if (!superPasswordHash) {
          return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }
        passwordValid = await comparePassword(validPassword, superPasswordHash)
      }

      if (!passwordValid) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
      }

      // Check if super admin has 2FA enabled
      const superAdmin2FASecret = process.env.SUPER_ADMIN_2FA_SECRET
      if (superAdmin2FASecret) {
        return NextResponse.json({
          requires2FA: true,
          email: superEmail,
          role: 'super-admin',
          storeId: '__super_admin__',
          name: 'Super Administrador',
        })
      }

      const token = await signToken({
        userId: 'super-admin-001',
        email: superEmail,
        role: 'super-admin',
        storeId: '__super_admin__',
      })
      const response = NextResponse.json({
        id: 'super-admin-001',
        email: superEmail,
        name: 'Super Administrador',
        phone: '',
        address: '',
        role: 'super-admin',
        storeId: '__super_admin__',
        storeName: 'Super Admin',
        storeSlug: 'super-admin',
        avatar: '',
        token,
      })
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      if (superSecret) {
        response.cookies.set('super-admin-token', superSecret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        })
      }
      return response
    }

    let matchedUser: {
      id: string
      email: string
      password: string
      name: string
      phone: string
      address: string
      role: string
      storeId: string
      twoFactorEnabled: boolean
      avatar?: string | null
      store: { name: string; slug: string }
    } | null = null

    let usedSeedFallback = false

    // Try database first
    try {
      const db = await getDb()

      const users = await db.storeUser.findMany({ 
        where: { email: validEmail }, 
        include: { store: { select: { name: true, slug: true } } } 
      })

      for (const user of users) {
        const isBcryptHash = user.password.startsWith('$2')
        if (isBcryptHash) {
          const isValid = await comparePassword(validPassword, user.password)
          if (isValid) {
            matchedUser = user
            break
          }
        } else {
          // Legacy: plaintext comparison - auto-migrate
          if (user.password === validPassword) {
            matchedUser = user
            break
          }
        }
      }

      // If user found with plaintext password, auto-migrate to bcrypt
      if (matchedUser && !matchedUser.password.startsWith('$2')) {
        try {
          const db2 = await getDb()
          await db2.storeUser.update({
            where: { id: matchedUser.id },
            data: { password: await hashPassword(validPassword) },
          })
        } catch (migrationError) {
          console.warn('[login] Auto-migration to bcrypt failed:', migrationError)
        }
      }
    } catch (dbError) {
      console.warn('[login] Database unavailable, using seed fallback:', dbError)
    }

    // Fallback to seed users if DB didn't find a match
    if (!matchedUser) {
      for (const seedUser of SEED_USERS) {
        if (seedUser.email === validEmail) {
          const isValid = await comparePassword(validPassword, seedUser.password)
          if (isValid) {
            usedSeedFallback = true

            // CRITICAL: Sync seed user to DB so profile updates persist
            // This creates the user in DB (if not exists) or returns existing DB user
            const syncedUser = await syncSeedUserToDb(seedUser)
            if (syncedUser) {
              matchedUser = syncedUser
            } else {
              // DB sync failed, use seed data as last resort
              matchedUser = {
                ...seedUser,
                twoFactorEnabled: false,
                avatar: null,
                store: { name: seedUser.storeName, slug: seedUser.storeSlug },
              }
            }
            break
          }
        }
      }
    }

    // FORCE-SYNC: After successful login, always ensure user exists in DB
    // This handles the case where DB-first login succeeded but the user record
    // might not be properly synced (e.g., after DB reset)
    if (matchedUser && !usedSeedFallback) {
      try {
        const db = await getDb()
        const existingUser = await db.storeUser.findUnique({
          where: { id: matchedUser.id },
          select: { id: true },
        })
        if (!existingUser) {
          console.warn(`[login] User ${matchedUser.id} logged in from DB but record missing, force-creating...`)
          // Find matching seed to force-sync
          const seedMatch = SEED_USERS.find(s => s.email === matchedUser!.email)
          if (seedMatch) {
            const synced = await syncSeedUserToDb(seedMatch)
            if (synced) {
              // Update matchedUser with the DB-synced ID and data
              matchedUser = {
                ...synced,
                store: { name: synced.store.name, slug: synced.store.slug },
              }
            }
          }
        }
      } catch (syncError) {
        console.warn('[login] Force-sync check failed:', syncError instanceof Error ? syncError.message : syncError)
      }
    }

    // Ensure store data exists (auto-repair if store was deleted)
    if (matchedUser && !matchedUser.store) {
      console.warn(`[login] User ${matchedUser.id} has no store, auto-creating...`)
      try {
        const db = await getDb()
        await ensureStoreExists(db, matchedUser.storeId)
        // Get the store info
        const store = await db.store.findUnique({
          where: { id: matchedUser.storeId },
          select: { name: true, slug: true },
        })
        matchedUser = { ...matchedUser, store: store || { name: 'Mi Tienda', slug: 'tienda' } }
      } catch (repairErr) {
        console.error('[login] Auto-repair store failed:', repairErr)
        matchedUser = { ...matchedUser, store: { name: 'Mi Tienda', slug: 'tienda' } }
      }
    }

    if (!matchedUser) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Check if user has 2FA enabled
    if (matchedUser.twoFactorEnabled) {
      return NextResponse.json({
        requires2FA: true,
        email: matchedUser.email,
        role: matchedUser.role,
        storeId: matchedUser.storeId,
        name: matchedUser.name,
      })
    }

    // Generate JWT token
    const token = await signToken({
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      storeId: matchedUser.storeId,
    })

    const response = NextResponse.json({
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      phone: matchedUser.phone,
      address: matchedUser.address,
      role: matchedUser.role,
      storeId: matchedUser.storeId,
      storeName: matchedUser.store?.name || 'Mi Tienda',
      storeSlug: matchedUser.store?.slug || 'tienda',
      avatar: matchedUser.avatar || '',
      token,
    })

    // Set token as HTTP-only cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[login] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
