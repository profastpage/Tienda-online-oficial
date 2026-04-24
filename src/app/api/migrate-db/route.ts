import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { extractToken, verifyToken, authError } from '@/lib/auth'

// Database migration: ensure all columns from Prisma schema exist in the actual DB
// Safe to call multiple times — only adds missing columns.

export async function POST(request: Request) {
  // Auth check — only super-admin
  const token = extractToken(request)
  if (!token) return authError('No autenticado')

  const payload = await verifyToken(token)
  if (!payload) return authError('Token inválido')
  if (payload.role !== 'super-admin') {
    return authError('Solo super-admin puede ejecutar migraciones', 403)
  }

  try {
    const db = await getDb()
    const results: { table: string; added: string[]; alreadyExisted: string[]; errors: string[] }[] = []

    // ═══════════════════════════════════════════════════════════
    // MIGRATE StoreUser TABLE
    // ═══════════════════════════════════════════════════════════
    const storeUserColumns = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info("StoreUser")`
    )
    const storeUserColNames = storeUserColumns.map(c => c.name)

    const storeUserRequired: { name: string; sql: string }[] = [
      { name: 'googleId', sql: `ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT` },
      { name: 'avatar', sql: `ALTER TABLE "StoreUser" ADD COLUMN "avatar" TEXT DEFAULT ''` },
    ]

    const storeUserAdded: string[] = []
    const storeUserExisted: string[] = []
    const storeUserErrors: string[] = []

    for (const col of storeUserRequired) {
      if (storeUserColNames.includes(col.name)) {
        storeUserExisted.push(col.name)
        continue
      }
      try {
        await db.$executeRawUnsafe(col.sql)
        storeUserAdded.push(col.name)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        storeUserErrors.push(`${col.name}: ${msg}`)
      }
    }

    // Create unique index for googleId
    if (storeUserAdded.some(c => c === 'googleId')) {
      try {
        await db.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "StoreUser_googleId_key" ON "StoreUser"("googleId") WHERE "googleId" IS NOT NULL`
        )
      } catch { /* ignore */ }
    }

    results.push({ table: 'StoreUser', added: storeUserAdded, alreadyExisted: storeUserExisted, errors: storeUserErrors })

    // ═══════════════════════════════════════════════════════════
    // MIGRATE Product TABLE
    // ═══════════════════════════════════════════════════════════
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

    const productAdded: string[] = []
    const productExisted: string[] = []
    const productErrors: string[] = []

    for (const col of productRequired) {
      if (productColNames.includes(col.name)) {
        productExisted.push(col.name)
        continue
      }
      try {
        await db.$executeRawUnsafe(col.sql)
        productAdded.push(col.name)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        productErrors.push(`${col.name}: ${msg}`)
      }
    }

    results.push({ table: 'Product', added: productAdded, alreadyExisted: productExisted, errors: productErrors })

    // ═══════════════════════════════════════════════════════════
    // MIGRATE Store TABLE
    // ═══════════════════════════════════════════════════════════
    const storeColumns = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info("Store")`
    )
    const storeColNames = storeColumns.map(c => c.name)

    const storeRequired: { name: string; sql: string }[] = [
      { name: 'subscriptionExpiresAt', sql: `ALTER TABLE "Store" ADD COLUMN "subscriptionExpiresAt" DATETIME` },
      { name: 'trialDays', sql: `ALTER TABLE "Store" ADD COLUMN "trialDays" INTEGER DEFAULT 0` },
      { name: 'primaryColor', sql: `ALTER TABLE "Store" ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#171717'` },
      { name: 'secondaryColor', sql: `ALTER TABLE "Store" ADD COLUMN "secondaryColor" TEXT NOT NULL DEFAULT '#fafafa'` },
      { name: 'accentColor', sql: `ALTER TABLE "Store" ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#171717'` },
      { name: 'fontFamily', sql: `ALTER TABLE "Store" ADD COLUMN "fontFamily" TEXT NOT NULL DEFAULT 'system-ui'` },
      { name: 'customCSS', sql: `ALTER TABLE "Store" ADD COLUMN "customCSS" TEXT NOT NULL DEFAULT ''` },
      { name: 'favicon', sql: `ALTER TABLE "Store" ADD COLUMN "favicon" TEXT NOT NULL DEFAULT ''` },
    ]

    const storeAdded: string[] = []
    const storeExisted: string[] = []
    const storeErrors: string[] = []

    for (const col of storeRequired) {
      if (storeColNames.includes(col.name)) {
        storeExisted.push(col.name)
        continue
      }
      try {
        await db.$executeRawUnsafe(col.sql)
        storeAdded.push(col.name)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        storeErrors.push(`${col.name}: ${msg}`)
      }
    }

    results.push({ table: 'Store', added: storeAdded, alreadyExisted: storeExisted, errors: storeErrors })

    // Summary
    const totalAdded = results.reduce((sum, r) => sum + r.added.length, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

    return NextResponse.json({
      success: totalErrors === 0,
      message: totalAdded > 0
        ? `Added ${totalAdded} column(s) across ${results.length} table(s)`
        : 'All columns already present — no migration needed',
      results,
      summary: {
        tablesMigrated: results.length,
        totalColumnsAdded: totalAdded,
        totalErrors,
      },
    })
  } catch (error) {
    console.error('[migrate-db] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Auth check — only super-admin
  const token = extractToken(request)
  if (!token) return authError('No autenticado')

  const payload = await verifyToken(token)
  if (!payload) return authError('Token inválido')
  if (payload.role !== 'super-admin') {
    return authError('Solo super-admin puede ver migraciones', 403)
  }

  try {
    const db = await getDb()

    // Check all tables
    const tables = ['StoreUser', 'Product', 'Store']
    const tableInfo: Record<string, { columns: string[]; missing: string[] }> = {}

    const prismaColumns: Record<string, string[]> = {
      StoreUser: ['id', 'email', 'password', 'name', 'phone', 'address', 'role', 'storeId', 'twoFactorSecret', 'twoFactorEnabled', 'googleId', 'avatar', 'createdAt', 'updatedAt'],
      Product: ['id', 'name', 'slug', 'description', 'price', 'comparePrice', 'image', 'images', 'categoryId', 'storeId', 'isFeatured', 'isNew', 'discount', 'sizes', 'colors', 'rating', 'reviewCount', 'inStock', 'createdAt', 'updatedAt'],
      Store: ['id', 'name', 'slug', 'logo', 'whatsappNumber', 'address', 'description', 'isActive', 'plan', 'subscriptionExpiresAt', 'trialDays', 'customDomain', 'domainVerified', 'domainVerifiedAt', 'primaryColor', 'secondaryColor', 'accentColor', 'fontFamily', 'customCSS', 'favicon', 'createdAt', 'updatedAt'],
    }

    for (const table of tables) {
      const columns = await db.$queryRawUnsafe<{ name: string }[]>(
        `PRAGMA table_info("${table}")`
      )
      const colNames = columns.map(c => c.name)
      const missing = prismaColumns[table]?.filter(pc => !colNames.includes(pc)) || []
      tableInfo[table] = { columns: colNames, missing }
    }

    return NextResponse.json({
      provider: process.env.TURSO_URL ? 'turso' : 'local-sqlite',
      tables: tableInfo,
      needsMigration: Object.values(tableInfo).some(t => t.missing.length > 0),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
