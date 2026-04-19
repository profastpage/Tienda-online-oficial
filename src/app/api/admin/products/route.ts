import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner, verifyStoreOwnershipAny } from '@/lib/api-auth'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'
import { ensureStoreExists, findStoreById } from '@/lib/store-helpers'
import { getProductsByStore, createProduct, updateProduct } from '@/lib/product-helpers'

export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId') || auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    // Verify the user can only access their own store's data
    if (auth.user.role !== 'super-admin' && storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Use safe product query
    const products = await getProductsByStore(db, storeId)
    
    // Fetch categories separately for each product using raw query
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        try {
          const categories = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
            SELECT id, name, slug FROM Category WHERE id = ${product.categoryId}
          `
          return { ...product, category: categories[0] || null }
        } catch {
          return { ...product, category: null }
        }
      })
    )
    
    return NextResponse.json(productsWithCategories)
  } catch (error) {
    console.error('[admin/products GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al obtener productos', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { name, slug, description, price, comparePrice, image, categoryId, isFeatured, isNew, discount, inStock } = body
    
    if (!name || !slug || price === undefined || !categoryId) {
      return NextResponse.json({ error: 'Faltan campos requeridos: nombre, slug, precio, categoria' }, { status: 400 })
    }

    // Use storeId from JWT token
    const storeId = auth.user.storeId
    if (!storeId) {
      return NextResponse.json({ error: 'No tienes una tienda asociada' }, { status: 400 })
    }

    // Ensure store exists (critical for demo/seed accounts)
    await ensureStoreExists(db, storeId)

    // Check plan limits
    const store = await findStoreById(db, storeId)
    const plan = store?.plan || 'basico'
    const planConfig = getPlanConfig(plan)

    const limitCheck = await checkPlanLimit(db, storeId, 'products', plan)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de productos de tu plan ${planConfig.name} (${limitCheck.limit}). Actualiza a Pro o Premium para más productos.`,
          currentPlan: plan,
          limit: limitCheck.limit,
          current: limitCheck.current,
        },
        { status: 403 }
      )
    }

    // Use safe product creation (raw SQL)
    const product = await createProduct(db, {
      storeId,
      name,
      slug,
      description: description || '',
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      image: image || '',
      categoryId,
      isFeatured: isFeatured || false,
      isNew: isNew || false,
      discount: discount || null,
      inStock: inStock !== false,
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Error al crear producto', details: 'No se pudo guardar en la base de datos' }, { status: 500 })
    }
    
    // Fetch category for response
    const categories = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM Category WHERE id = ${categoryId}
    `
    
    return NextResponse.json({ ...product, category: categories[0] || null }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.includes('Unique') || msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese slug' }, { status: 409 })
    }
    console.error('[admin/products POST]', msg)
    return NextResponse.json({ error: 'Error al crear producto', details: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // Verify store ownership before update
    const ownership = await verifyStoreOwnershipAny(request, 'product', id)
    if (!ownership.authorized) return ownership.error

    // Build update data (only safe fields)
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = parseFloat(data.price)
    if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice ? parseFloat(data.comparePrice) : null
    if (data.image !== undefined) updateData.image = data.image
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isNew !== undefined) updateData.isNew = data.isNew
    if (data.discount !== undefined) updateData.discount = data.discount || null
    if (data.inStock !== undefined) updateData.inStock = data.inStock

    // Use safe product update
    const product = await updateProduct(db, id, updateData)
    
    if (!product) {
      return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
    }
    
    // Fetch category for response
    const categories = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM Category WHERE id = ${product.categoryId}
    `
    
    return NextResponse.json({ ...product, category: categories[0] || null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.includes('Unique') || msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese slug' }, { status: 409 })
    }
    console.error('[admin/products PUT]', msg)
    return NextResponse.json({ error: 'Error al actualizar producto', details: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // Verify store ownership before delete
    const ownership = await verifyStoreOwnershipAny(request, 'product', id)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    
    // Use raw SQL delete
    await db.$executeRaw`DELETE FROM Product WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/products DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al eliminar producto', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
