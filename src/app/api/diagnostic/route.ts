import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Diagnostic endpoint - no auth required for debugging
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')
  const email = searchParams.get('email')
  
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    provider: process.env.TURSO_URL ? 'turso' : 'local-sqlite',
    env: process.env.NODE_ENV,
  }

  try {
    const db = await getDb()
    results.dbConnection = 'OK'

    // ═══════════════════════════════════════════════════════════
    // CHECK TABLES EXIST
    // ═══════════════════════════════════════════════════════════
    const tables = await db.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name
    `
    results.tables = tables.map(t => t.name)

    // ═══════════════════════════════════════════════════════════
    // CHECK COLUMN STRUCTURE FOR EACH TABLE
    // ═══════════════════════════════════════════════════════════
    const tableStructures: Record<string, string[]> = {}
    for (const table of ['Store', 'StoreUser', 'Product', 'Category', 'Order']) {
      try {
        const columns = await db.$queryRawUnsafe<{ name: string; type: string }[]>(
          `PRAGMA table_info("${table}")`
        )
        tableStructures[table] = columns.map(c => `${c.name}:${c.type}`)
      } catch {
        tableStructures[table] = ['ERROR - table may not exist']
      }
    }
    results.tableStructures = tableStructures

    // ═══════════════════════════════════════════════════════════
    // COUNT RECORDS
    // ═══════════════════════════════════════════════════════════
    const counts: Record<string, number> = {}
    for (const table of ['Store', 'StoreUser', 'Product', 'Category', 'Order']) {
      try {
        const result = await db.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM "${table}"`
        )
        counts[table] = result[0]?.count || 0
      } catch {
        counts[table] = -1
      }
    }
    results.recordCounts = counts

    // ═══════════════════════════════════════════════════════════
    // CHECK SPECIFIC USER (if email provided)
    // ═══════════════════════════════════════════════════════════
    if (email) {
      try {
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
        results.userLookup = users.length > 0 ? users[0] : 'NOT FOUND'
        
        // If user has storeId, check the store
        if (users[0]?.storeId) {
          const stores = await db.$queryRawUnsafe<{
            id: string
            name: string
            slug: string
            plan: string
            isActive: number
          }[]>(
            `SELECT id, name, slug, plan, isActive FROM Store WHERE id = ?`,
            [users[0].storeId]
          )
          results.userStore = stores.length > 0 ? stores[0] : 'STORE NOT FOUND'
          
          // Check products for this store
          const products = await db.$queryRawUnsafe<{ count: number }[]>(
            `SELECT COUNT(*) as count FROM Product WHERE storeId = ?`,
            [users[0].storeId]
          )
          results.storeProductCount = products[0]?.count || 0
          
          // Check categories for this store
          const categories = await db.$queryRawUnsafe<{ count: number }[]>(
            `SELECT COUNT(*) as count FROM Category WHERE storeId = ?`,
            [users[0].storeId]
          )
          results.storeCategoryCount = categories[0]?.count || 0
        }
      } catch (err) {
        results.userLookupError = err instanceof Error ? err.message : String(err)
      }
    }

    // ═══════════════════════════════════════════════════════════
    // CHECK SPECIFIC STORE (if storeId provided)
    // ═══════════════════════════════════════════════════════════
    if (storeId) {
      try {
        const stores = await db.$queryRawUnsafe<{
          id: string
          name: string
          slug: string
          plan: string
          isActive: number
        }[]>(
          `SELECT id, name, slug, plan, isActive FROM Store WHERE id = ?`,
          [storeId]
        )
        results.storeLookup = stores.length > 0 ? stores[0] : 'STORE NOT FOUND'
      } catch (err) {
        results.storeLookupError = err instanceof Error ? err.message : String(err)
      }
    }

    // ═══════════════════════════════════════════════════════════
    // LIST ALL STORES
    // ═══════════════════════════════════════════════════════════
    try {
      const allStores = await db.$queryRaw<{
        id: string
        name: string
        slug: string
        plan: string
        isActive: number
      }[]>`
        SELECT id, name, slug, plan, isActive FROM Store ORDER BY createdAt DESC
      `
      results.allStores = allStores
    } catch (err) {
      results.allStoresError = err instanceof Error ? err.message : String(err)
    }

    // ═══════════════════════════════════════════════════════════
    // LIST ALL USERS
    // ═══════════════════════════════════════════════════════════
    try {
      const allUsers = await db.$queryRaw<{
        id: string
        email: string
        name: string
        role: string
        storeId: string | null
      }[]>`
        SELECT id, email, name, role, storeId FROM StoreUser ORDER BY createdAt DESC
      `
      results.allUsers = allUsers
    } catch (err) {
      results.allUsersError = err instanceof Error ? err.message : String(err)
    }

    // ═══════════════════════════════════════════════════════════
    // TEST PRODUCT INSERT (dry run)
    // ═══════════════════════════════════════════════════════════
    try {
      // Check if we can query Product table structure
      const productCols = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Product")`
      )
      const colNames = productCols.map(c => c.name)
      
      // Check for required columns
      const requiredCols = ['id', 'name', 'slug', 'price', 'storeId', 'categoryId', 'image', 'description', 'inStock', 'createdAt', 'updatedAt']
      const missingCols = requiredCols.filter(c => !colNames.includes(c))
      
      results.productTableCheck = {
        existingColumns: colNames,
        missingColumns: missingCols.length > 0 ? missingCols : 'NONE - all required columns exist'
      }
    } catch (err) {
      results.productTableCheckError = err instanceof Error ? err.message : String(err)
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error)
    results.stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(results, { status: 500 })
  }
}

