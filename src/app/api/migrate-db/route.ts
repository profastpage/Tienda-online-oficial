import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// One-time migration: add googleId column to StoreUser table
// This endpoint safely adds the column if it doesn't exist.
// Should be called once and then deleted.

export async function POST() {
  try {
    const db = await getDb()

    // Check if googleId column exists
    const columns = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info("StoreUser")`
    )

    const hasGoogleId = columns.some(col => col.name === 'googleId')

    if (hasGoogleId) {
      return NextResponse.json({
        success: true,
        message: 'googleId column already exists — no migration needed',
        columns: columns.map(c => c.name),
      })
    }

    // Add the column
    await db.$executeRawUnsafe(
      `ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT`
    )

    // Create unique index
    try {
      await db.$executeRawUnsafe(
        `CREATE UNIQUE INDEX "StoreUser_googleId_key" ON "StoreUser"("googleId") WHERE "googleId" IS NOT NULL`
      )
    } catch {
      // Index might already exist, that's fine
    }

    // Verify the column was added
    const updatedColumns = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info("StoreUser")`
    )

    return NextResponse.json({
      success: true,
      message: 'Migration successful: added googleId column to StoreUser',
      columnsBefore: columns.map(c => c.name),
      columnsAfter: updatedColumns.map(c => c.name),
    })
  } catch (error) {
    console.error('[migrate-db] Migration failed:', error)
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

// Also allow GET for easy verification
export async function GET() {
  try {
    const db = await getDb()

    const columns = await db.$queryRawUnsafe<{ name: string, type: string, notnull: number }[]>(
      `PRAGMA table_info("StoreUser")`
    )

    const hasGoogleId = columns.some(col => col.name === 'googleId')

    return NextResponse.json({
      table: 'StoreUser',
      hasGoogleId,
      columns: columns.map(c => ({ name: c.name, type: c.type, required: c.notnull === 1 })),
      provider: process.env.TURSO_URL ? 'turso' : 'local-sqlite',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
