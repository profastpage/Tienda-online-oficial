import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner, verifyStoreOwnershipAny } from '@/lib/api-auth'
import { checkPlanLimit, getPlanConfig } from '@/lib/plan-limits'
import { ensureStoreExists, findStoreById } from '@/lib/store-helpers'

type ProductData = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  categoryId: string
  storeId: string
  isFeatured: boolean
  isNew: boolean
  discount: number | null
  rating: number
  reviewCount: number
  inStock: boolean
  createdAt: Date
  updatedAt: Date
  category?: { id: string; name: string; slug: string } | null
}

// Helper to ensure database has required columns
async function ensureProductColumns(db: Awaited<ReturnType<typeof getDb>>) {
  try {
    const columns = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("Product")`)
    const colNames = columns.map(c => c.name)
    
    const required = [
      { name: 'images', sql: `ALTER TABLE "Product" ADD COLUMN "images" TEXT DEFAULT '[]'` },
      { name: 'sizes', sql: `ALTER TABLE "Product" ADD COLUMN "sizes" TEXT DEFAULT '[]'` },
      { name: 'colors', sql: `ALTER TABLE "Product" ADD COLUMN "colors" TEXT DEFAULT '[]'` },
      { name: 'comparePrice', sql: `ALTER TABLE "Product" ADD COLUMN "comparePrice" REAL` },
    ]
    
    for (const col of required) {
      if (!colNames.includes(col.name)) {
        try {
          await db.$executeRawUnsafe(col.sql)
          console.log(`[products] Added missing column: ${col.name}`)
        } catch { /* ignore duplicate column errors */ }
      }
    }
  } catch (err) {
    console.warn('[products] Column check failed:', err)
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

    // Use raw SQL to get products
    const products = await db.$queryRaw<ProductData[]>`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE storeId = ${storeId}
      ORDER BY createdAt DESC
    `
    
    // Fetch categories separately for each product
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
    console.log('[admin/products POST] Starting product creation...')
    
    const auth = await requireStoreOwner(request)
    if (auth.error) {
      console.log('[admin/products POST] Auth error:', auth.error)
      return auth.error
    }

    const db = await getDb()
    
    // Ensure database has required columns before creating product
    await ensureProductColumns(db)
    
    const body = await request.json()
    console.log('[admin/products POST] Request body:', { ...body, image: body.image ? '[IMAGE]' : 'none' })
    
    const { name, slug, description, price, comparePrice, image, categoryId, isFeatured, isNew, discount, inStock } = body
    
    if (!name || !slug || price === undefined || !categoryId) {
      console.log('[admin/products POST] Missing required fields')
      return NextResponse.json({ error: 'Faltan campos requeridos: nombre, slug, precio, categoria' }, { status: 400 })
    }

    // Use storeId from JWT token
    const storeId = auth.user.storeId
    if (!storeId) {
      console.log('[admin/products POST] No storeId in token')
      return NextResponse.json({ error: 'No tienes una tienda asociada' }, { status: 400 })
    }

    console.log('[admin/products POST] StoreId:', storeId)

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

    // Generate ID and timestamps
    const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    
    // Insert product using raw SQL
    try {
      await db.$executeRaw`
        INSERT INTO Product (
          id, name, slug, description, price, comparePrice, image,
          categoryId, storeId, isFeatured, isNew, discount,
          rating, reviewCount, inStock, createdAt, updatedAt
        ) VALUES (
          ${id},
          ${name},
          ${slug},
          ${description || ''},
          ${parseFloat(price)},
          ${comparePrice ? parseFloat(comparePrice) : null},
          ${image || ''},
          ${categoryId},
          ${storeId},
          ${isFeatured ? 1 : 0},
          ${isNew ? 1 : 0},
          ${discount || null},
          4.5,
          0,
          ${inStock !== false ? 1 : 0},
          ${now},
          ${now}
        )
      `
      console.log('[admin/products POST] Product inserted successfully:', id)
    } catch (insertError) {
      console.error('[admin/products POST] Insert error:', insertError)
      throw insertError
    }
    
    // Fetch the created product
    const products = await db.$queryRaw<ProductData[]>`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE id = ${id}
    `
    
    if (!products[0]) {
      return NextResponse.json({ error: 'Error al crear producto', details: 'No se pudo recuperar el producto creado' }, { status: 500 })
    }
    
    // Fetch category for response
    const categories = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM Category WHERE id = ${categoryId}
    `
    
    return NextResponse.json({ ...products[0], category: categories[0] || null }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    console.error('[admin/products POST] Full error:', error)
    
    if (msg.includes('Unique') || msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese slug' }, { status: 409 })
    }
    if (msg.includes('no such column')) {
      return NextResponse.json({ 
        error: 'Error de base de datos: falta una columna', 
        details: msg,
        hint: 'Ejecuta /api/diagnostic con POST para migrar la base de datos'
      }, { status: 500 })
    }
    
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

    // Build update query
    const updates: string[] = []
    const values: unknown[] = []
    
    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?')
      values.push(data.slug)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.price !== undefined) {
      updates.push('price = ?')
      values.push(parseFloat(data.price))
    }
    if (data.comparePrice !== undefined) {
      updates.push('comparePrice = ?')
      values.push(data.comparePrice ? parseFloat(data.comparePrice) : null)
    }
    if (data.image !== undefined) {
      updates.push('image = ?')
      values.push(data.image)
    }
    if (data.categoryId !== undefined) {
      updates.push('categoryId = ?')
      values.push(data.categoryId)
    }
    if (data.isFeatured !== undefined) {
      updates.push('isFeatured = ?')
      values.push(data.isFeatured ? 1 : 0)
    }
    if (data.isNew !== undefined) {
      updates.push('isNew = ?')
      values.push(data.isNew ? 1 : 0)
    }
    if (data.discount !== undefined) {
      updates.push('discount = ?')
      values.push(data.discount || null)
    }
    if (data.inStock !== undefined) {
      updates.push('inStock = ?')
      values.push(data.inStock ? 1 : 0)
    }
    
    if (updates.length > 0) {
      updates.push('updatedAt = ?')
      values.push(new Date().toISOString())
      values.push(id)
      
      const query = `UPDATE Product SET ${updates.join(', ')} WHERE id = ?`
      await db.$executeRawUnsafe(query, ...values)
    }
    
    // Fetch updated product
    const products = await db.$queryRaw<ProductData[]>`
      SELECT 
        id, name, slug, description, price, comparePrice, image, 
        categoryId, storeId, isFeatured, isNew, discount, 
        rating, reviewCount, inStock, createdAt, updatedAt
      FROM Product
      WHERE id = ${id}
    `
    
    // Fetch category for response
    const categories = await db.$queryRaw<{ id: string; name: string; slug: string }[]>`
      SELECT id, name, slug FROM Category WHERE id = ${products[0]?.categoryId}
    `
    
    return NextResponse.json({ ...products[0], category: categories[0] || null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    console.error('[admin/products PUT]', msg)
    if (msg.includes('Unique') || msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese slug' }, { status: 409 })
    }
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
