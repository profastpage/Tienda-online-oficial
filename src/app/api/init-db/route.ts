import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api-auth'
import {
  seedStore,
  seedCategories,
  seedProducts,
  seedTestimonials,
} from '@/lib/seed-data'

function uid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export async function POST(request: Request) {
  try {
    // Rate limit protection
    if (!checkRateLimit(request, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Require INIT_DB_SECRET from authorization header
    const initSecret = process.env.INIT_DB_SECRET
    if (!initSecret) {
      return NextResponse.json({ error: 'Database initialization is not configured' }, { status: 503 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${initSecret}`) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('[api/init-db] Database seeding initiated', body?.DATABASE_URL ? '(remote URL provided)' : '(using default connection)')

    const db = await getDb()

    // 1. Upsert Store
    const store = await db.store.upsert({
      where: { slug: seedStore.slug },
      update: {
        name: seedStore.name,
        whatsappNumber: seedStore.whatsappNumber,
        address: seedStore.address,
        description: seedStore.description,
        isActive: seedStore.isActive,
        plan: seedStore.plan,
      },
      create: {
        id: seedStore.id,
        name: seedStore.name,
        slug: seedStore.slug,
        whatsappNumber: seedStore.whatsappNumber,
        address: seedStore.address,
        description: seedStore.description,
        isActive: seedStore.isActive,
        plan: seedStore.plan,
      },
    })

    const storeId = store.id

    // 2. Upsert Admin User (admin@urbanstyle.pe - matches login page test account)
    await db.storeUser.upsert({
      where: { email_storeId: { email: 'admin@urbanstyle.pe', storeId } },
      update: {},
      create: {
        id: 'seed-admin-001',
        email: 'admin@urbanstyle.pe',
        password: '$2b$10$GVQcWTi4dfqJoiLNcmp0EupYzPu2OO4GO1gWiUAoqvW9hcqpy9AAy',
        name: 'Admin Urban Style',
        phone: '51999999999',
        role: 'admin',
        storeId,
      },
    })

    // 3. Upsert Customer Test User (cliente@email.com - matches login page test account)
    await db.storeUser.upsert({
      where: { email_storeId: { email: 'cliente@email.com', storeId } },
      update: {},
      create: {
        id: 'seed-client-001',
        email: 'cliente@email.com',
        password: '$2b$10$7QKH/7wCqEt6J0ufdz8hG.qpjNeatsnuDZ3WCd/l0bDTONL1nx4aG',
        name: 'Cliente Demo',
        phone: '51988888888',
        role: 'customer',
        storeId,
      },
    })

    // 4. Upsert Categories
    const categoryIdMap: Record<string, string> = {}
    for (const cat of seedCategories) {
      const created = await db.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          sortOrder: cat.sortOrder,
          storeId,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          sortOrder: cat.sortOrder,
          storeId,
        },
      })
      categoryIdMap[cat.slug] = created.id
    }

    // 5. Upsert Products
    for (const p of seedProducts) {
      const catId = categoryIdMap[p.category.slug]
      if (!catId) continue

      await db.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          image: p.image,
          categoryId: catId,
          storeId,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          discount: p.discount,
          sizes: p.sizes,
          colors: p.colors,
          rating: p.rating,
          reviewCount: p.reviewCount,
          inStock: p.inStock,
        },
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          image: p.image,
          categoryId: catId,
          storeId,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          discount: p.discount,
          sizes: p.sizes,
          colors: p.colors,
          rating: p.rating,
          reviewCount: p.reviewCount,
          inStock: p.inStock,
        },
      })
    }

    // 6. Upsert Testimonials
    for (const t of seedTestimonials) {
      await db.testimonial.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
          storeId,
        },
        create: {
          id: t.id,
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
          storeId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        store: storeId,
        adminUser: 'admin@urbanstyle.pe',
        customerUser: 'cliente@email.com',
        categories: seedCategories.length,
        products: seedProducts.length,
        testimonials: seedTestimonials.length,
      },
    })
  } catch (error) {
    console.error('[api/init-db] Seeding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
