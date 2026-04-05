import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store') || 'urban-store'

    const store = await db.store.findUnique({ where: { slug: storeSlug } })
    if (!store) return NextResponse.json([])

    const testimonials = await db.testimonial.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(testimonials)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
