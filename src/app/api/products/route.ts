import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { filterSeedProducts } from '@/lib/seed-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const storeSlug = searchParams.get('store') || 'urban-store'

    // Try database first
    try {
      const db = await getDb()

      const store = await db.store.findUnique({ where: { slug: storeSlug } })
      if (store) {
        const where: Record<string, unknown> = { storeId: store.id, inStock: true }

        if (category) {
          where.category = { slug: category }
        }
        if (featured === 'true') {
          where.isFeatured = true
        }
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
          ]
        }

        const products = await db.product.findMany({
          where,
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
        })

        if (products.length > 0) {
          return NextResponse.json(products)
        }
      }
    } catch (dbError) {
      console.warn('[api/products] Database unavailable, using seed data fallback:', dbError)
    }

    // Fallback to seed data
    const fallback = filterSeedProducts({ category, featured, search })
    return NextResponse.json(fallback)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
