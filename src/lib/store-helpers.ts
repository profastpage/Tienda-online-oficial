import { PrismaClient } from '@prisma/client'

// Known seed stores that should be auto-created if missing
export const SEED_STORES: Record<string, { name: string; slug: string }> = {
  'kmpw0h5ig4o518kg4zsm5huo3': { name: 'Urban Style', slug: 'urban-style' },
  'seed-store-basico': { name: 'Mi Tienda Básica', slug: 'mi-tienda-basica' },
  'seed-store-pro': { name: 'TechStore Pro', slug: 'techstore-pro' },
  'seed-store-premium': { name: 'Fashion Premium', slug: 'fashion-premium' },
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
): Promise<{ 
  id: string
  name: string
  slug: string
  logo?: string
  whatsappNumber?: string
  address?: string
  description?: string
  plan?: string
} | null> {
  // First, try to find existing store
  let store = await db.store.findUnique({ where: { id: storeId } })
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
    })
    console.log(`[store-helpers] Created store ${storeId} (${storeData.name})`)
    return store
  } catch (createError) {
    // Race condition: another request may have created it
    console.warn(`[store-helpers] Create failed, trying to find:`, createError instanceof Error ? createError.message : createError)
    store = await db.store.findUnique({ where: { id: storeId } })
    return store
  }
}
