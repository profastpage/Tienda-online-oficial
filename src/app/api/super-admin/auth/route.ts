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

    const superEmail = process.env.SUPER_ADMIN_EMAIL || 'profastpage@gmail.com'
    // Get hash - validate it wasn't corrupted by env variable expansion
    // (Next.js @next/env expands $VAR references, corrupting bcrypt hashes)
    let superPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH || '$2b$12$kE/z56LAyqZ.FeyrLaBFju/ryRX3BRSSiji19BB3rUWvJS8YU3wiy'
    const FALLBACK_HASH = '$2b$12$kE/z56LAyqZ.FeyrLaBFju/ryRX3BRSSiji19BB3rUWvJS8YU3wiy'
    if (!superPasswordHash.startsWith('$2b$') || superPasswordHash.length < 55) {
      superPasswordHash = FALLBACK_HASH
    }
    const superSecret = process.env.SUPER_ADMIN_SECRET || '46a175d2f1801e73d6944abe8cd28a01c393e33eb0c19e7e863b9e0aa0c84d84'

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
