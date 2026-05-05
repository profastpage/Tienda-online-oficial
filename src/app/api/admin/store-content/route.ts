import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner, requireStoreApproved } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch all store content for the authenticated store
export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const db = await getDb()

    // Try to use Prisma, fallback to raw SQL if table doesn't exist yet
    let rows: Array<{ section: string; key: string; value: string }> = []
    try {
      const contents = await db.$queryRaw<{ section: string; key: string; value: string }[]>`
        SELECT section, key, value FROM StoreContent WHERE storeId = ${storeId}
      `
      rows = contents
    } catch {
      // Table might not exist yet - auto-create
      try {
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "StoreContent" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "storeId" TEXT NOT NULL,
            "section" TEXT NOT NULL,
            "key" TEXT NOT NULL,
            "value" TEXT NOT NULL DEFAULT '',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "StoreContent_storeId_section_key_key" UNIQUE("storeId", "section", "key"),
            FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE
          )
        `)
        console.log('[admin/store-content] Auto-created StoreContent table')
      } catch (createErr) {
        console.warn('[admin/store-content] Could not create table:', createErr)
      }
    }

    // Organize into sections
    const content: Record<string, Record<string, string>> = {}
    for (const row of rows) {
      if (!content[row.section]) content[row.section] = {}
      content[row.section][row.key] = row.value
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('[admin/store-content GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al obtener contenido', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

// POST - Create or update store content items (bulk)
export async function POST(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    // ═══ APPROVAL CHECK: Block if store is pending/rejected/suspended ═══
    const approval = await requireStoreApproved(request)
    if (approval.error) return approval.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const db = await getDb()

    // Ensure table exists
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "StoreContent" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "storeId" TEXT NOT NULL,
          "section" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL DEFAULT '',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "StoreContent_storeId_section_key_key" UNIQUE("storeId", "section", "key"),
          FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)
    } catch { /* table already exists */ }

    const body = await request.json()
    // body can be: { items: [{ section, key, value }] } or { section, key, value }
    let items: Array<{ section: string; key: string; value: string }> = []

    if (body.items && Array.isArray(body.items)) {
      items = body.items
    } else if (body.section && body.key !== undefined) {
      items = [{ section: body.section, key: body.key, value: body.value || '' }]
    } else {
      return NextResponse.json({ error: 'Formato inválido. Usa { items: [...] } o { section, key, value }' }, { status: 400 })
    }

    const now = new Date().toISOString()
    let created = 0
    let updated = 0

    for (const item of items) {
      const id = `sc_${storeId}_${item.section}_${item.key}`.replace(/[^a-zA-Z0-9_]/g, '_')
      try {
        const result = await db.$executeRawUnsafe(
          `INSERT INTO "StoreContent" ("id", "storeId", "section", "key", "value", "createdAt", "updatedAt")
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT("storeId", "section", "key") DO UPDATE SET "value" = ?, "updatedAt" = ?`,
          id, storeId, item.section, item.key, String(item.value), now, now,
          String(item.value), now
        )
        if (result) updated++
        else created++
      } catch (err) {
        console.warn(`[admin/store-content] Error upserting ${item.section}.${item.key}:`, err)
      }
    }

    return NextResponse.json({ success: true, created, updated })
  } catch (error) {
    console.error('[admin/store-content POST]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al guardar contenido' }, { status: 500 })
  }
}

// DELETE - Remove a content item
export async function DELETE(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const key = searchParams.get('key')

    if (!section) return NextResponse.json({ error: 'Se requiere "section"' }, { status: 400 })

    const db = await getDb()

    if (key) {
      await db.$executeRawUnsafe(
        `DELETE FROM "StoreContent" WHERE "storeId" = ? AND "section" = ? AND "key" = ?`,
        storeId, section, key
      )
    } else {
      // Delete entire section
      await db.$executeRawUnsafe(
        `DELETE FROM "StoreContent" WHERE "storeId" = ? AND "section" = ?`,
        storeId, section
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/store-content DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al eliminar contenido' }, { status: 500 })
  }
}
