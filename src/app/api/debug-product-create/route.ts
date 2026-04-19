import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyToken, extractToken } from '@/lib/auth'

/**
 * DIAGNOSTIC ENDPOINT FOR PRODUCT CREATION
 * 
 * This endpoint tests the entire product creation flow and returns
 * detailed diagnostic information to help debug 500 errors.
 * 
 * Usage:
 *   GET /api/debug-product-create?email=premium@demo.pe
 *   POST /api/debug-product-create (with Authorization header)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    step: 'initialization',
  }

  try {
    const db = await getDb()
    results.dbConnection = 'OK'

    // ═══════════════════════════════════════════════════════════
    // STEP 1: Find user by email
    // ═══════════════════════════════════════════════════════════
    results.step = 'finding_user'
    if (!email) {
      return NextResponse.json({ 
        ...results, 
        error: 'Email parameter required. Use ?email=premium@demo.pe' 
      }, { status: 400 })
    }

    const users = await db.$queryRawUnsafe<{
      id: string
      email: string
      name: string
      role: string
      storeId: string | null
    }[]>(
      `SELECT id, email, name, role, storeId FROM StoreUser WHERE email = ?`,
      [email]
    )

    if (users.length === 0) {
      return NextResponse.json({
        ...results,
        error: 'User not found',
        email,
      }, { status: 404 })
    }

    const user = users[0]
    results.user = user

    if (!user.storeId) {
      return NextResponse.json({
        ...results,
        error: 'User has no storeId associated',
        user,
      }, { status: 400 })
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Check store exists
    // ═══════════════════════════════════════════════════════════
    results.step = 'checking_store'
    
    const stores = await db.$queryRawUnsafe<{
      id: string
      name: string
      slug: string
      plan: string
      isActive: number
    }[]>(
      `SELECT id, name, slug, plan, isActive FROM Store WHERE id = ?`,
      [user.storeId]
    )

    if (stores.length === 0) {
      // Try to create the store
      results.storeStatus = 'NOT_FOUND_ATTEMPTING_CREATE'
      const now = new Date().toISOString()
      const slug = `tienda-${user.storeId.slice(0, 8)}`
      
      try {
        await db.$executeRawUnsafe(
          `INSERT INTO Store (id, name, slug, logo, whatsappNumber, address, description, isActive, plan, createdAt, updatedAt) VALUES (?, ?, ?, '', '', '', '', 1, 'basico', ?, ?)`,
          [user.storeId, `Tienda ${user.name}`, slug, now, now]
        )
        results.storeCreated = true
      } catch (createErr) {
        results.storeCreateError = createErr instanceof Error ? createErr.message : String(createErr)
      }
    } else {
      results.store = stores[0]
      results.storeStatus = 'FOUND'
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Check categories for this store
    // ═══════════════════════════════════════════════════════════
    results.step = 'checking_categories'
    
    const categories = await db.$queryRawUnsafe<{
      id: string
      name: string
      slug: string
      storeId: string
    }[]>(
      `SELECT id, name, slug, storeId FROM Category WHERE storeId = ?`,
      [user.storeId]
    )
    
    results.categories = categories
    results.categoryCount = categories.length

    if (categories.length === 0) {
      // Create a test category
      results.categoryStatus = 'NONE_FOUND_CREATING_TEST'
      const testCatId = `cat_test_${Date.now()}`
      const now = new Date().toISOString()
      
      try {
        await db.$executeRawUnsafe(
          `INSERT INTO Category (id, name, slug, image, sortOrder, storeId, createdAt) VALUES (?, 'Test Category', 'test-category', '', 0, ?, ?)`,
          [testCatId, user.storeId, now]
        )
        results.testCategoryCreated = { id: testCatId, name: 'Test Category' }
        categories.push({ id: testCatId, name: 'Test Category', slug: 'test-category', storeId: user.storeId })
      } catch (catErr) {
        results.categoryCreateError = catErr instanceof Error ? catErr.message : String(catErr)
      }
    } else {
      results.categoryStatus = 'FOUND'
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 4: Check Product table structure
    // ═══════════════════════════════════════════════════════════
    results.step = 'checking_product_table'
    
    const productCols = await db.$queryRawUnsafe<{ name: string; type: string }[]>(
      `PRAGMA table_info("Product")`
    )
    results.productColumns = productCols.map(c => `${c.name}:${c.type}`)
    
    // Required columns for product creation
    const requiredCols = ['id', 'name', 'slug', 'price', 'storeId', 'categoryId', 'image', 'description', 'createdAt', 'updatedAt']
    const missingCols = requiredCols.filter(rc => !productCols.find(pc => pc.name === rc))
    
    if (missingCols.length > 0) {
      results.missingColumns = missingCols
      return NextResponse.json({
        ...results,
        error: 'Product table is missing required columns',
        missingColumns: missingCols,
        hint: 'Run POST /api/diagnostic to migrate the database'
      }, { status: 500 })
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 5: Try to create a test product
    // ═══════════════════════════════════════════════════════════
    results.step = 'creating_test_product'
    
    if (categories.length === 0) {
      return NextResponse.json({
        ...results,
        error: 'No categories available for test product',
      }, { status: 400 })
    }

    const testProductId = `test_prod_${Date.now()}`
    const testCategory = categories[0]
    const now = new Date().toISOString()
    
    try {
      // Use template literal syntax which works correctly with Prisma
      await db.$executeRaw`
        INSERT INTO Product (
          id, name, slug, description, price, image, 
          categoryId, storeId, isFeatured, isNew, 
          rating, reviewCount, inStock, createdAt, updatedAt
        ) VALUES (
          ${testProductId},
          ${'Test Product'},
          ${`test-product-${Date.now()}`},
          ${''},
          ${99.99},
          ${''},
          ${testCategory.id},
          ${user.storeId},
          ${0},
          ${0},
          ${4.5},
          ${0},
          ${1},
          ${now},
          ${now}
        )
      `
      results.testProductCreated = { id: testProductId, name: 'Test Product' }

      // Verify the product was created
      const createdProduct = await db.$queryRaw<{ id: string; name: string; storeId: string }[]>`
        SELECT id, name, storeId FROM Product WHERE id = ${testProductId}
      `
      results.testProductFound = createdProduct[0] || 'NOT_FOUND_AFTER_INSERT'

      // Clean up test product
      await db.$executeRaw`DELETE FROM Product WHERE id = ${testProductId}`
      results.testProductCleanedUp = true

    } catch (insertError) {
      results.testProductError = insertError instanceof Error ? insertError.message : String(insertError)
      results.testProductErrorStack = insertError instanceof Error ? insertError.stack : undefined
      
      // Get more detailed error info
      const errorMsg = String(insertError)
      if (errorMsg.includes('FOREIGN KEY')) {
        results.errorType = 'FOREIGN_KEY_VIOLATION'
        results.foreignKeyHint = 'Category or Store does not exist or constraint failed'
      } else if (errorMsg.includes('NOT NULL')) {
        results.errorType = 'NOT_NULL_VIOLATION'
        results.notNullHint = 'A required field is missing'
      } else if (errorMsg.includes('UNIQUE')) {
        results.errorType = 'UNIQUE_VIOLATION'
        results.uniqueHint = 'A unique constraint was violated'
      } else if (errorMsg.includes('no such column')) {
        results.errorType = 'MISSING_COLUMN'
        results.missingColumnHint = 'Database schema is out of sync'
      } else {
        results.errorType = 'UNKNOWN'
      }
    }

    results.step = 'complete'
    results.success = !results.testProductError

    return NextResponse.json(results, { status: results.testProductError ? 500 : 200 })

  } catch (error) {
    results.step = 'error'
    results.error = error instanceof Error ? error.message : String(error)
    results.stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(results, { status: 500 })
  }
}

/**
 * POST endpoint to test with authentication
 */
