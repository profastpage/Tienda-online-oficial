import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, comparePassword, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

// Bcrypt hash for demo123
const DEMO_PASSWORD_HASH = '$2b$10$Os0Gf3rq3gWmtX4by93Xt.8OdNP8MhStHW41jWTTkbWvIItXXCnf2'
// Bcrypt hash for cliente123
const CLIENTE_PASSWORD_HASH = '$2b$10$Xa/6CkIZADH0l5Kr296XNOoAm6nqYbnPPWETD4Dsmk0dYFjSwZImS'

// Seed users for fallback when DB is unavailable or empty
const SEED_USERS = [
  {
    id: 'seed-admin-001',
    email: 'admin@urbanstyle.pe',
    password: '$2b$10$GVQcWTi4dfqJoiLNcmp0EupYzPu2OO4GO1gWiUAoqvW9hcqpy9AAy',
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
    password: '$2b$10$7QKH/7wCqEt6J0ufdz8hG.qpjNeatsnuDZ3WCd/l0bDTONL1nx4aG',
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
    password: CLIENTE_PASSWORD_HASH,
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
    password: CLIENTE_PASSWORD_HASH,
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
    password: CLIENTE_PASSWORD_HASH,
    name: 'Cliente Premium',
    phone: '',
    address: '',
    role: 'customer' as const,
    storeId: 'seed-store-premium',
    storeName: 'Fashion Premium',
    storeSlug: 'fashion-premium',
  },
]

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
    const superEmail = process.env.SUPER_ADMIN_EMAIL || 'profastpage@gmail.com'
    // Validate hash wasn't corrupted by env variable expansion (Next.js @next/env expands $VAR)
    let superPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH || '$2b$12$HSt2fkyesYwooMV.9rHkZ.qe0Nrr9Xe2yEraiwN7Nh6kG9tUJhrYq'
    const SUPER_FALLBACK_HASH = '$2b$12$HSt2fkyesYwooMV.9rHkZ.qe0Nrr9Xe2yEraiwN7Nh6kG9tUJhrYq'
    if (!superPasswordHash.startsWith('$2b$') || superPasswordHash.length < 55) {
      superPasswordHash = SUPER_FALLBACK_HASH
    }
    const superSecret = process.env.SUPER_ADMIN_SECRET || '46a175d2f1801e73d6944abe8cd28a01c393e33eb0c19e7e863b9e0aa0c84d84'
    if (email === superEmail) {
      const isValid = await comparePassword(password, superPasswordHash)
      if (isValid) {
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
          token,
        })
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        response.cookies.set('super-admin-token', superSecret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        })
        return response
      }
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
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
      store: { name: string; slug: string }
    } | null = null

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
            matchedUser = {
              ...seedUser,
              twoFactorEnabled: false,
              store: { name: seedUser.storeName, slug: seedUser.storeSlug },
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
