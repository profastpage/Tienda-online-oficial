import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store') || 'urban-store'

    const store = await db.store.findUnique({ where: { slug: storeSlug } })
    if (!store) return NextResponse.json([])

    const categories = await db.category.findMany({
      where: { storeId: store.id },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
