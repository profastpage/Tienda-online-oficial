import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/api-auth'
import { ensureStoreExists, findStoreById, updateStore, SEED_STORES, STORE_SAFE_FIELDS } from '@/lib/store-helpers'

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
    // Super-admin bypasses store ownership check
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
    // The 'id' in body is ignored for non-super-admin users
    let storeId: string
    
    if (auth.user.role === 'super-admin' && body.id) {
      // Super-admin can specify any store id
      storeId = body.id
    } else {
      // Regular users can only update their own store
      storeId = auth.user.storeId
    }
    
    if (!storeId) {
      return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })
    }

    // Ensure store exists before updating (critical for demo/seed accounts)
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

    // Try to update using the safe helper
    const updatedStore = await updateStore(db, storeId, updateData)
    
    if (updatedStore) {
      console.log('[admin/settings PUT] Store updated:', storeId, 'fields:', Object.keys(updateData))
      return NextResponse.json(updatedStore)
    }

    // If update failed, try to create the store
    console.warn(`[admin/settings] Store ${storeId} update failed, force creating...`)
    
    const seedData = SEED_STORES[storeId]
    try {
      const newStore = await db.store.create({
        data: {
          id: storeId,
          name: name || seedData?.name || 'Mi Tienda',
          slug: seedData?.slug || `tienda-${storeId.slice(0, 8)}`,
          description: description || '',
          whatsappNumber: whatsappNumber || '',
          address: address || '',
          logo: logo || '',
        },
        select: STORE_SAFE_FIELDS,
      })
      console.log(`[admin/settings] Force created store ${storeId}`)
      return NextResponse.json(newStore)
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
