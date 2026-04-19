import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signToken, hashPassword, rateLimit, getClientIp } from '@/lib/auth'
import { ensureStoreExists, findStoreBySlug } from '@/lib/store-helpers'

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
        const existingStore = await findStoreBySlug(db, slug)
        if (existingStore) {
          slug = `${slug}-${Date.now().toString(36)}`
        }
        storeSlugStr = slug

        // Generate store ID
        storeId = `store_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const now = new Date().toISOString()

        // Create store using raw SQL (more robust than Prisma ORM)
        try {
          await db.$executeRaw`
            INSERT INTO Store (id, name, slug, whatsappNumber, address, description, logo, isActive, plan, createdAt, updatedAt)
            VALUES (${storeId}, ${storeName}, ${slug}, ${phone || ''}, ${address || ''}, '', '', 1, ${plan || 'basico'}, ${now}, ${now})
          `
          console.log(`[register] Created store ${storeId} (${storeName})`)
        } catch (storeError) {
          console.error('[register] Store creation failed:', storeError instanceof Error ? storeError.message : storeError)
          return NextResponse.json(
            { error: 'Error al crear la tienda. Intenta de nuevo.' },
            { status: 500 }
          )
        }
      } else {
        // For customers, find an existing store
        const stores = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
          SELECT id, name, slug FROM Store WHERE isActive = 1 LIMIT 1
        `
        
        if (stores && stores.length > 0) {
          storeId = stores[0].id
          storeNameStr = stores[0].name
          storeSlugStr = stores[0].slug
        } else {
          // Auto-create the default store if none exists
          console.log('[register] No store found, creating default store...')
          const createdStore = await ensureStoreExists(db, SEED_STORE.id)
          if (createdStore) {
            storeId = createdStore.id
            storeNameStr = createdStore.name
            storeSlugStr = createdStore.slug
          } else {
            return NextResponse.json(
              { error: 'Error al crear tienda por defecto' },
              { status: 500 }
            )
          }
        }
      }

      // Check if user already exists using raw SQL
      const existingUsers = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM StoreUser WHERE email = ${email} AND storeId = ${storeId}
      `
      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
      }

      const hashedPassword = await hashPassword(password)

      // Create user using raw SQL
      const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const userNow = new Date().toISOString()
      
      await db.$executeRaw`
        INSERT INTO StoreUser (id, email, password, name, phone, address, role, storeId, avatar, createdAt, updatedAt)
        VALUES (${userId}, ${email}, ${hashedPassword}, ${name}, ${phone || ''}, ${address || ''}, ${role}, ${storeId}, '', ${userNow}, ${userNow})
      `

      // Generate JWT token
      const token = await signToken({
        userId: userId,
        email: email,
        role: role,
        storeId: storeId,
      })

      const response = NextResponse.json({
        id: userId,
        email: email,
        name: name,
        phone: phone || '',
        address: address || '',
        role: role,
        storeId: storeId,
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
