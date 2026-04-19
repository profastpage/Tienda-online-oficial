import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api-auth'
import { verifyToken } from '@/lib/auth'
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
      { id: 'seed-cat-basico-1', name: 'Polos', slug: 'polos', image: '', sortOrder: 1 },
      { id: 'seed-cat-basico-2', name: 'Pantalones', slug: 'pantalones-basico', image: '', sortOrder: 2 },
      { id: 'seed-cat-basico-3', name: 'Accesorios', slug: 'accesorios-basico', image: '', sortOrder: 3 },
    ],
    products: [
      { id: 'seed-prod-basico-1', name: 'Polo Oversize Negro', slug: 'polo-oversize-negro', description: 'Polo oversize de algodón con estampado minimalista. Cómodo y versátil.', price: 59.9, comparePrice: null, categoryId: 'seed-cat-basico-1', isFeatured: true, isNew: true, discount: null, inStock: true },
      { id: 'seed-prod-basico-2', name: 'Jogger Cargo Gris', slug: 'jogger-cargo-gris', description: 'Jogger cargo con bolsillos laterales. Tela suave y resistente.', price: 89.9, comparePrice: null, categoryId: 'seed-cat-basico-2', isFeatured: true, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-basico-3', name: 'Polo Básico Blanco', slug: 'polo-basico-blanco', description: 'Polo clásico de algodón blanco. Cortes rectos, perfecto para cualquier ocasión.', price: 39.9, comparePrice: null, categoryId: 'seed-cat-basico-1', isFeatured: false, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-basico-4', name: 'Jeans Slim Dark', slug: 'jeans-slim-dark', description: 'Jeans slim fit de mezclilla oscura. Comodidad y estilo en uno.', price: 99.9, comparePrice: null, categoryId: 'seed-cat-basico-2', isFeatured: false, isNew: true, discount: null, inStock: true },
      { id: 'seed-prod-basico-5', name: 'Gorra Urban Black', slug: 'gorra-urban-black', description: 'Gorra negra con cierre ajustable. Diseño minimalista y moderno.', price: 35.9, comparePrice: null, categoryId: 'seed-cat-basico-3', isFeatured: false, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-basico-6', name: 'Cinturón Negro', slug: 'cinturon-negro', description: 'Cinturón de cuero sintético con hebilla metálica. Resistente y elegante.', price: 29.9, comparePrice: 39.9, categoryId: 'seed-cat-basico-3', isFeatured: false, isNew: false, discount: 25, inStock: true },
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
      { id: 'seed-prod-pro-1', name: 'Smartphone Galaxy X', slug: 'smartphone-galaxy-x', description: 'Smartphone de última generación con pantalla AMOLED 6.7", 128GB, cámara de 108MP y carga rápida 65W.', price: 1299.9, comparePrice: 1499.9, categoryId: 'seed-cat-pro-1', isFeatured: true, isNew: true, discount: 13, inStock: true },
      { id: 'seed-prod-pro-2', name: 'Laptop ProBook 15', slug: 'laptop-probook-15', description: 'Laptop profesional con procesador Intel i7, 16GB RAM, SSD 512GB y pantalla Full HD 15.6".', price: 2499.9, comparePrice: null, categoryId: 'seed-cat-pro-2', isFeatured: true, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-pro-3', name: 'Audífonos Wireless', slug: 'audifonos-wireless', description: 'Audífonos over-ear Bluetooth 5.3 con cancelación activa de ruido y 40 horas de batería.', price: 349.9, comparePrice: 449.9, categoryId: 'seed-cat-pro-3', isFeatured: false, isNew: true, discount: 22, inStock: true },
      { id: 'seed-prod-pro-4', name: 'Cargador Rápido 65W', slug: 'cargador-rapido-65w', description: 'Cargador GaN USB-C de 65W con 2 puertos. Compatible con laptops, tablets y smartphones.', price: 129.9, comparePrice: null, categoryId: 'seed-cat-pro-3', isFeatured: false, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-pro-5', name: 'iPhone 16 Pro', slug: 'iphone-16-pro', description: 'iPhone 16 Pro con chip A18 Pro, cámara triple de 48MP, pantalla Super Retina XDR y titanio.', price: 4299.9, comparePrice: 4599.9, categoryId: 'seed-cat-pro-1', isFeatured: true, isNew: true, discount: 7, inStock: true },
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
      { id: 'seed-prod-prem-1', name: 'Vestido Elegante Negro', slug: 'vestido-elegante-negro', description: 'Vestido de noche largo con tela de satén premium. Corte sirena, escote V y espalda descubierta.', price: 399.9, comparePrice: 499.9, categoryId: 'seed-cat-prem-1', isFeatured: true, isNew: true, discount: 20, inStock: true },
      { id: 'seed-prod-prem-2', name: 'Bolso de Cuero Italiano', slug: 'bolso-cuero-italiano', description: 'Bolso tote artesanal de cuero genuino importado de Italia. Forro de suede, doble asa.', price: 899.9, comparePrice: null, categoryId: 'seed-cat-prem-2', isFeatured: true, isNew: false, discount: null, inStock: true },
      { id: 'seed-prod-prem-3', name: 'Tacones Stiletto Rojo', slug: 'tacones-stiletto-rojo', description: 'Tacones stiletto de 10cm en charol rojo. Suela de goma antideslizante, punta fina.', price: 459.9, comparePrice: 559.9, categoryId: 'seed-cat-prem-3', isFeatured: false, isNew: true, discount: 18, inStock: true },
      { id: 'seed-prod-prem-4', name: 'Vestido Floral Primavera', slug: 'vestido-floral-primavera', description: 'Vestido midi con estampado floral exclusivo. Tela de viscosa, mangas abullonadas.', price: 299.9, comparePrice: null, categoryId: 'seed-cat-prem-1', isFeatured: false, isNew: true, discount: null, inStock: true },
      { id: 'seed-prod-prem-5', name: 'Blazer Oversize Camel', slug: 'blazer-oversize-camel', description: 'Blazer oversize en lana premium color camel. Sastre desestructurado, largo a la cadera.', price: 549.9, comparePrice: null, categoryId: 'seed-cat-prem-1', isFeatured: true, isNew: true, discount: null, inStock: true },
      { id: 'seed-prod-prem-6', name: 'Zapatillas Loafers Marrón', slug: 'zapatillas-loafers-marron', description: 'Loafers de cuero genuino marrón. Suela de cuero, diseño clásico italiano.', price: 379.9, comparePrice: null, categoryId: 'seed-cat-prem-3', isFeatured: false, isNew: true, discount: null, inStock: true },
    ],
  },
]

// Run database migrations (add missing columns)
async function runMigrations(db: Awaited<ReturnType<typeof getDb>>) {
  const migrationResults: { table: string; added: string[]; errors: string[] }[] = []

  // Migrate Product table
  const productColumns = await db.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info("Product")`
  )
  const productColNames = productColumns.map(c => c.name)

  const productRequired: { name: string; sql: string }[] = [
    { name: 'images', sql: `ALTER TABLE "Product" ADD COLUMN "images" TEXT DEFAULT '[]'` },
    { name: 'sizes', sql: `ALTER TABLE "Product" ADD COLUMN "sizes" TEXT DEFAULT '[]'` },
    { name: 'colors', sql: `ALTER TABLE "Product" ADD COLUMN "colors" TEXT DEFAULT '[]'` },
    { name: 'comparePrice', sql: `ALTER TABLE "Product" ADD COLUMN "comparePrice" REAL` },
  ]

  const productAdded: string[] = []
  const productErrors: string[] = []

  for (const col of productRequired) {
    if (productColNames.includes(col.name)) continue
    try {
      await db.$executeRawUnsafe(col.sql)
      productAdded.push(col.name)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      productErrors.push(`${col.name}: ${msg}`)
    }
  }

  migrationResults.push({ table: 'Product', added: productAdded, errors: productErrors })

  // Migrate StoreUser table
  const storeUserColumns = await db.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info("StoreUser")`
  )
  const storeUserColNames = storeUserColumns.map(c => c.name)

  const storeUserRequired: { name: string; sql: string }[] = [
    { name: 'googleId', sql: `ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT` },
    { name: 'avatar', sql: `ALTER TABLE "StoreUser" ADD COLUMN "avatar" TEXT DEFAULT ''` },
  ]

  const storeUserAdded: string[] = []
  const storeUserErrors: string[] = []

  for (const col of storeUserRequired) {
    if (storeUserColNames.includes(col.name)) continue
    try {
      await db.$executeRawUnsafe(col.sql)
      storeUserAdded.push(col.name)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      storeUserErrors.push(`${col.name}: ${msg}`)
    }
  }

  // Create unique index for googleId
  if (storeUserAdded.includes('googleId')) {
    try {
      await db.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "StoreUser_googleId_key" ON "StoreUser"("googleId") WHERE "googleId" IS NOT NULL`
      )
    } catch { /* ignore */ }
  }

  migrationResults.push({ table: 'StoreUser', added: storeUserAdded, errors: storeUserErrors })

  // Migrate Store table
  const storeColumns = await db.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info("Store")`
  )
  const storeColNames = storeColumns.map(c => c.name)

  const storeRequired: { name: string; sql: string }[] = [
    { name: 'subscriptionExpiresAt', sql: `ALTER TABLE "Store" ADD COLUMN "subscriptionExpiresAt" DATETIME` },
    { name: 'trialDays', sql: `ALTER TABLE "Store" ADD COLUMN "trialDays" INTEGER DEFAULT 0` },
  ]

  const storeAdded: string[] = []
  const storeErrors: string[] = []

  for (const col of storeRequired) {
    if (storeColNames.includes(col.name)) continue
    try {
      await db.$executeRawUnsafe(col.sql)
      storeAdded.push(col.name)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      storeErrors.push(`${col.name}: ${msg}`)
    }
  }

  migrationResults.push({ table: 'Store', added: storeAdded, errors: storeErrors })

  return migrationResults
}

export async function POST(request: Request) {
  try {
    // Rate limit protection
    if (!checkRateLimit(request, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Require INIT_DB_SECRET from authorization header OR super-admin JWT
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    // Method 1: Super Admin JWT token (auto-seed from dashboard)
    let isSuperAdmin = false
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload && payload.role === 'super-admin') {
          isSuperAdmin = true
        }
      } catch {
        // Not a valid JWT, check secret below
      }
    }

    // Method 2: INIT_DB_SECRET (manual seed)
    const initSecret = process.env.INIT_DB_SECRET
    if (!isSuperAdmin && (!initSecret || !token || token !== initSecret)) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('[api/init-db] Database seeding initiated', body?.DATABASE_URL ? '(remote URL provided)' : '(using default connection)')

    const db = await getDb()

    // ═══ Run migrations FIRST to ensure all columns exist ═══
    console.log('[api/init-db] Running database migrations...')
    const migrationResults = await runMigrations(db)
    const totalMigrated = migrationResults.reduce((sum, r) => sum + r.added.length, 0)
    if (totalMigrated > 0) {
      console.log('[api/init-db] Migrations completed:', migrationResults)
    } else {
      console.log('[api/init-db] No migrations needed - all columns present')
    }

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

      // Seed sample orders for realism
      const sampleStatuses = ['pending', 'confirmed', 'shipped', 'delivered']
      const sampleOrderCount = demo.store.plan === 'premium' ? 8 : demo.store.plan === 'pro' ? 5 : 3
      for (let i = 0; i < sampleOrderCount; i++) {
        const prod = demo.products[i % demo.products.length]
        const orderNum = `ORD-${demo.store.slug.substring(0, 4).toUpperCase()}-${String(1000 + i).padStart(4, '0')}`
        try {
          const order = await db.order.upsert({
            where: { orderNumber: orderNum },
            update: {},
            create: {
              id: `${demo.store.id}-order-${i}`,
              orderNumber: orderNum,
              customerName: i % 2 === 0 ? demo.customer.name : `Cliente Demo ${i + 1}`,
              customerPhone: i % 2 === 0 ? (demo.customer.phone || '51988888888') : `5199999900${i}`,
              customerAddress: `Calle ${i + 1}0${i}, Lima`,
              status: sampleStatuses[i % sampleStatuses.length],
              total: prod.price * (1 + Math.floor(Math.random() * 2)),
              notes: '',
              storeId: demoStoreId,
              userId: demo.customer.id,
              items: {
                create: {
                  id: `${demo.store.id}-item-${i}`,
                  productId: prod.id,
                  productName: prod.name,
                  productImage: '',
                  price: prod.price,
                  quantity: 1 + Math.floor(Math.random() * 2),
                  size: 'M',
                  color: '',
                },
              },
            },
          })
        } catch { /* order may already exist */ }
      }

      // Seed a coupon for each store
      try {
        await db.coupon.upsert({
          where: { code: `BIENVENIDO${demo.store.plan.substring(0, 3).toUpperCase()}` },
          update: {},
          create: {
            id: `${demo.store.id}-coupon-welcome`,
            code: `BIENVENIDO${demo.store.plan.substring(0, 3).toUpperCase()}`,
            storeId: demoStoreId,
            type: 'percentage',
            value: demo.store.plan === 'premium' ? 15 : demo.store.plan === 'pro' ? 10 : 5,
            maxUses: 100,
            isActive: true,
          },
        })
      } catch { /* coupon may exist */ }

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
        migrations: migrationResults,
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
