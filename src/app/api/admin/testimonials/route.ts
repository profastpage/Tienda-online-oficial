import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch testimonials for the authenticated store
export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const db = await getDb()
    const testimonials = await db.$queryRaw<Array<{
      id: string; name: string; role: string; content: string; rating: number; storeId: string
    }>>`
      SELECT id, name, role, content, rating, storeId FROM Testimonial WHERE storeId = ${storeId} ORDER BY "createdAt" ASC
    `

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('[admin/testimonials GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al obtener testimonios' }, { status: 500 })
  }
}

// POST - Create a new testimonial
export async function POST(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const body = await request.json()
    const { name, role, content, rating } = body

    if (!name || !content) {
      return NextResponse.json({ error: 'Nombre y contenido son requeridos' }, { status: 400 })
    }

    const id = `test_${storeId}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, '_')
    const now = new Date().toISOString()

    const db = await getDb()
    await db.$executeRawUnsafe(
      `INSERT INTO "Testimonial" ("id", "name", "role", "content", "rating", "storeId", "createdAt")
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id, name, role || '', content, rating || 5, storeId, now
    )

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[admin/testimonials POST]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al crear testimonio' }, { status: 500 })
  }
}

// PUT - Update an existing testimonial
export async function PUT(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const body = await request.json()
    const { id, name, role, content, rating } = body

    if (!id) {
      return NextResponse.json({ error: 'ID del testimonio es requerido' }, { status: 400 })
    }

    const db = await getDb()
    await db.$executeRawUnsafe(
      `UPDATE "Testimonial" SET "name" = ?, "role" = ?, "content" = ?, "rating" = ? WHERE "id" = ? AND "storeId" = ?`,
      name, role || '', content, rating || 5, id, storeId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/testimonials PUT]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al actualizar testimonio' }, { status: 500 })
  }
}

// DELETE - Remove a testimonial
export async function DELETE(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    if (!storeId) return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Se requiere "id"' }, { status: 400 })

    const db = await getDb()
    await db.$executeRawUnsafe(
      `DELETE FROM "Testimonial" WHERE "id" = ? AND "storeId" = ?`,
      id, storeId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/testimonials DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al eliminar testimonio' }, { status: 500 })
  }
}
