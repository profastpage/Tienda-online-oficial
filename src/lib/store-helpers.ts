import { PrismaClient } from '@prisma/client'

// Known seed stores that should be auto-created if missing
export const SEED_STORES: Record<string, { name: string; slug: string }> = {
  'kmpw0h5ig4o518kg4zsm5huo3': { name: 'Urban Style', slug: 'urban-style' },
  'seed-store-basico': { name: 'Mi Tienda Básica', slug: 'mi-tienda-basica' },
  'seed-store-pro': { name: 'TechStore Pro', slug: 'techstore-pro' },
  'seed-store-premium': { name: 'Fashion Premium', slug: 'fashion-premium' },
}

// Store fields that are guaranteed to exist in the database
// This is important because Turso might have an older schema without subscriptionExpiresAt/trialDays
export const STORE_SAFE_FIELDS = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  whatsappNumber: true,
  address: true,
  description: true,
  isActive: true,
  plan: true,
  createdAt: true,
  updatedAt: true,
} as const

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
 * Ensure a store exists in the database.
 * If it doesn't exist, create it with known seed data or default values.
 * This is critical for demo/seed accounts where the store might not exist yet.
 * 
 * @param db - Prisma client instance
 * @param storeId - The store ID to ensure exists
 * @returns The store object (existing or newly created), or null if creation failed
 */
export async function ensureStoreExists(
  db: PrismaClient, 
  storeId: string
): Promise<StoreData | null> {
  // First, try to find existing store - use explicit select to avoid schema mismatch issues
  let store = await db.store.findUnique({ 
    where: { id: storeId },
    select: STORE_SAFE_FIELDS,
  })
  if (store) return store

  // Store not found, try to create it
  console.log(`[store-helpers] Store ${storeId} not found, creating...`)

  const seedData = SEED_STORES[storeId]
  const storeData = seedData || {
    name: `Tienda ${storeId.slice(0, 8)}`,
    slug: `tienda-${storeId.slice(0, 8)}`,
  }

  try {
    store = await db.store.create({
      data: {
        id: storeId,
        name: storeData.name,
        slug: storeData.slug,
      },
      select: STORE_SAFE_FIELDS,
    })
    console.log(`[store-helpers] Created store ${storeId} (${storeData.name})`)
    return store
  } catch (createError) {
    // Race condition: another request may have created it
    console.warn(`[store-helpers] Create failed, trying to find:`, createError instanceof Error ? createError.message : createError)
    store = await db.store.findUnique({ 
      where: { id: storeId },
      select: STORE_SAFE_FIELDS,
    })
    return store
  }
}

/**
 * Find a store by ID with safe fields only.
 */
export async function findStoreById(
  db: PrismaClient, 
  storeId: string
): Promise<StoreData | null> {
  return db.store.findUnique({
    where: { id: storeId },
    select: STORE_SAFE_FIELDS,
  })
}

/**
 * Update a store with safe fields only.
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
    return await db.store.update({
      where: { id: storeId },
      data,
      select: STORE_SAFE_FIELDS,
    })
  } catch (error) {
    console.error('[store-helpers] Update failed:', error instanceof Error ? error.message : error)
    return null
  }
}
