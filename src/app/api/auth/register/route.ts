import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    if (!rateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

    const db = await getDb()
    const { email, password, name, phone, address, role, storeName, plan } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, contraseña y nombre son requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    let storeId = ''
    let storeNameStr = ''

    if (role === 'admin') {
      if (!storeName) {
        return NextResponse.json({ error: 'Nombre de tienda requerido' }, { status: 400 })
      }
      storeNameStr = storeName
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const store = await db.store.create({
        data: { name: storeName, slug, whatsappNumber: phone || '', plan: plan || 'basico' },
      })
      storeId = store.id
    } else {
      const store = await db.store.findFirst({ where: { isActive: true } })
      if (!store) {
        return NextResponse.json({ error: 'No hay tienda disponible' }, { status: 400 })
      }
      storeId = store.id
    }

    const existing = await db.storeUser.findUnique({ where: { email_storeId: { email, storeId } } })
    if (existing) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.storeUser.create({
      data: { email, password: hashedPassword, name, phone: phone || '', address: address || '', role, storeId },
    })

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    })

    const response = NextResponse.json({
      id: user.id, email: user.email, name: user.name, role: user.role,
      storeId: user.storeId, storeName: storeNameStr || 'Tienda', token,
    })

    // Set token as HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[register] Error:', error)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }
}
