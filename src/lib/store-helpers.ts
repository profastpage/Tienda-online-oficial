import { PrismaClient } from '@prisma/client'

// Known seed stores that should be auto-created if missing
export const SEED_STORES: Record<string, { name: string; slug: string }> = {
  'kmpw0h5ig4o518kg4zsm5huo3': { name: 'Urban Style', slug: 'urban-style' },
  'seed-store-basico': { name: 'Mi Tienda Básica', slug: 'mi-tienda-basica' },
  'seed-store-pro': { name: 'TechStore Pro', slug: 'techstore-pro' },
  'seed-store-premium': { name: 'Fashion Premium', slug: 'fashion-premium' },
}

// Safe fields that can be exposed in API responses without leaking sensitive data
export const STORE_SAFE_FIELDS = ['id', 'name', 'slug', 'logo', 'whatsappNumber', 'address', 'description', 'isActive', 'plan', 'subscriptionExpiresAt', 'trialDays', 'createdAt', 'updatedAt'] as const

export type StoreData = {
  id: string
  name: string
  slug: string
  logo: string
  whatsappNumber: string
  address: string
  description: string
  isActive: boolean
  plan: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Find a store by ID using raw SQL to avoid schema mismatch issues.
 */
export async function findStoreById(
  db: PrismaClient, 
  storeId: string
): Promise<StoreData | null> {
  try {
    const stores = await db.$queryRaw<StoreData[]>`
      SELECT id, name, slug, logo, whatsappNumber, address, description, isActive, plan, createdAt, updatedAt
      FROM Store
      WHERE id = ${storeId}
    `
    return stores[0] || null
  } catch (error) {
    console.error('[store-helpers] findStoreById failed:', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Find a store by slug using raw SQL.
 */
export async function findStoreBySlug(
  db: PrismaClient, 
  slug: string
): Promise<StoreData | null> {
  try {
    const stores = await db.$queryRaw<StoreData[]>`
      SELECT id, name, slug, logo, whatsappNumber, address, description, isActive, plan, createdAt, updatedAt
      FROM Store
      WHERE slug = ${slug}
    `
    return stores[0] || null
  } catch (error) {
    console.error('[store-helpers] findStoreBySlug failed:', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Ensure a store exists in the database.
 * If it doesn't exist, create it with known seed data or default values.
 * This is critical for demo/seed accounts where the store might not exist yet.
 */
export async function ensureStoreExists(
  db: PrismaClient, 
  storeId: string
): Promise<StoreData | null> {
  // First, try to find existing store
  let store = await findStoreById(db, storeId)
  if (store) return store

  // Store not found, try to create it
  console.log(`[store-helpers] Store ${storeId} not found, creating...`)

  const seedData = SEED_STORES[storeId]
  const name = seedData?.name || `Tienda ${storeId.slice(0, 8)}`
  const slug = seedData?.slug || `tienda-${storeId.slice(0, 8)}`
  const now = new Date().toISOString()

  try {
    await db.$executeRaw`
      INSERT INTO Store (id, name, slug, logo, whatsappNumber, address, description, isActive, plan, createdAt, updatedAt)
      VALUES (${storeId}, ${name}, ${slug}, '', '', '', '', 1, 'basico', ${now}, ${now})
    `
    console.log(`[store-helpers] Created store ${storeId} (${name})`)
    return findStoreById(db, storeId)
  } catch (createError) {
    // Race condition: another request may have created it
    console.warn(`[store-helpers] Create failed, trying to find:`, createError instanceof Error ? createError.message : createError)
    return findStoreById(db, storeId)
  }
}

/**
 * Update a store using raw SQL.
 */
export async function updateStore(
  db: PrismaClient,
  storeId: string,
  data: {
    name?: string
    description?: string
    whatsappNumber?: string
    address?: string
    logo?: string
    isActive?: boolean
    plan?: string
  }
): Promise<StoreData | null> {
  try {
    const updates: string[] = []
    const values: unknown[] = []
    
    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.whatsappNumber !== undefined) {
      updates.push('whatsappNumber = ?')
      values.push(data.whatsappNumber)
    }
    if (data.address !== undefined) {
      updates.push('address = ?')
      values.push(data.address)
    }
    if (data.logo !== undefined) {
      updates.push('logo = ?')
      values.push(data.logo)
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?')
      values.push(data.isActive ? 1 : 0)
    }
    if (data.plan !== undefined) {
      updates.push('plan = ?')
      values.push(data.plan)
    }
    
    if (updates.length === 0) {
      return findStoreById(db, storeId)
    }
    
    updates.push('updatedAt = ?')
    values.push(new Date().toISOString())
    values.push(storeId)
    
    const query = `UPDATE Store SET ${updates.join(', ')} WHERE id = ?`
    await db.$executeRawUnsafe(query, ...values)
    
    return findStoreById(db, storeId)
  } catch (error) {
    console.error('[store-helpers] Update failed:', error instanceof Error ? error.message : error)
    return null
  }
}
