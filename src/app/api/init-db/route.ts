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

// New demo stores seed config
const demoStores = [
  {
    store: {
      id: 'seed-store-basico',
      name: 'Mi Tienda Básica',
      slug: 'mi-tienda-basica',
      logo: '',
      whatsappNumber: '51999999991',
      address: 'Av. Javier Prado 456, Lima, Perú',
      description: 'Tu tienda básica con todo lo que necesitas para empezar a vender online.',
      isActive: true,
      plan: 'basico',
    },
    admin: {
      id: 'seed-admin-basico',
      email: 'basico@demo.pe',
      password: '$2b$10$Os0Gf3rq3gWmtX4by93Xt.8OdNP8MhStHW41jWTTkbWvIItXXCnf2',
      name: 'Carlos Básico',
      phone: '51999999991',
      role: 'admin',
    },
    customer: {
      id: 'seed-cliente-basico',
      email: 'basico@cliente.com',
      password: '$2b$10$Xa/6CkIZADH0l5Kr296XNOoAm6nqYbnPPWETD4Dsmk0dYFjSwZImS',
      name: 'Cliente Básico',
      phone: '',
      role: 'customer',
    },
    categories: [
      { id: 'seed-cat-basico-1', name: 'Ropa Casual', slug: 'ropa-casual', image: '', sortOrder: 1 },
      { id: 'seed-cat-basico-2', name: 'Accesorios', slug: 'accesorios-basico', image: '', sortOrder: 2 },
    ],
    products: [
      { id: 'seed-prod-basico-1', name: 'Polo Básico Blanco', slug: 'polo-basico-blanco', description: 'Polo clásico de algodón blanco.', price: 39.9, comparePrice: null, categoryId: 'seed-cat-basico-1', isFeatured: true, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-basico-2', name: 'Pantalón Jeans', slug: 'pantalon-jeans-basico', description: 'Jeans clásico azul oscuro.', price: 89.9, comparePrice: null, categoryId: 'seed-cat-basico-1', isFeatured: false, isNew: true, discount: null, inStock: true },
      { id: 'seed-prod-basico-3', name: 'Cinturón Negro', slug: 'cinturon-negro', description: 'Cinturón de cuero sintético.', price: 29.9, comparePrice: 39.9, categoryId: 'seed-cat-basico-2', isFeatured: false, isNew: false, discount: 25, inStock: true },
    ],
  },
  {
    store: {
      id: 'seed-store-pro',
      name: 'TechStore Pro',
      slug: 'techstore-pro',
      logo: '',
      whatsappNumber: '51999999992',
      address: 'Av. Brasil 789, Lima, Perú',
      description: 'Tu tienda de tecnología con los mejores productos del mercado.',
      isActive: true,
      plan: 'pro',
    },
    admin: {
      id: 'seed-admin-pro',
      email: 'pro@demo.pe',
      password: '$2b$10$Os0Gf3rq3gWmtX4by93Xt.8OdNP8MhStHW41jWTTkbWvIItXXCnf2',
      name: 'María Pro',
      phone: '51999999992',
      role: 'admin',
    },
    customer: {
      id: 'seed-cliente-pro',
      email: 'pro@cliente.com',
      password: '$2b$10$Xa/6CkIZADH0l5Kr296XNOoAm6nqYbnPPWETD4Dsmk0dYFjSwZImS',
      name: 'Cliente Pro',
      phone: '',
      role: 'customer',
    },
    categories: [
      { id: 'seed-cat-pro-1', name: 'Smartphones', slug: 'smartphones', image: '', sortOrder: 1 },
      { id: 'seed-cat-pro-2', name: 'Laptops', slug: 'laptops', image: '', sortOrder: 2 },
      { id: 'seed-cat-pro-3', name: 'Audio', slug: 'audio', image: '', sortOrder: 3 },
    ],
    products: [
      { id: 'seed-prod-pro-1', name: 'Smartphone Galaxy X', slug: 'smartphone-galaxy-x', description: 'Smartphone de última generación con 128GB.', price: 1299.9, comparePrice: 1499.9, categoryId: 'seed-cat-pro-1', isFeatured: true, isNew: true, discount: 13, inStock: true },
      { id: 'seed-prod-pro-2', name: 'Laptop ProBook 15', slug: 'laptop-probook-15', description: 'Laptop profesional con 16GB RAM y SSD 512GB.', price: 2499.9, comparePrice: null, categoryId: 'seed-cat-pro-2', isFeatured: true, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-pro-3', name: 'Audífonos Wireless', slug: 'audifonos-wireless', description: 'Audífonos Bluetooth con cancelación de ruido.', price: 349.9, comparePrice: 449.9, categoryId: 'seed-cat-pro-3', isFeatured: false, isNew: true, discount: 22, inStock: true },
      { id: 'seed-prod-pro-4', name: 'Cargador Rápido 65W', slug: 'cargador-rapido-65w', description: 'Cargador USB-C de 65W para laptops y smartphones.', price: 129.9, comparePrice: null, categoryId: 'seed-cat-pro-3', isFeatured: false, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-pro-5', name: 'iPhone 16 Pro', slug: 'iphone-16-pro', description: 'El iPhone más avanzado con cámara de 48MP.', price: 4299.9, comparePrice: 4599.9, categoryId: 'seed-cat-pro-1', isFeatured: true, isNew: true, discount: 7, inStock: true },
    ],
  },
  {
    store: {
      id: 'seed-store-premium',
      name: 'Fashion Premium',
      slug: 'fashion-premium',
      logo: '',
      whatsappNumber: '51999999993',
      address: 'Av. Larco 1230, Lima, Perú',
      description: 'Moda premium para quienes buscan estilo y exclusividad.',
      isActive: true,
      plan: 'premium',
    },
    admin: {
      id: 'seed-admin-premium',
      email: 'premium@demo.pe',
      password: '$2b$10$Os0Gf3rq3gWmtX4by93Xt.8OdNP8MhStHW41jWTTkbWvIItXXCnf2',
      name: 'Ana Premium',
      phone: '51999999993',
      role: 'admin',
    },
    customer: {
      id: 'seed-cliente-premium',
      email: 'premium@cliente.com',
      password: '$2b$10$Xa/6CkIZADH0l5Kr296XNOoAm6nqYbnPPWETD4Dsmk0dYFjSwZImS',
      name: 'Cliente Premium',
      phone: '',
      role: 'customer',
    },
    categories: [
      { id: 'seed-cat-prem-1', name: 'Vestidos', slug: 'vestidos', image: '', sortOrder: 1 },
      { id: 'seed-cat-prem-2', name: 'Bolsos', slug: 'bolsos', image: '', sortOrder: 2 },
      { id: 'seed-cat-prem-3', name: 'Calzado Premium', slug: 'calzado-premium', image: '', sortOrder: 3 },
    ],
    products: [
      { id: 'seed-prod-prem-1', name: 'Vestido Elegante Negro', slug: 'vestido-elegante-negro', description: 'Vestido de noche con tela de satén premium.', price: 399.9, comparePrice: 499.9, categoryId: 'seed-cat-prem-1', isFeatured: true, isNew: true, discount: 20, inStock: true },
      { id: 'seed-prod-prem-2', name: 'Bolso de Cuero Italiano', slug: 'bolso-cuero-italiano', description: 'Bolso artesanal de cuero genuino importado.', price: 899.9, comparePrice: null, categoryId: 'seed-cat-prem-2', isFeatured: true, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-prem-3', name: 'Tacones Stiletto Rojo', slug: 'tacones-stiletto-rojo', description: 'Tacones de 10cm con suela de goma antideslizante.', price: 459.9, comparePrice: 559.9, categoryId: 'seed-cat-prem-3', isFeatured: false, isNew: true, discount: 18, inStock: true },
      { id: 'seed-prod-prem-4', name: 'Vestido Floral Primavera', slug: 'vestido-floral-primavera', description: 'Vestido de verano con estampado floral exclusivo.', price: 299.9, comparePrice: null, categoryId: 'seed-cat-prem-1', isFeatured: false, isNew: true, discount: null, inStock: true },
    ],
  },
]

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

    // 1. Upsert original Store (Urban Store)
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

    // 2. Upsert Admin User (admin@urbanstyle.pe)
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

    // 3. Upsert Customer Test User (cliente@email.com)
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

    // 4. Upsert Categories (original store)
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

    // 5. Upsert Products (original store)
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

    // 6. Upsert Testimonials (original store)
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

    // ═══ Seed 3 Demo Stores ═══
    const seededStores: Array<{ storeName: string; adminEmail: string; customerEmail: string; categories: number; products: number }> = []

    for (const demo of demoStores) {
      // Upsert store
      const demoStore = await db.store.upsert({
        where: { slug: demo.store.slug },
        update: {
          name: demo.store.name,
          whatsappNumber: demo.store.whatsappNumber,
          address: demo.store.address,
          description: demo.store.description,
          isActive: demo.store.isActive,
          plan: demo.store.plan,
        },
        create: {
          id: demo.store.id,
          name: demo.store.name,
          slug: demo.store.slug,
          whatsappNumber: demo.store.whatsappNumber,
          address: demo.store.address,
          description: demo.store.description,
          isActive: demo.store.isActive,
          plan: demo.store.plan,
        },
      })

      const demoStoreId = demoStore.id

      // Upsert admin user
      await db.storeUser.upsert({
        where: { email_storeId: { email: demo.admin.email, storeId: demoStoreId } },
        update: {},
        create: {
          id: demo.admin.id,
          email: demo.admin.email,
          password: demo.admin.password,
          name: demo.admin.name,
          phone: demo.admin.phone,
          role: demo.admin.role,
          storeId: demoStoreId,
        },
      })

      // Upsert customer user
      await db.storeUser.upsert({
        where: { email_storeId: { email: demo.customer.email, storeId: demoStoreId } },
        update: {},
        create: {
          id: demo.customer.id,
          email: demo.customer.email,
          password: demo.customer.password,
          name: demo.customer.name,
          phone: demo.customer.phone,
          role: demo.customer.role,
          storeId: demoStoreId,
        },
      })

      // Upsert categories
      for (const cat of demo.categories) {
        await db.category.upsert({
          where: { id: cat.id },
          update: {
            name: cat.name,
            slug: cat.slug,
            sortOrder: cat.sortOrder,
            storeId: demoStoreId,
          },
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image: cat.image,
            sortOrder: cat.sortOrder,
            storeId: demoStoreId,
          },
        })
      }

      // Upsert products
      for (const p of demo.products) {
        await db.product.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice,
            categoryId: p.categoryId,
            storeId: demoStoreId,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
            discount: p.discount,
            inStock: p.inStock,
          },
          create: {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice,
            categoryId: p.categoryId,
            storeId: demoStoreId,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
            discount: p.discount,
            inStock: p.inStock,
          },
        })
      }

      seededStores.push({
        storeName: demo.store.name,
        adminEmail: demo.admin.email,
        customerEmail: demo.customer.email,
        categories: demo.categories.length,
        products: demo.products.length,
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
        demoStores: seededStores,
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
