import { NextResponse } from 'next/server'
import { comparePassword } from '@/lib/auth'
import { checkRateLimit } from '@/lib/api-auth'

export async function POST(request: Request) {
  try {
    // Rate limit protection
    if (!checkRateLimit(request, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const superEmail = process.env.SUPER_ADMIN_EMAIL
    const superPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH
    const superSecret = process.env.SUPER_ADMIN_SECRET

    if (!superEmail || !superPasswordHash || !superSecret) {
      return NextResponse.json({ error: 'Super admin not configured' }, { status: 503 })
    }

    // Verify email
    if (email !== superEmail) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Verify password
    const isValid = await comparePassword(password, superPasswordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Return the secret token
    const response = NextResponse.json({
      success: true,
      token: superSecret,
      email: superEmail,
    })

    // Set the super-admin-token cookie (different from auth-token)
    response.cookies.set('super-admin-token', superSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[super-admin/auth] Error:', error)
    return NextResponse.json({ error: 'Error al autenticar' }, { status: 500 })
  }
}
