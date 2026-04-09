import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth, verifyUserOwnership } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify user can only access their own profile
    const ownership = await verifyUserOwnership(request, userId)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    const user = await db.storeUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { id, name, phone, address, avatar } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify user can only update their own profile
    const ownership = await verifyUserOwnership(request, id)
    if (!ownership.authorized) return ownership.error

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await db.storeUser.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
