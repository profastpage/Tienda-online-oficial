import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
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
    const body = await request.json().catch(() => ({}))
    // DATABASE_URL from body is informational — getDb() handles connection internally
    // This endpoint is designed to be called after Turso (or another remote DB) is configured
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

    // 2. Upsert Admin User
    await db.storeUser.upsert({
      where: { email_storeId: { email: 'admin@urbanstore.pe', storeId } },
      update: {},
      create: {
        id: uid(),
        email: 'admin@urbanstore.pe',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK',
        name: 'Admin Urban',
        phone: '51999999999',
        role: 'admin',
        storeId,
      },
    })

    // 3. Upsert Categories
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

    // 4. Upsert Products
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

    // 5. Upsert Testimonials
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