export async function POST(request: Request) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    step: 'initialization',
  }

  try {
    // Extract and verify JWT token
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({
        ...results,
        error: 'No authorization token provided',
        hint: 'Include Authorization: Bearer <token> header or auth-token cookie'
      }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({
        ...results,
        error: 'Invalid or expired token',
      }, { status: 401 })
    }

    results.authenticatedUser = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    }

    // Now run the same diagnostics as GET but using the authenticated user
    const db = await getDb()
    results.dbConnection = 'OK'

    // Check store
    results.step = 'checking_store'
    const stores = await db.$queryRawUnsafe<{ id: string; name: string; slug: string; plan: string; isActive: number }[]>(
      `SELECT id, name, slug, plan, isActive FROM Store WHERE id = ?`,
      [user.storeId]
    )
    results.store = stores[0] || 'NOT_FOUND'

    // Check categories
    results.step = 'checking_categories'
    const categories = await db.$queryRawUnsafe<{ id: string; name: string; slug: string }[]>(
      `SELECT id, name, slug FROM Category WHERE storeId = ?`,
      [user.storeId]
    )
    results.categories = categories

    // Try creating a product
    if (categories.length > 0 && stores.length > 0) {
      results.step = 'creating_test_product'
      const testId = `test_${Date.now()}`
      const now = new Date().toISOString()
      
      try {
        await db.$executeRawUnsafe(
          `INSERT INTO Product (id, name, slug, description, price, image, categoryId, storeId, isFeatured, isNew, rating, reviewCount, inStock, createdAt, updatedAt) VALUES (?, 'Test', ?, '', 10, '', ?, ?, 0, 0, 4.5, 0, 1, ?, ?)`,
          [testId, `test-${Date.now()}`, categories[0].id, user.storeId, now, now]
        )
        results.productCreated = true
        
        // Cleanup
        await db.$executeRawUnsafe(`DELETE FROM Product WHERE id = ?`, [testId])
        results.cleanedUp = true
      } catch (err) {
        results.productCreated = false
        results.error = err instanceof Error ? err.message : String(err)
        results.errorStack = err instanceof Error ? err.stack : undefined
      }
    }

    results.step = 'complete'
    return NextResponse.json(results)

  } catch (error) {
    results.step = 'error'
    results.error = error instanceof Error ? error.message : String(error)
    return NextResponse.json(results, { status: 500 })
  }
}
