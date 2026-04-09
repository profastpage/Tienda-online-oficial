import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { verifyTwoFactorCode } from '@/lib/two-factor'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y código requeridos' }, { status: 400 })
    }

    // Check for super admin with 2FA
    const superEmail = process.env.SUPER_ADMIN_EMAIL || 'profastpage@gmail.com'
    const superAdmin2FASecret = process.env.SUPER_ADMIN_2FA_SECRET

    if (email === superEmail && superAdmin2FASecret) {
      const isValid = verifyTwoFactorCode(superAdmin2FASecret, code)
      if (!isValid) {
        return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
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

      const superSecret = process.env.SUPER_ADMIN_SECRET || '46a175d2f1801e73d6944abe8cd28a01c393e33eb0c19e7e863b9e0aa0c84d84'
      response.cookies.set('super-admin-token', superSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })

      return response
    }

    // Check DB users with 2FA
    const db = await getDb()
    const users = await db.storeUser.findMany({
      where: { email },
      include: { store: true },
    })

    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const matchedUser = users.find(u => u.twoFactorEnabled && u.twoFactorSecret)

    if (!matchedUser || !matchedUser.twoFactorSecret) {
      return NextResponse.json({ error: 'Usuario no tiene 2FA habilitado' }, { status: 400 })
    }

    const isValid = verifyTwoFactorCode(matchedUser.twoFactorSecret, code)
    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
    }

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

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[2fa/verify-login] Error:', error)
    return NextResponse.json(
      { error: 'Error al verificar autenticación en dos pasos' },
      { status: 500 }
    )
  }
}
