import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId') || auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    // Verify the user can only access their own store's data
    // Super-admin bypasses store ownership check
    if (auth.user.role !== 'super-admin' && storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Try to find the store
    let store = await db.store.findUnique({ where: { id: storeId } })

    // If store not found, auto-create for seed stores
    if (!store) {
      console.warn(`[admin/settings] Store ${storeId} not found, attempting auto-create`)
      // Check if this is a known seed store
      const seedStores: Record<string, { name: string; slug: string }> = {
        'kmpw0h5ig4o518kg4zsm5huo3': { name: 'Urban Style', slug: 'urban-style' },
        'seed-store-basico': { name: 'Mi Tienda Básica', slug: 'mi-tienda-basica' },
        'seed-store-pro': { name: 'TechStore Pro', slug: 'techstore-pro' },
        'seed-store-premium': { name: 'Fashion Premium', slug: 'fashion-premium' },
      }
      const seed = seedStores[storeId]
      if (seed) {
        store = await db.store.create({
          data: { id: storeId, name: seed.name, slug: seed.slug },
        }).catch(async () => {
          // Race condition: another request may have created it
          return db.store.findUnique({ where: { id: storeId } })
        })
        if (store) {
          console.log(`[admin/settings] Auto-created store ${storeId} (${seed.name})`)
        }
      }
    }

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
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
    const { id, name, description, whatsappNumber, address, logo } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify the user can only update their own store
    // Super-admin bypasses store ownership check
    if (auth.user.role !== 'super-admin' && id !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber
    if (address !== undefined) updateData.address = address
    if (logo !== undefined) updateData.logo = logo

    try {
      const store = await db.store.update({ where: { id }, data: updateData })
      console.log('[admin/settings PUT] Store updated:', id, 'fields:', Object.keys(updateData))
      return NextResponse.json(store)
    } catch (updateError: unknown) {
      const msg = updateError instanceof Error ? updateError.message : String(updateError)
      // If store doesn't exist, try to create it
      if (msg.includes('Record to update not found') || msg.includes('not found')) {
        console.warn(`[admin/settings] Store ${id} not found for update, creating...`)
        try {
          const store = await db.store.create({
            data: { id, name: name || 'Mi Tienda', slug: id },
          })
          return NextResponse.json(store)
        } catch (createError) {
          console.error('[admin/settings] Auto-create failed:', createError instanceof Error ? createError.message : createError)
          return NextResponse.json({ error: 'Tienda no encontrada y no se pudo crear' }, { status: 404 })
        }
      }
      throw updateError
    }
  } catch (error) {
    console.error('[admin/settings PUT]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al guardar configuracion', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
