import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const user = await db.storeUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { id, name, phone, address } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    const user = await db.storeUser.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, address: true, role: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
