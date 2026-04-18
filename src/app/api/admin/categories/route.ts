import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner, verifyStoreOwnershipAny } from '@/lib/api-auth'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'

export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    // Verify the user can only access their own store's data
    if (storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const categories = await db.category.findMany({
      where: { storeId },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('[admin/categories GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al obtener categorias', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { name, slug, image, sortOrder } = body
    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Use storeId from JWT token, not from request body
    const storeId = auth.user.storeId

    // Check plan limits before creating category
    const store = await db.store.findUnique({ where: { id: storeId }, select: { plan: true } })
    const plan = store?.plan || 'basico'
    const limitCheck = await checkPlanLimit(db, storeId, 'categories', plan)
    if (!limitCheck.allowed) {
      const config = getPlanConfig(plan)
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de categorías de tu plan ${config.name} (${limitCheck.limit}). Actualiza a Pro o Premium para más categorías.`,
          currentPlan: plan,
          limit: limitCheck.limit,
          current: limitCheck.current,
        },
        { status: 403 }
      )
    }

    const category = await db.category.create({
      data: { storeId, name, slug, image: image || '', sortOrder: sortOrder || 0 },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('[admin/categories POST]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al crear categoria', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { id, name, slug, image, sortOrder } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify store ownership before update
    const ownership = await verifyStoreOwnershipAny(request, 'category', id)
    if (!ownership.authorized) return ownership.error

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (image !== undefined) updateData.image = image
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    const category = await db.category.update({ where: { id }, data: updateData, include: { _count: { select: { products: true } } } })
    return NextResponse.json(category)
  } catch (error) {
    console.error('[admin/categories PUT]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al actualizar categoria', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify store ownership before delete
    const ownership = await verifyStoreOwnershipAny(request, 'category', id)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/categories DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al eliminar categoria', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
