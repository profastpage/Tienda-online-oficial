import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    const user = await db.storeUser.findUnique({
      where: { id: userId },
      include: { store: true },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, storeId: true, store: { select: { name: true, slug: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
