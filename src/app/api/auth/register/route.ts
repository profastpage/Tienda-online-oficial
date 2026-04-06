import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const { email, password, name, phone, address, role, storeName } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, contraseña y nombre son requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
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
        data: { name: storeName, slug, whatsappNumber: phone || '' },
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

    // Hash password with bcrypt
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.storeUser.create({
      data: { email, password: hashedPassword, name, phone: phone || '', address: address || '', role, storeId },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, storeId: user.storeId, storeName: storeNameStr || 'Tienda' })
  } catch (error) {
    console.error('[register] Error:', error)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }
}
