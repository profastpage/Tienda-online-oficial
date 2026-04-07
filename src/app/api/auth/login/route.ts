import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, comparePassword, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

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

    const db = await getDb()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // Find user across all stores
    const users = await db.storeUser.findMany({ where: { email }, include: { store: true } })

    let matchedUser: typeof users[0] | null = null

    for (const user of users) {
      // Try bcrypt comparison first
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

    if (!matchedUser) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // If user has plaintext password, auto-migrate to bcrypt hash
    if (!matchedUser.password.startsWith('$2')) {
      await db.storeUser.update({
        where: { id: matchedUser.id },
        data: { password: await hashPassword(password) },
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
  } catch {
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
