import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner, verifyStoreOwnershipAny, requireStoreApproved } from '@/lib/api-auth'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'
import { ensureStoreExists, findStoreById } from '@/lib/store-helpers'

// Version marker for debugging - FORCE REBUILD v3
console.log('[admin/categories] Route loaded - v2026.04.19.3 - ALL METHODS EXPORTED')

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

type CategoryData = {
  id: string
  name: string
  slug: string
  image: string
  sortOrder: number
  storeId: string
  createdAt: Date
  productCount?: number
}

// Helper to ensure Category table has required columns
async function ensureCategoryColumns(db: Awaited<ReturnType<typeof getDb>>) {
  try {
    const columns = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("Category")`)
    const colNames = columns.map(c => c.name)
    
    // Ensure image column exists
    if (!colNames.includes('image')) {
      try {
        await db.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN "image" TEXT DEFAULT ''`)
        console.log('[categories] Added missing column: image')
      } catch { /* ignore duplicate column errors */ }
    }
  } catch (err) {
    console.warn('[categories] Column check failed:', err)
  }
}

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

    // Use raw SQL to get categories with product counts
    const categories = await db.$queryRaw<CategoryData[]>`
      SELECT c.id, c.name, c.slug, c.image, c.sortOrder, c.storeId, c.createdAt,
        (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id) as productCount
      FROM Category c
      WHERE c.storeId = ${storeId}
      ORDER BY c.sortOrder ASC
    `
    
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

    // ═══ APPROVAL CHECK: Block if store is pending/rejected/suspended ═══
    const approval = await requireStoreApproved(request)
    if (approval.error) return approval.error

    const db = await getDb()
    
    // Ensure database has required columns before creating category
    await ensureCategoryColumns(db)
    
    const body = await request.json()
    const { name, slug, image, sortOrder } = body
    if (!name || !slug) {
      return NextResponse.json({ error: 'Faltan campos requeridos: nombre y slug' }, { status: 400 })
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

    // Generate ID and create category using raw SQL
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    
    await db.$executeRaw`
      INSERT INTO Category (id, name, slug, image, sortOrder, storeId, createdAt)
      VALUES (${id}, ${name}, ${slug}, ${image || ''}, ${sortOrder || 0}, ${storeId}, ${now})
    `
    
    // Fetch the created category
    const categories = await db.$queryRaw<CategoryData[]>`
      SELECT c.id, c.name, c.slug, c.image, c.sortOrder, c.storeId, c.createdAt,
        (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id) as productCount
      FROM Category c
      WHERE c.id = ${id}
    `
    
    return NextResponse.json(categories[0], { status: 201 })
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
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // ═══ APPROVAL CHECK: Block if store is pending/rejected/suspended ═══
    const approval = await requireStoreApproved(request)
    if (approval.error) return approval.error

    // Verify store ownership before update
    const ownership = await verifyStoreOwnershipAny(request, 'category', id)
    if (!ownership.authorized) return ownership.error

    // Build update query
    const updates: string[] = []
    const values: unknown[] = []
    
    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (slug !== undefined) {
      updates.push('slug = ?')
      values.push(slug)
    }
    if (image !== undefined) {
      updates.push('image = ?')
      values.push(image)
    }
    if (sortOrder !== undefined) {
      updates.push('sortOrder = ?')
      values.push(sortOrder)
    }
    
    if (updates.length > 0) {
      values.push(id)
      const query = `UPDATE Category SET ${updates.join(', ')} WHERE id = ?`
      await db.$executeRawUnsafe(query, ...values)
    }
    
    // Fetch updated category
    const categories = await db.$queryRaw<CategoryData[]>`
      SELECT c.id, c.name, c.slug, c.image, c.sortOrder, c.storeId, c.createdAt,
        (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id) as productCount
      FROM Category c
      WHERE c.id = ${id}
    `
    
    return NextResponse.json(categories[0])
  } catch (error) {
    console.error('[admin/categories PUT]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al actualizar categoria', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // ═══ APPROVAL CHECK: Block if store is pending/rejected/suspended ═══
    const approval = await requireStoreApproved(request)
    if (approval.error) return approval.error

    // Verify store ownership before delete
    const ownership = await verifyStoreOwnershipAny(request, 'category', id)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    
    // Use raw SQL delete
    await db.$executeRaw`DELETE FROM Category WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/categories DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al eliminar categoria', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