// POST to run migrations and fix issues
export async function POST() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    actions: [] as string[],
  }

  try {
    const db = await getDb()

    // ═══════════════════════════════════════════════════════════
    // RUN MIGRATIONS
    // ═══════════════════════════════════════════════════════════
    
    // Product table
    try {
      const productCols = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Product")`
      )
      const productColNames = productCols.map(c => c.name)

      const productMigrations = [
        { name: 'images', sql: `ALTER TABLE "Product" ADD COLUMN "images" TEXT DEFAULT '[]'` },
        { name: 'sizes', sql: `ALTER TABLE "Product" ADD COLUMN "sizes" TEXT DEFAULT '[]'` },
        { name: 'colors', sql: `ALTER TABLE "Product" ADD COLUMN "colors" TEXT DEFAULT '[]'` },
        { name: 'comparePrice', sql: `ALTER TABLE "Product" ADD COLUMN "comparePrice" REAL` },
      ]

      for (const col of productMigrations) {
        if (!productColNames.includes(col.name)) {
          try {
            await db.$executeRawUnsafe(col.sql)
            ;(results.actions as string[]).push(`Added Product.${col.name}`)
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (!msg.includes('duplicate column')) {
              ;(results.actions as string[]).push(`Failed Product.${col.name}: ${msg}`)
            }
          }
        }
      }
    } catch (err) {
      ;(results.actions as string[]).push(`Product migration error: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Category table
    try {
      const categoryCols = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Category")`
      )
      const categoryColNames = categoryCols.map(c => c.name)

      if (!categoryColNames.includes('image')) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN "image" TEXT DEFAULT ''`)
          ;(results.actions as string[]).push('Added Category.image')
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (!msg.includes('duplicate column')) {
            ;(results.actions as string[]).push(`Failed Category.image: ${msg}`)
          }
        }
      }
    } catch (err) {
      ;(results.actions as string[]).push(`Category migration error: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Store table
    try {
      const storeCols = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Store")`
      )
      const storeColNames = storeCols.map(c => c.name)

      const storeMigrations = [
        { name: 'subscriptionExpiresAt', sql: `ALTER TABLE "Store" ADD COLUMN "subscriptionExpiresAt" DATETIME` },
        { name: 'trialDays', sql: `ALTER TABLE "Store" ADD COLUMN "trialDays" INTEGER DEFAULT 0` },
      ]

      for (const col of storeMigrations) {
        if (!storeColNames.includes(col.name)) {
          try {
            await db.$executeRawUnsafe(col.sql)
            ;(results.actions as string[]).push(`Added Store.${col.name}`)
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (!msg.includes('duplicate column')) {
              ;(results.actions as string[]).push(`Failed Store.${col.name}: ${msg}`)
            }
          }
        }
      }
    } catch (err) {
      ;(results.actions as string[]).push(`Store migration error: ${err instanceof Error ? err.message : String(err)}`)
    }

    // StoreUser table
    try {
      const userCols = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("StoreUser")`
      )
      const userColNames = userCols.map(c => c.name)

      const userMigrations = [
        { name: 'googleId', sql: `ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT` },
        { name: 'avatar', sql: `ALTER TABLE "StoreUser" ADD COLUMN "avatar" TEXT DEFAULT ''` },
      ]

      for (const col of userMigrations) {
        if (!userColNames.includes(col.name)) {
          try {
            await db.$executeRawUnsafe(col.sql)
            ;(results.actions as string[]).push(`Added StoreUser.${col.name}`)
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (!msg.includes('duplicate column')) {
              ;(results.actions as string[]).push(`Failed StoreUser.${col.name}: ${msg}`)
            }
          }
        }
      }

      // Create index for googleId
      try {
        await db.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "StoreUser_googleId_key" ON "StoreUser"("googleId") WHERE "googleId" IS NOT NULL`
        )
      } catch { /* ignore */ }
    } catch (err) {
      ;(results.actions as string[]).push(`StoreUser migration error: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Check final state
    const tables = ['Product', 'Category', 'Store', 'StoreUser']
    const finalState: Record<string, string[]> = {}
    for (const table of tables) {
      try {
        const cols = await db.$queryRawUnsafe<{ name: string }[]>(
          `PRAGMA table_info("${table}")`
        )
        finalState[table] = cols.map(c => c.name)
      } catch {
        finalState[table] = ['ERROR']
      }
    }
    results.finalTableState = finalState

    if ((results.actions as string[]).length === 0) {
      ;(results.actions as string[]).push('No migrations needed - all columns present')
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error)
    return NextResponse.json(results, { status: 500 })
  }
}
