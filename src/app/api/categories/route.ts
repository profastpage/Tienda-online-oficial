import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { seedCategories } from '@/lib/seed-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store') || 'urban-store'

    // Try database first
    try {
      const db = await getDb()

      const store = await db.store.findUnique({ where: { slug: storeSlug } })
      if (store) {
        const categories = await db.category.findMany({
          where: { storeId: store.id },
          include: { _count: { select: { products: true } } },
          orderBy: { sortOrder: 'asc' },
        })

        if (categories.length > 0) {
          return NextResponse.json(categories)
        }
      }
    } catch (dbError) {
      console.warn('[api/categories] Database unavailable, using seed data fallback:', dbError)
    }

    // Fallback to seed data
    return NextResponse.json(seedCategories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
