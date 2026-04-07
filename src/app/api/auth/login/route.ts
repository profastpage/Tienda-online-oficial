import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, comparePassword, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

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
    storeId: 'd1whgpglbzf8d42et5xp',
    storeName: 'Urban Store',
    storeSlug: 'urban-store',
  },
  {
    id: 'seed-client-001',
    email: 'cliente@email.com',
    password: '$2b$10$7QKH/7wCqEt6J0ufdz8hG.qpjNeatsnuDZ3WCd/l0bDTONL1nx4aG',
    name: 'Cliente Demo',
    phone: '51988888888',
    address: '',
    role: 'customer' as const,
    storeId: 'd1whgpglbzf8d42et5xp',
    storeName: 'Urban Store',
    storeSlug: 'urban-store',
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

    let matchedUser: {
      id: string
      email: string
      password: string
      name: string
      phone: string
      address: string
      role: string
      storeId: string
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
