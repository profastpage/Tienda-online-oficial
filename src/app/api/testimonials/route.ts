import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { seedTestimonials } from '@/lib/seed-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store') || 'urban-store'

    // Try database first
    try {
      const db = await getDb()

      const store = await db.store.findUnique({ where: { slug: storeSlug } })
      if (store) {
        const testimonials = await db.testimonial.findMany({
          where: { storeId: store.id },
          orderBy: { createdAt: 'desc' },
        })

        if (testimonials.length > 0) {
          return NextResponse.json(testimonials)
        }
      }
    } catch (dbError) {
      console.warn('[api/testimonials] Database unavailable, using seed data fallback:', dbError)
    }

    // Fallback to seed data
    return NextResponse.json(seedTestimonials)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
