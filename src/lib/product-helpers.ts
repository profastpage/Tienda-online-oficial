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
    // Use raw query to avoid schema mismatch issues completely
    const rawProducts = await db.$queryRaw<ProductData[]>`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE storeId = ${storeId}
      ORDER BY createdAt DESC
    `
    return rawProducts
  } catch (error) {
    console.error('[product-helpers] getProductsByStore failed:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Create a product with error handling for schema mismatches.
 * Uses raw SQL to avoid issues with missing columns.
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
    categoryId: string
    isFeatured?: boolean
    isNew?: boolean
    discount?: number | null
    inStock?: boolean
  }
): Promise<ProductData | null> {
  try {
    const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date()
    
    // Use raw SQL insert to avoid schema mismatch with missing columns
    await db.$executeRaw`
      INSERT INTO Product (
        id, name, slug, description, price, comparePrice, image,
        categoryId, storeId, isFeatured, isNew, discount,
        rating, reviewCount, inStock, createdAt, updatedAt
      ) VALUES (
        ${id},
        ${data.name},
        ${data.slug},
        ${data.description || ''},
        ${data.price},
        ${data.comparePrice || null},
        ${data.image || ''},
        ${data.categoryId},
        ${data.storeId},
        ${data.isFeatured ? 1 : 0},
        ${data.isNew ? 1 : 0},
        ${data.discount || null},
        4.5,
        0,
        ${data.inStock !== false ? 1 : 0},
        ${now.toISOString()},
        ${now.toISOString()}
      )
    `
    
    // Return the created product
    const products = await db.$queryRaw<ProductData[]>`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE id = ${id}
    `
    
    return products[0] || null
  } catch (error) {
    console.error('[product-helpers] createProduct failed:', error instanceof Error ? error.message : error)
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
    categoryId: string
    isFeatured: boolean
    isNew: boolean
    discount: number | null
    inStock: boolean
  }>
): Promise<ProductData | null> {
  try {
    // Build dynamic UPDATE query
    const updates: string[] = []
    const values: unknown[] = []
    
    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?')
      values.push(data.slug)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.price !== undefined) {
      updates.push('price = ?')
      values.push(data.price)
    }
    if (data.comparePrice !== undefined) {
      updates.push('comparePrice = ?')
      values.push(data.comparePrice)
    }
    if (data.image !== undefined) {
      updates.push('image = ?')
      values.push(data.image)
    }
    if (data.categoryId !== undefined) {
      updates.push('categoryId = ?')
      values.push(data.categoryId)
    }
    if (data.isFeatured !== undefined) {
      updates.push('isFeatured = ?')
      values.push(data.isFeatured ? 1 : 0)
    }
    if (data.isNew !== undefined) {
      updates.push('isNew = ?')
      values.push(data.isNew ? 1 : 0)
    }
    if (data.discount !== undefined) {
      updates.push('discount = ?')
      values.push(data.discount)
    }
    if (data.inStock !== undefined) {
      updates.push('inStock = ?')
      values.push(data.inStock ? 1 : 0)
    }
    
    updates.push('updatedAt = ?')
    values.push(new Date().toISOString())
    
    values.push(productId)
    
    const query = `UPDATE Product SET ${updates.join(', ')} WHERE id = ?`
    await db.$executeRawUnsafe(query, ...values)
    
    // Return the updated product
    const products = await db.$queryRaw<ProductData[]>`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE id = ${productId}
    `
    
    return products[0] || null
  } catch (error) {
    console.error('[product-helpers] updateProduct failed:', error instanceof Error ? error.message : error)
    return null
  }
}
