import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Auto-migration endpoint - runs database migrations to add missing columns
// This is called automatically when needed, no auth required for safety

let migrationRan = false
let migrationPromise: Promise<void> | null = null

async function runMigrations(db: Awaited<ReturnType<typeof getDb>>) {
  if (migrationRan) return
  if (migrationPromise) {
    await migrationPromise
    return
  }

  migrationPromise = (async () => {
    console.log('[auto-migrate] Starting database migrations...')
    const results: string[] = []

    // ═══════════════════════════════════════════════════════════
    // MIGRATE Product TABLE
    // ═══════════════════════════════════════════════════════════
    try {
      const productColumns = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Product")`
      )
      const productColNames = productColumns.map(c => c.name)

      const productRequired: { name: string; sql: string }[] = [
        { name: 'images', sql: `ALTER TABLE "Product" ADD COLUMN "images" TEXT DEFAULT '[]'` },
        { name: 'sizes', sql: `ALTER TABLE "Product" ADD COLUMN "sizes" TEXT DEFAULT '[]'` },
        { name: 'colors', sql: `ALTER TABLE "Product" ADD COLUMN "colors" TEXT DEFAULT '[]'` },
        { name: 'comparePrice', sql: `ALTER TABLE "Product" ADD COLUMN "comparePrice" REAL` },
      ]

      for (const col of productRequired) {
        if (productColNames.includes(col.name)) continue
        try {
          await db.$executeRawUnsafe(col.sql)
          results.push(`Product.${col.name} added`)
          console.log(`[auto-migrate] Added column Product.${col.name}`)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (!msg.includes('duplicate column')) {
            console.warn(`[auto-migrate] Product.${col.name} failed:`, msg)
          }
        }
      }
    } catch (err) {
      console.error('[auto-migrate] Product table check failed:', err)
    }

    // ═══════════════════════════════════════════════════════════
    // MIGRATE StoreUser TABLE
    // ═══════════════════════════════════════════════════════════
    try {
      const storeUserColumns = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("StoreUser")`
      )
      const storeUserColNames = storeUserColumns.map(c => c.name)

      const storeUserRequired: { name: string; sql: string }[] = [
        { name: 'googleId', sql: `ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT` },
        { name: 'avatar', sql: `ALTER TABLE "StoreUser" ADD COLUMN "avatar" TEXT DEFAULT ''` },
      ]

      for (const col of storeUserRequired) {
        if (storeUserColNames.includes(col.name)) continue
        try {
          await db.$executeRawUnsafe(col.sql)
          results.push(`StoreUser.${col.name} added`)
          console.log(`[auto-migrate] Added column StoreUser.${col.name}`)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (!msg.includes('duplicate column')) {
            console.warn(`[auto-migrate] StoreUser.${col.name} failed:`, msg)
          }
        }
      }

      // Create unique index for googleId
      try {
        await db.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "StoreUser_googleId_key" ON "StoreUser"("googleId") WHERE "googleId" IS NOT NULL`
        )
      } catch { /* ignore */ }
    } catch (err) {
      console.error('[auto-migrate] StoreUser table check failed:', err)
    }

    // ═══════════════════════════════════════════════════════════
    // MIGRATE Store TABLE
    // ═══════════════════════════════════════════════════════════
    try {
      const storeColumns = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Store")`
      )
      const storeColNames = storeColumns.map(c => c.name)

      const storeRequired: { name: string; sql: string }[] = [
        { name: 'subscriptionExpiresAt', sql: `ALTER TABLE "Store" ADD COLUMN "subscriptionExpiresAt" DATETIME` },
        { name: 'trialDays', sql: `ALTER TABLE "Store" ADD COLUMN "trialDays" INTEGER DEFAULT 0` },
      ]

      for (const col of storeRequired) {
        if (storeColNames.includes(col.name)) continue
        try {
          await db.$executeRawUnsafe(col.sql)
          results.push(`Store.${col.name} added`)
          console.log(`[auto-migrate] Added column Store.${col.name}`)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (!msg.includes('duplicate column')) {
            console.warn(`[auto-migrate] Store.${col.name} failed:`, msg)
          }
        }
      }
    } catch (err) {
      console.error('[auto-migrate] Store table check failed:', err)
    }

    // ═══════════════════════════════════════════════════════════
    // MIGRATE Category TABLE - ensure image column exists
    // ═══════════════════════════════════════════════════════════
    try {
      const categoryColumns = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("Category")`
      )
      const categoryColNames = categoryColumns.map(c => c.name)

      if (!categoryColNames.includes('image')) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN "image" TEXT DEFAULT ''`)
          results.push('Category.image added')
          console.log('[auto-migrate] Added column Category.image')
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (!msg.includes('duplicate column')) {
            console.warn('[auto-migrate] Category.image failed:', msg)
          }
        }
      }
    } catch (err) {
      console.error('[auto-migrate] Category table check failed:', err)
    }

    migrationRan = true
    console.log('[auto-migrate] Migrations complete:', results.length > 0 ? results.join(', ') : 'no changes needed')
  })()

  await migrationPromise
}

// GET endpoint to check migration status
export async function GET() {
  try {
    const db = await getDb()
    
    // Check current table structure
    const tables = ['Product', 'StoreUser', 'Store', 'Category']
    const tableInfo: Record<string, string[]> = {}
    
    for (const table of tables) {
      try {
        const columns = await db.$queryRawUnsafe<{ name: string }[]>(
          `PRAGMA table_info("${table}")`
        )
        tableInfo[table] = columns.map(c => c.name)
      } catch {
        tableInfo[table] = ['ERROR - table may not exist']
      }
    }

    return NextResponse.json({
      status: migrationRan ? 'migrated' : 'pending',
      provider: process.env.TURSO_URL ? 'turso' : 'local-sqlite',
      tables: tableInfo,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST endpoint to run migrations
export async function POST() {
  try {
    const db = await getDb()
    await runMigrations(db)
    
    // Re-check structure after migration
    const tables = ['Product', 'StoreUser', 'Store', 'Category']
    const tableInfo: Record<string, string[]> = {}
    
    for (const table of tables) {
      try {
        const columns = await db.$queryRawUnsafe<{ name: string }[]>(
          `PRAGMA table_info("${table}")`
        )
        tableInfo[table] = columns.map(c => c.name)
      } catch {
        tableInfo[table] = ['ERROR']
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migrations executed successfully',
      provider: process.env.TURSO_URL ? 'turso' : 'local-sqlite',
      tables: tableInfo,
    })
  } catch (error) {
    console.error('[auto-migrate] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
