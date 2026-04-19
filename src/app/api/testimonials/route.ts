import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Default testimonials for demo stores
const defaultTestimonials = [
  {
    id: 't1',
    name: 'María García',
    role: 'Cliente Frecuente',
    content: 'Excelente calidad y atención. Los productos llegaron en perfectas condiciones y el envío fue súper rápido.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Carlos López',
    role: 'Cliente Verificado',
    content: 'La mejor tienda online que he usado. Los precios son competitivos y la atención al cliente es excepcional.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Ana Torres',
    role: 'Compradora Regular',
    content: 'Me encanta la variedad de productos. Siempre encuentro lo que busco y la calidad es excelente.',
    rating: 5,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store')

    if (!storeSlug) {
      return NextResponse.json(defaultTestimonials)
    }

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
      // Store not found or no testimonials - return default
      return NextResponse.json(defaultTestimonials)
    } catch (dbError) {
      console.warn('[api/testimonials] Database error:', dbError instanceof Error ? dbError.message : dbError)
      return NextResponse.json(defaultTestimonials)
    }
  } catch (error) {
    console.error('[api/testimonials] Error:', error)
    return NextResponse.json(defaultTestimonials)
  }
}
