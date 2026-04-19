import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner, verifyStoreOwnershipAny } from '@/lib/api-auth'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'
import { ensureStoreExists, findStoreById } from '@/lib/store-helpers'

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

    const products = await db.product.findMany({
      where: { storeId },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
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
    const { name, slug, description, price, comparePrice, image, images, categoryId, isFeatured, isNew, discount, sizes, colors, inStock } = body
    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Use storeId from JWT token, not from request body
    const storeId = auth.user.storeId

    // Ensure store exists (critical for demo/seed accounts)
    await ensureStoreExists(db, storeId)

    // Check plan limits before creating product
    const store = await findStoreById(db, storeId)
    const plan = store?.plan || 'basico'
    const planConfig = getPlanConfig(plan)

    // Check images per product limit
    let parsedImages: string[] = []
    try {
      parsedImages = JSON.parse(images || '[]') as string[]
    } catch {
      parsedImages = []
    }
    const totalImages = (image ? 1 : 0) + parsedImages.filter(Boolean).length
    if (totalImages > planConfig.limits.imagesPerProduct) {
      return NextResponse.json(
        {
          error: `Tu plan ${planConfig.name} permite máximo ${planConfig.limits.imagesPerProduct} imagen(es) por producto. Tienes ${totalImages}. Actualiza tu plan para más imágenes.`,
          currentPlan: plan,
          limit: planConfig.limits.imagesPerProduct,
        },
        { status: 403 }
      )
    }

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

    const product = await db.product.create({
      data: {
        storeId, name, slug, description: description || '', price,
        comparePrice: comparePrice || null, image: image || '',
        images: typeof images === 'string' ? images : JSON.stringify(parsedImages.filter(Boolean)),
        categoryId, isFeatured: isFeatured || false, isNew: isNew || false,
        discount: discount || null, inStock: inStock !== undefined ? inStock : true,
        sizes: JSON.stringify(sizes || []), colors: JSON.stringify(colors || []),
      },
      include: { category: { select: { name: true } } },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug ya existe' }, { status: 409 })
    console.error('[admin/products POST]', msg)
    return NextResponse.json({ error: 'Error al crear producto', details: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify store ownership before update
    const ownership = await verifyStoreOwnershipAny(request, 'product', id)
    if (!ownership.authorized) return ownership.error

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice || null
    if (data.image !== undefined) updateData.image = data.image
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isNew !== undefined) updateData.isNew = data.isNew
    if (data.discount !== undefined) updateData.discount = data.discount || null
    if (data.inStock !== undefined) updateData.inStock = data.inStock
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes)
    if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors)
    if (data.images !== undefined) updateData.images = data.images

    const product = await db.product.update({ where: { id }, data: updateData, include: { category: { select: { name: true } } } })
    return NextResponse.json(product)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug ya existe' }, { status: 409 })
    console.error('[admin/products PUT]', msg)
    return NextResponse.json({ error: 'Error al actualizar producto', details: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify store ownership before delete
    const ownership = await verifyStoreOwnershipAny(request, 'product', id)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/products DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al eliminar producto', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
