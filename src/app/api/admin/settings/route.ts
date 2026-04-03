import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    const store = await db.store.findUnique({ where: { id: storeId } })
    return NextResponse.json(store)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, whatsappNumber, address, logo } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

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
