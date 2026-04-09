import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Database migration: ensure all columns from Prisma schema exist in the actual DB
// Safe to call multiple times — only adds missing columns.

export async function POST() {
  try {
    const db = await getDb()

    const columns = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info("StoreUser")`
    )
    const existingColNames = columns.map(c => c.name)

    // Columns from Prisma schema that might be missing in Turso
    const requiredColumns: { name: string; sql: string }[] = [
      {
        name: 'googleId',
        sql: `ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT`,
      },
      {
        name: 'avatar',
        sql: `ALTER TABLE "StoreUser" ADD COLUMN "avatar" TEXT DEFAULT ''`,
      },
    ]

    const addedColumns: string[] = []
    const alreadyExisted: string[] = []

    for (const col of requiredColumns) {
      if (existingColNames.includes(col.name)) {
        alreadyExisted.push(col.name)
        continue
      }
      try {
        await db.$executeRawUnsafe(col.sql)
        addedColumns.push(col.name)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[migrate-db] Failed to add ${col.name}:`, msg)
        addedColumns.push(`${col.name} (FAILED: ${msg})`)
      }
    }

    // Create unique index for googleId if it was just added
    if (addedColumns.some(c => c.startsWith('googleId'))) {
      try {
        await db.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "StoreUser_googleId_key" ON "StoreUser"("googleId") WHERE "googleId" IS NOT NULL`
        )
      } catch {
        // Ignore index creation errors
      }
    }

    // Verify final state
    const finalColumns = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info("StoreUser")`
    )

    return NextResponse.json({
      success: true,
      message: addedColumns.length > 0
        ? `Added ${addedColumns.length} column(s) to StoreUser`
        : 'All columns already present — no migration needed',
      added: addedColumns,
      alreadyExisted,
      finalColumns: finalColumns.map(c => c.name),
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

export async function GET() {
  try {
    const db = await getDb()

    const columns = await db.$queryRawUnsafe<{ name: string; type: string; notnull: number }[]>(
      `PRAGMA table_info("StoreUser")`
    )

    const prismaCols = ['id', 'email', 'password', 'name', 'phone', 'address', 'role', 'storeId', 'twoFactorSecret', 'twoFactorEnabled', 'googleId', 'avatar', 'createdAt', 'updatedAt']
    const missingCols = prismaCols.filter(pc => !columns.some(c => c.name === pc))

    return NextResponse.json({
      table: 'StoreUser',
      columnCount: columns.length,
      missingColumns: missingCols.length > 0 ? missingCols : [],
      allColumns: columns.map(c => c.name),
      provider: process.env.TURSO_URL ? 'turso' : 'local-sqlite',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
