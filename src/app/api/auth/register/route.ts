import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

// Default seed store for fallback when DB is empty
const SEED_STORE = {
  id: 'kmpw0h5ig4o518kg4zsm5huo3',
  name: 'Urban Style',
  slug: 'urban-style',
  whatsappNumber: '51999999999',
  plan: 'premium',
}

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
    let dbAvailable = true

    try {
      const db = await getDb()

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
          // Auto-create the default store if none exists
          console.log('[register] No store found, creating default store...')
          try {
            const store = await db.store.upsert({
              where: { slug: SEED_STORE.slug },
              update: { isActive: true },
              create: {
                id: SEED_STORE.id,
                name: SEED_STORE.name,
                slug: SEED_STORE.slug,
                whatsappNumber: SEED_STORE.whatsappNumber,
                plan: SEED_STORE.plan,
                isActive: true,
              },
            })
            storeId = store.id
          } catch (upsertError) {
            console.warn('[register] Store upsert failed:', upsertError)
            storeId = SEED_STORE.id
          }
        } else {
          storeId = store.id
        }
      }

      // Check if user already exists
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

      // Get store name for response
      const storeData = await db.store.findUnique({ where: { id: storeId } })
      const responseStoreName = storeNameStr || storeData?.name || 'Tienda'

      const response = NextResponse.json({
        id: user.id, email: user.email, name: user.name, role: user.role,
        storeId: user.storeId, storeName: responseStoreName, token,
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    } catch (dbError) {
      console.warn('[register] Database unavailable, using seed fallback:', dbError)
      dbAvailable = false
    }

    // Fallback for when DB is unavailable - still allow registration with seed store
    if (!dbAvailable) {
      if (role === 'admin') {
        if (!storeName) {
          return NextResponse.json({ error: 'Nombre de tienda requerido' }, { status: 400 })
        }
        storeNameStr = storeName
      }

      storeId = SEED_STORE.id

      // Generate JWT token with seed data
      const fakeUserId = 'user-' + Date.now()
      const token = await signToken({
        userId: fakeUserId,
        email,
        role,
        storeId,
      })

      const response = NextResponse.json({
        id: fakeUserId, email, name, role,
        storeId,
        storeName: storeNameStr || SEED_STORE.name,
        token,
        warning: 'La base de datos no está disponible. Los datos se perderán al recargar.',
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  } catch (error) {
    console.error('[register] Error:', error)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }
}
