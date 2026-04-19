import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, hashPassword, rateLimit, getClientIp } from '@/lib/auth'
import { ensureStoreExists, STORE_SAFE_FIELDS } from '@/lib/store-helpers'

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
    let storeSlugStr = ''

    try {
      const db = await getDb()

      if (role === 'admin') {
        if (!storeName) {
          return NextResponse.json({ error: 'Nombre de tienda requerido' }, { status: 400 })
        }
        storeNameStr = storeName
        let slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Ensure slug is unique (append random suffix if needed)
        const existingSlug = await db.store.findUnique({ where: { slug }, select: { id: true } })
        if (existingSlug) {
          slug = `${slug}-${Date.now().toString(36)}`
        }
        storeSlugStr = slug

        const store = await db.store.create({
          data: { name: storeName, slug, whatsappNumber: phone || '', plan: plan || 'basico' },
          select: { id: true, name: true, slug: true },
        })
        storeId = store.id
      } else {
        const store = await db.store.findFirst({ 
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        })
        if (!store) {
          // Auto-create the default store if none exists
          console.log('[register] No store found, creating default store...')
          await ensureStoreExists(db, SEED_STORE.id)
          storeId = SEED_STORE.id
          storeNameStr = SEED_STORE.name
          storeSlugStr = SEED_STORE.slug
        } else {
          storeId = store.id
          storeNameStr = store.name
          storeSlugStr = store.slug
        }
      }

      // Check if user already exists
      const existing = await db.storeUser.findUnique({ 
        where: { email_storeId: { email, storeId } },
        select: { id: true },
      })
      if (existing) {
        return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
      }

      const hashedPassword = await hashPassword(password)

      const user = await db.storeUser.create({
        data: { email, password: hashedPassword, name, phone: phone || '', address: address || '', role, storeId },
        select: { id: true, email: true, name: true, phone: true, address: true, role: true, storeId: true },
      })

      // Generate JWT token
      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      })

      // Get store data for response if not already fetched
      if (!storeNameStr || !storeSlugStr) {
        const storeData = await db.store.findUnique({ 
          where: { id: storeId },
          select: { name: true, slug: true },
        })
        storeNameStr = storeNameStr || storeData?.name || 'Tienda'
        storeSlugStr = storeSlugStr || storeData?.slug || 'tienda'
      }

      const response = NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        storeId: user.storeId,
        storeName: storeNameStr,
        storeSlug: storeSlugStr,
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

      return response
    } catch (dbError) {
      console.error('[register] Database error:', dbError instanceof Error ? dbError.message : dbError)
      return NextResponse.json(
        { error: 'Error de base de datos. Intenta de nuevo en unos segundos.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('[register] Error:', error)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }
}
