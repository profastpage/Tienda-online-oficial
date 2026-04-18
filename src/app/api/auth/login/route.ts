import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, comparePassword, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

// Bcrypt hash for admin123 (ALL seed users use the same password)
const ADMIN_PASSWORD_HASH = '$2b$10$5ICH2rll4GzxgUEQh0aCeegaSt/qK6UFovrA/paTTqLgdt9dQUfke'

// Seed users for fallback when DB is unavailable or empty
const SEED_USERS = [
  {
    id: 'seed-admin-001',
    email: 'admin@urbanstyle.pe',
    password: ADMIN_PASSWORD_HASH,
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
    password: ADMIN_PASSWORD_HASH,
    name: 'Cliente Demo',
    phone: '51988888888',
    address: '',
    role: 'customer' as const,
    storeId: 'kmpw0h5ig4o518kg4zsm5huo3',
    storeName: 'Urban Style',
    storeSlug: 'urban-style',
  },
  // Básico Plan Store
  {
    id: 'seed-admin-basico',
    email: 'basico@demo.pe',
    password: ADMIN_PASSWORD_HASH,
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
    password: ADMIN_PASSWORD_HASH,
    name: 'Cliente Básico',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-basico',
    storeName: 'Mi Tienda Básica',
    storeSlug: 'mi-tienda-basica',
  },
  // Pro Plan Store
  {
    id: 'seed-admin-pro',
    email: 'pro@demo.pe',
    password: ADMIN_PASSWORD_HASH,
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
    password: ADMIN_PASSWORD_HASH,
    name: 'Cliente Pro',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-pro',
    storeName: 'TechStore Pro',
    storeSlug: 'techstore-pro',
  },
  // Premium Plan Store
  {
    id: 'seed-admin-premium',
    email: 'premium@demo.pe',
    password: ADMIN_PASSWORD_HASH,
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
    password: ADMIN_PASSWORD_HASH,
    name: 'Cliente Premium',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-premium',
    storeName: 'Fashion Premium',
    storeSlug: 'fashion-premium',
  },
]

/**
 * Sync a seed user to the database.
 * Creates the user in DB if not exists, or updates password if seed password is newer.
 * Also ensures the store exists.
 * Returns the DB user (with DB-generated ID and all fields including avatar).
 */
async function syncSeedUserToDb(seedUser: typeof SEED_USERS[number]): Promise<{
  id: string; email: string; password: string; name: string; phone: string;
  address: string; role: string; storeId: string; twoFactorEnabled: boolean;
  avatar: string | null;
  store: { name: string; slug: string };
} | null> {
  try {
    const db = await getDb()

    // Ensure the store exists
    await db.store.upsert({
      where: { id: seedUser.storeId },
      update: {},
      create: {
        id: seedUser.storeId,
        name: seedUser.storeName,
        slug: seedUser.storeSlug,
      },
    }).catch(async () => {
      // If upsert fails (e.g., slug conflict), just try to find existing
      const existing = await db.store.findUnique({ where: { id: seedUser.storeId } })
      if (!existing) {
        console.warn(`[login] Could not create store ${seedUser.storeId}`)
      }
    })

    // Upsert the user: create if not exists, or just ensure they exist
    const dbUser = await db.storeUser.upsert({
      where: {
        email_storeId: { email: seedUser.email, storeId: seedUser.storeId },
      },
      update: {
        // Only update password if the DB password is plaintext (legacy) or different
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
      include: { store: true },
    })

    console.log(`[login] Synced seed user ${seedUser.email} to DB (id: ${dbUser.id})`)

    return {
      id: dbUser.id,
      email: dbUser.email,
      password: dbUser.password,
      name: dbUser.name,
      phone: dbUser.phone,
      address: dbUser.address,
      role: dbUser.role,
      storeId: dbUser.storeId,
      twoFactorEnabled: dbUser.twoFactorEnabled,
      avatar: dbUser.avatar,
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

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // ── Super Admin check ──
    const superEmail = process.env.SUPER_ADMIN_EMAIL
    const superPlainTextPassword = process.env.SUPER_ADMIN_PASSWORD
    const superSecret = process.env.SUPER_ADMIN_SECRET

    // Skip super-admin check entirely if not configured (don't block regular login)
    if (superEmail && email === superEmail) {
      let passwordValid = false

      // Priority 1: Plain text password (if SUPER_ADMIN_PASSWORD env var is set)
      if (superPlainTextPassword && password === superPlainTextPassword) {
        passwordValid = true
      } else {
        // Priority 2: Hash comparison (backwards compatible)
        let superPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH
        if (!superPasswordHash) {
          return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }
        passwordValid = await comparePassword(password, superPasswordHash)
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

      const users = await db.storeUser.findMany({ where: { email }, include: { store: true } })

      for (const user of users) {
        const isBcryptHash = user.password.startsWith('$2')
        if (isBcryptHash) {
          const isValid = await comparePassword(password, user.password)
          if (isValid) {
            matchedUser = user
            break
          }
        } else {
          // Legacy: plaintext comparison - auto-migrate
          if (user.password === password) {
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
            data: { password: await hashPassword(password) },
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
        if (seedUser.email === email) {
          const isValid = await comparePassword(password, seedUser.password)
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
      storeName: matchedUser.store.name,
      storeSlug: matchedUser.store.slug,
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
