import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Short revalidation — products change infrequently, 30s cache avoids cold starts
export const revalidate = 30

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const storeSlug = searchParams.get('store') || 'urban-store'

    const db = await getDb()

    // Find store by slug
    const stores = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM Store WHERE slug = ${storeSlug}
    `
    const store = stores[0] || null
    if (!store) {
      console.log('[api/products] Store not found:', storeSlug)
      return NextResponse.json([])
    }

    // Build WHERE clause with parameterized queries
    let whereClause = 'p.storeId = ? AND p.inStock = 1'
    let queryParams: any[] = [store.id]

    if (categorySlug) {
      whereClause += ' AND c.slug = ? AND c.storeId = ?'
      queryParams.push(categorySlug, store.id)
    }

    if (featured === 'true') {
      whereClause += ' AND p.isFeatured = 1'
    }

    if (search) {
      const sanitizedSearch = `%${search.replace(/'/g, "''")}%`
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      queryParams.push(sanitizedSearch, sanitizedSearch)
    }

    // Single JOIN query — eliminates N+1 (was 1 query per product for category)
    const query = `
      SELECT
        p.id, p.name, p.slug, p.description, p.price, p.comparePrice,
        p.image, p.images, p.sizes, p.colors, p.discount, p.isNew,
        p.rating, p.reviewCount, p.inStock, p.categoryId,
        c.id as "catId", c.name as "catName", c.slug as "catSlug"
      FROM Product p
      LEFT JOIN Category c ON c.id = p.categoryId
      WHERE ${whereClause}
      ORDER BY p.createdAt DESC
    `

    const rows = await db.$queryRawUnsafe<any[]>(query, ...queryParams)

    // Map rows to response shape — no extra DB queries
    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      comparePrice: row.comparePrice,
      image: row.image,
      images: row.images,
      sizes: row.sizes,
      colors: row.colors,
      discount: row.discount,
      isNew: row.isNew,
      rating: row.rating,
      reviewCount: row.reviewCount,
      inStock: row.inStock,
      categoryId: row.categoryId,
      category: row.catName
        ? { id: row.catId, name: row.catName, slug: row.catSlug }
        : { name: 'Sin categoría', slug: 'sin-categoria' },
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('[api/products] Error:', error)
    return NextResponse.json([])
  }
}
