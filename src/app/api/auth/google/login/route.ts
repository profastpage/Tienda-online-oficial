import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { signToken, hashPassword } from '@/lib/auth'
import type { NextRequest } from 'next/server'

// Custom Google OAuth callback - creates or links user after NextAuth Google sign-in
export async function POST(request: NextRequest) {
  try {
    const { email, name, picture, googleId, action, storeName } = await request.json()

    if (!email || !googleId) {
      return NextResponse.json({ error: 'Datos de Google incompletos (email o ID faltante)' }, { status: 400 })
    }

    const db = await getDb()

    // Check if user already exists with this Google ID
    const existingByGoogleId = await db.storeUser.findFirst({
      where: { googleId },
      include: { store: true },
    })

    if (existingByGoogleId) {
      // User already linked with Google - just log them in
      const token = await signToken({
        userId: existingByGoogleId.id,
        email: existingByGoogleId.email,
        role: existingByGoogleId.role,
        storeId: existingByGoogleId.storeId,
      })

      const response = NextResponse.json({
        id: existingByGoogleId.id,
        email: existingByGoogleId.email,
        name: existingByGoogleId.name,
        phone: existingByGoogleId.phone,
        address: existingByGoogleId.address,
        role: existingByGoogleId.role,
        storeId: existingByGoogleId.storeId,
        storeName: existingByGoogleId.store.name,
        storeSlug: existingByGoogleId.store.slug,
        avatar: existingByGoogleId.avatar || picture || '',
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
    }

    // Check if user exists with this email (link Google account)
    const existingByEmail = await db.storeUser.findFirst({
      where: { email },
      include: { store: true },
    })

    if (existingByEmail) {
      // Link Google account to existing user
      await db.storeUser.update({
        where: { id: existingByEmail.id },
        data: {
          googleId,
          avatar: picture || existingByEmail.avatar,
        },
      })

      const token = await signToken({
        userId: existingByEmail.id,
        email: existingByEmail.email,
        role: existingByEmail.role,
        storeId: existingByEmail.storeId,
      })

      const response = NextResponse.json({
        id: existingByEmail.id,
        email: existingByEmail.email,
        name: existingByEmail.name,
        phone: existingByEmail.phone,
        address: existingByEmail.address,
        role: existingByEmail.role,
        storeId: existingByEmail.storeId,
        storeName: existingByEmail.store.name,
        storeSlug: existingByEmail.store.slug,
        avatar: existingByEmail.avatar || picture || '',
        token,
        linked: true, // Indicates Google was linked to existing account
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

    // New user - create account
    if (action === 'register-admin' && storeName) {
      // Create new store + admin user
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Check if slug already exists
      const existingStore = await db.store.findUnique({ where: { slug } })
      if (existingStore) {
        return NextResponse.json(
          { error: 'Ya existe una tienda con ese nombre. Intenta con otro.' },
          { status: 409 }
        )
      }

      const store = await db.store.create({
        data: {
          name: storeName,
          slug,
          whatsappNumber: '',
          plan: 'gratis',
          approvalStatus: 'pending',
          isActive: false,
        },
      })

      // Generate a random password for Google users (they won't use it, but field is required)
      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const hashedPassword = await hashPassword(randomPassword)

      const user = await db.storeUser.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          phone: '',
          address: '',
          role: 'admin',
          storeId: store.id,
          googleId,
          avatar: picture || '',
        },
      })

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      })

      const response = NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        storeId: user.storeId,
        storeName: store.name,
        storeSlug: store.slug,
        avatar: user.avatar || picture || '',
        token,
        isNewUser: true,
        approvalStatus: 'pending',
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

    // Default: create customer user (register-customer action or no action specified)
    if (action === 'register-customer' || action === 'login') {
      // Find first active store for customer
      let targetStore = await db.store.findFirst({ where: { isActive: true } })

      if (!targetStore) {
        // Create default store if none exists
        targetStore = await db.store.create({
          data: {
            name: 'Mi Tienda',
            slug: 'mi-tienda',
            whatsappNumber: '',
            plan: 'basico',
          },
        })
      }

      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const hashedPassword = await hashPassword(randomPassword)

      const user = await db.storeUser.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          phone: '',
          address: '',
          role: 'customer',
          storeId: targetStore.id,
          googleId,
          avatar: picture || '',
        },
      })

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      })

      const response = NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        storeId: user.storeId,
        storeName: targetStore.name,
        storeSlug: targetStore.slug,
        avatar: user.avatar || picture || '',
        token,
        isNewUser: true,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[google/login] Error:', message, error)

    // Return specific error messages for common issues
    if (message.includes('Unique constraint') || message.includes('unique')) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email. Intenta iniciar sesión.' },
        { status: 409 }
      )
    }
    if (message.includes('Database') || message.includes('db') || message.includes('connect')) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos. Intenta de nuevo en unos segundos.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: `Error al autenticar con Google: ${message}` },
      { status: 500 }
    )
  }
}
