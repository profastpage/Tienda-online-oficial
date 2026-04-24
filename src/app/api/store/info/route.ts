import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { ensureStoreExists, ensureStoreColumns, SEED_STORES } from '@/lib/store-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const storeId = searchParams.get('storeId')
    
    if (!slug && !storeId) {
      return NextResponse.json({ error: 'slug or storeId required' }, { status: 400 })
    }

    const db = await getDb()
    
    // CRITICAL: Ensure all Store columns exist in DB before querying
    // This auto-migrates missing columns (primaryColor, secondaryColor, etc.)
    await ensureStoreColumns(db)
    
    // First, try to find by slug or storeId
    let store = null
    
    if (storeId) {
      // Find by ID using raw SQL
      const stores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        logo: string
        description: string
        whatsappNumber: string
        address: string
        plan: string
        isActive: number
        primaryColor: string
        secondaryColor: string
        accentColor: string
        fontFamily: string
        customCSS: string
        favicon: string
        createdAt: Date
      }[]>`SELECT id, name, slug, logo, description, whatsappNumber, address, plan, isActive, primaryColor, secondaryColor, accentColor, fontFamily, customCSS, favicon, createdAt FROM Store WHERE id = ${storeId}`
      store = stores[0] || null
    }
    
    if (!store && slug) {
      // Find by slug using raw SQL
      const stores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        logo: string
        description: string
        whatsappNumber: string
        address: string
        plan: string
        isActive: number
        primaryColor: string
        secondaryColor: string
        accentColor: string
        fontFamily: string
        customCSS: string
        favicon: string
        createdAt: Date
      }[]>`SELECT id, name, slug, logo, description, whatsappNumber, address, plan, isActive, primaryColor, secondaryColor, accentColor, fontFamily, customCSS, favicon, createdAt FROM Store WHERE slug = ${slug}`
      store = stores[0] || null
    }

    // If store not found, check if it's a known seed store and auto-create it
    if (!store && slug) {
      // Check if this slug matches a known seed store
      const seedStoreEntry = Object.entries(SEED_STORES).find(
        ([, data]) => data.slug === slug
      )
      
      if (seedStoreEntry) {
        const [seedStoreId, seedData] = seedStoreEntry
        console.log(`[store/info] Auto-creating seed store: ${seedStoreId} (${slug})`)
        
        // Create the store using ensureStoreExists
        const createdStore = await ensureStoreExists(db, seedStoreId)
        
        if (createdStore) {
          store = {
            id: createdStore.id,
            name: createdStore.name,
            slug: createdStore.slug,
            logo: createdStore.logo,
            description: createdStore.description,
            whatsappNumber: createdStore.whatsappNumber,
            address: createdStore.address,
            plan: createdStore.plan,
            isActive: createdStore.isActive ? 1 : 0,
            primaryColor: createdStore.primaryColor,
            secondaryColor: createdStore.secondaryColor,
            accentColor: createdStore.accentColor,
            fontFamily: createdStore.fontFamily,
            customCSS: createdStore.customCSS,
            favicon: createdStore.favicon,
            createdAt: createdStore.createdAt,
          }
        }
      }
    }
    
    // If store still not found and we have a storeId, try to create it
    if (!store && storeId) {
      console.log(`[store/info] Attempting to auto-create store: ${storeId}`)
      const createdStore = await ensureStoreExists(db, storeId)
      
      if (createdStore) {
        store = {
          id: createdStore.id,
          name: createdStore.name,
          slug: createdStore.slug,
          logo: createdStore.logo,
          description: createdStore.description,
          whatsappNumber: createdStore.whatsappNumber,
          address: createdStore.address,
          plan: createdStore.plan,
          isActive: createdStore.isActive ? 1 : 0,
          primaryColor: createdStore.primaryColor,
          secondaryColor: createdStore.secondaryColor,
          accentColor: createdStore.accentColor,
          fontFamily: createdStore.fontFamily,
          customCSS: createdStore.customCSS,
          favicon: createdStore.favicon,
          createdAt: createdStore.createdAt,
        }
      }
    }

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      ...store,
      isActive: store.isActive === 1 || store.isActive === true,
    })
  } catch (error) {
    console.error('[store/info] Error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al obtener informacion de la tienda', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
