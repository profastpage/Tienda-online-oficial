import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const db = await getDb()
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        whatsappNumber: true,
        address: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('[store/info] Error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al obtener informacion de la tienda', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
