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

    // Build where conditions
    const conditions: string[] = [`storeId = '${store.id}'`, `inStock = 1`]
    let categoryIdFilter: string | null = null
    
    if (categorySlug) {
      // Find category ID by slug
      const category = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM Category WHERE slug = ${categorySlug} AND storeId = ${store.id}
      `
      if (category.length > 0) {
        categoryIdFilter = category[0].id
        conditions.push(`categoryId = '${categoryIdFilter}'`)
      }
    }
    
    if (featured === 'true') {
      conditions.push(`isFeatured = 1`)
    }
    
    if (search) {
      const sanitizedSearch = search.replace(/'/g, "''")
      conditions.push(`(name LIKE '%${sanitizedSearch}%' OR description LIKE '%${sanitizedSearch}%')`)
    }

    // Get products using raw SQL with unsafe for dynamic conditions
    const query = `SELECT id, name, slug, description, price, comparePrice, image, images, sizes, colors, discount, isNew, rating, reviewCount, inStock, categoryId FROM Product WHERE ${conditions.join(' AND ')} ORDER BY createdAt DESC`
    
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
    }[]>(query)

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
