import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const storeSlug = searchParams.get('store') || 'urban-store'

    const db = await getDb()

    // Find store by slug
    const store = await db.store.findUnique({ where: { slug: storeSlug } })
    if (!store) {
      console.log('[api/products] Store not found:', storeSlug)
      return NextResponse.json([])
    }

    // Build where conditions using parameterized queries
    let whereClause = 'storeId = ? AND inStock = 1'
    let queryParams: any[] = [store.id]
    let categoryIdFilter: string | null = null
    
    if (categorySlug) {
      // Find category ID by slug
      const category = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM Category WHERE slug = ${categorySlug} AND storeId = ${store.id}
      `
      if (category.length > 0) {
        categoryIdFilter = category[0].id
        whereClause += ' AND categoryId = ?'
        queryParams.push(categoryIdFilter)
      }
    }
    
    if (featured === 'true') {
      whereClause += ' AND isFeatured = 1'
    }
    
    if (search) {
      const sanitizedSearch = `%${search.replace(/'/g, "''")}%`
      whereClause += ' AND (name LIKE ? OR description LIKE ?)'
      queryParams.push(sanitizedSearch, sanitizedSearch)
    }

    // Get products using parameterized query
    const query = `SELECT id, name, slug, description, price, comparePrice, image, images, sizes, colors, discount, isNew, rating, reviewCount, inStock, categoryId FROM Product WHERE ${whereClause} ORDER BY createdAt DESC`
    
    const products = await db.$queryRawUnsafe<{
      id: string
      name: string
      slug: string
      description: string
      price: number
      comparePrice: number | null
      image: string
      images: string
      sizes: string
      colors: string
      discount: number | null
      isNew: boolean
      rating: number
      reviewCount: number
      inStock: boolean
      categoryId: string
    }[]>(query, ...queryParams)

    // Fetch category info for each product
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        try {
          const cat = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
            SELECT id, name, slug FROM Category WHERE id = ${product.categoryId}
          `
          return {
            ...product,
            category: cat[0] || { name: 'Sin categoría', slug: 'sin-categoria' }
          }
        } catch {
          return {
            ...product,
            category: { name: 'Sin categoría', slug: 'sin-categoria' }
          }
        }
      })
    )

    return NextResponse.json(productsWithCategories)
  } catch (error) {
    console.error('[api/products] Error:', error)
    return NextResponse.json([])
  }
}
