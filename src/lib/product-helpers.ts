import { PrismaClient } from '@prisma/client'

// Product fields that are guaranteed to exist in the database
// This is important because Turso might have an older schema without all columns
export const PRODUCT_SAFE_FIELDS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  comparePrice: true,
  image: true,
  categoryId: true,
  storeId: true,
  isFeatured: true,
  isNew: true,
  discount: true,
  rating: true,
  reviewCount: true,
  inStock: true,
  createdAt: true,
  updatedAt: true,
} as const

// Fields for write operations (may include images, sizes, colors)
export const PRODUCT_WRITE_FIELDS = {
  ...PRODUCT_SAFE_FIELDS,
  images: true,
  sizes: true,
  colors: true,
} as const

export type ProductData = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  categoryId: string
  storeId: string
  isFeatured: boolean
  isNew: boolean
  discount: number | null
  rating: number
  reviewCount: number
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Get products for a store with safe fields only.
 * This avoids errors when the database schema doesn't have all columns.
 */
export async function getProductsByStore(
  db: PrismaClient,
  storeId: string
): Promise<ProductData[]> {
  try {
    // Try with full select first
    const products = await db.product.findMany({
      where: { storeId },
      select: {
        ...PRODUCT_SAFE_FIELDS,
        category: { select: { name: true, slug: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return products as ProductData[]
  } catch (error) {
    // If there's a schema mismatch, try without problematic fields
    console.warn('[product-helpers] Schema mismatch, using fallback query:', error instanceof Error ? error.message : error)
    
    // Use raw query as fallback
    const rawProducts = await db.$queryRaw`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE storeId = ${storeId}
      ORDER BY createdAt DESC
    ` as ProductData[]
    
    return rawProducts
  }
}

/**
 * Create a product with error handling for schema mismatches.
 */
export async function createProduct(
  db: PrismaClient,
  data: {
    storeId: string
    name: string
    slug: string
    description?: string
    price: number
    comparePrice?: number | null
    image?: string
    images?: string
    categoryId: string
    isFeatured?: boolean
    isNew?: boolean
    discount?: number | null
    inStock?: boolean
    sizes?: string
    colors?: string
  }
): Promise<ProductData | null> {
  try {
    const product = await db.product.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        price: data.price,
        comparePrice: data.comparePrice || null,
        image: data.image || '',
        images: data.images || '[]',
        categoryId: data.categoryId,
        isFeatured: data.isFeatured || false,
        isNew: data.isNew || false,
        discount: data.discount || null,
        inStock: data.inStock !== undefined ? data.inStock : true,
        sizes: data.sizes || '[]',
        colors: data.colors || '[]',
      },
      select: PRODUCT_SAFE_FIELDS,
    })
    return product as ProductData
  } catch (error) {
    console.error('[product-helpers] Create failed:', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Update a product with error handling for schema mismatches.
 */
export async function updateProduct(
  db: PrismaClient,
  productId: string,
  data: Partial<{
    name: string
    slug: string
    description: string
    price: number
    comparePrice: number | null
    image: string
    images: string
    categoryId: string
    isFeatured: boolean
    isNew: boolean
    discount: number | null
    inStock: boolean
    sizes: string
    colors: string
  }>
): Promise<ProductData | null> {
  try {
    const product = await db.product.update({
      where: { id: productId },
      data,
      select: PRODUCT_SAFE_FIELDS,
    })
    return product as ProductData
  } catch (error) {
    console.error('[product-helpers] Update failed:', error instanceof Error ? error.message : error)
    return null
  }
}
