import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    // Verify the admin can only access their own store's data
    if (storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const store = await db.store.findUnique({ where: { id: storeId } })
    return NextResponse.json(store)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { id, name, description, whatsappNumber, address, logo } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify the admin can only update their own store
    if (id !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber
    if (address !== undefined) updateData.address = address
    if (logo !== undefined) updateData.logo = logo

    const store = await db.store.update({ where: { id }, data: updateData })
    return NextResponse.json(store)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
