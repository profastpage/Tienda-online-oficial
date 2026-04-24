import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store') || 'urban-store'

    const db = await getDb()

    // Find store by slug using raw SQL (compatible with Turso adapter)
    const stores = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM Store WHERE slug = ${storeSlug}
    `
    const store = stores[0] || null
    if (!store) {
      console.log('[api/categories] Store not found:', storeSlug)
      return NextResponse.json([])
    }

    // Get categories with product counts using raw SQL
    const categories = await db.$queryRaw<{
      id: string
      name: string
      slug: string
      image: string
      sortOrder: number
      storeId: string
      productCount: number
    }[]>`
      SELECT 
        c.id, c.name, c.slug, c.image, c.sortOrder, c.storeId,
        (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id AND p.inStock = 1) as productCount
      FROM Category c
      WHERE c.storeId = ${store.id}
      ORDER BY c.sortOrder ASC
    `

    // Transform to match expected format with _count
    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      sortOrder: cat.sortOrder,
      storeId: cat.storeId,
      _count: { products: cat.productCount || 0 }
    }))

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('[api/categories] Error:', error)
    return NextResponse.json([])
  }
}
