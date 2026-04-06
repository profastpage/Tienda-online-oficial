import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // Find user across all stores
    const users = await db.storeUser.findMany({ where: { email }, include: { store: true } })

    // Check password with bcrypt (supports both hashed and plaintext for backward compat)
    const bcrypt = await import('bcryptjs')
    let matchedUser: typeof users[0] | null = null

    for (const user of users) {
      // Try bcrypt comparison first
      const isBcryptHash = user.password.startsWith('$2')
      if (isBcryptHash) {
        const isValid = await bcrypt.compare(password, user.password)
        if (isValid) {
          matchedUser = user
          break
        }
      } else {
        // Legacy: plaintext comparison
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
      const hashedPassword = await bcrypt.hash(password, 12)
      await db.storeUser.update({
        where: { id: matchedUser.id },
        data: { password: hashedPassword },
      })
    }

    return NextResponse.json({
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      phone: matchedUser.phone,
      address: matchedUser.address,
      role: matchedUser.role,
      storeId: matchedUser.storeId,
      storeName: matchedUser.store.name,
      storeSlug: matchedUser.store.slug,
    })
  } catch {
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
