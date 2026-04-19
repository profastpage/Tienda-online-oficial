import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/api-auth'
import { ensureStoreExists, findStoreById, updateStore, SEED_STORES } from '@/lib/store-helpers'

export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId') || auth.user.storeId
    
    if (!storeId) {
      return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })
    }

    // Verify the user can only access their own store's data
    if (auth.user.role !== 'super-admin' && storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Ensure store exists (auto-create for seed/demo accounts)
    const store = await ensureStoreExists(db, storeId)
    
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada y no se pudo crear' }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('[admin/settings GET]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al obtener configuracion', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    
    // CRITICAL FIX: Always use storeId from JWT token for security
    let storeId: string
    
    if (auth.user.role === 'super-admin' && body.id) {
      storeId = body.id
    } else {
      storeId = auth.user.storeId
    }
    
    if (!storeId) {
      return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })
    }

    // Ensure store exists before updating
    await ensureStoreExists(db, storeId)

    const { name, description, whatsappNumber, address, logo } = body

    const updateData: {
      name?: string
      description?: string
      whatsappNumber?: string
      address?: string
      logo?: string
    } = {}
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber
    if (address !== undefined) updateData.address = address
    if (logo !== undefined) updateData.logo = logo

    // Update using the safe helper (uses raw SQL)
    const updatedStore = await updateStore(db, storeId, updateData)
    
    if (updatedStore) {
      console.log('[admin/settings PUT] Store updated:', storeId, 'fields:', Object.keys(updateData))
      return NextResponse.json(updatedStore)
    }

    // If update failed, try to create the store using raw SQL
    console.warn(`[admin/settings] Store ${storeId} update failed, force creating...`)
    
    const seedData = SEED_STORES[storeId]
    const newName = name || seedData?.name || 'Mi Tienda'
    const newSlug = seedData?.slug || `tienda-${storeId.slice(0, 8)}`
    const now = new Date().toISOString()
    
    try {
      await db.$executeRaw`
        INSERT INTO Store (id, name, slug, description, whatsappNumber, address, logo, isActive, plan, createdAt, updatedAt)
        VALUES (${storeId}, ${newName}, ${newSlug}, ${description || ''}, ${whatsappNumber || ''}, ${address || ''}, ${logo || ''}, 1, 'basico', ${now}, ${now})
      `
      
      const store = await findStoreById(db, storeId)
      console.log(`[admin/settings] Force created store ${storeId}`)
      return NextResponse.json(store)
    } catch (createError) {
      console.error('[admin/settings] Force create failed:', createError instanceof Error ? createError.message : createError)
      return NextResponse.json({ error: 'Tienda no encontrada y no se pudo crear' }, { status: 404 })
    }
  } catch (error) {
    console.error('[admin/settings PUT]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al guardar configuracion', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
