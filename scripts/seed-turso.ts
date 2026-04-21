// Usage: TURSO_URL=... DATABASE_AUTH_TOKEN=... npx tsx scripts/seed-turso.ts
import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_URL || ''
const TURSO_TOKEN = process.env.DATABASE_AUTH_TOKEN || ''

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
})

// Generate a simple unique ID (cuid-like)
function uid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

async function seed() {
  console.log("🌱 Seeding Turso database with demo data...")

  const storeId = uid()
  const now = new Date().toISOString()

  // 1. Create Store
  await client.execute({
    sql: `INSERT INTO "Store" (id, name, slug, logo, whatsappNumber, address, description, isActive, plan, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      storeId,
      "Urban Store",
      "urban-store",
      "",
      "51999999999",
      "Av. Arequipa 1234, Lima, Perú",
      "Tu tienda de moda urbana favorita. Ropa, accesorios y más para un estilo único.",
      1,
      "pro",
      now,
      now,
    ],
  })
  console.log("✅ Store created")

  // 2. Create Admin User (password: admin123 - bcrypt hash)
  const adminId = uid()
  await client.execute({
    sql: `INSERT INTO "StoreUser" (id, email, password, name, phone, address, role, storeId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      adminId,
      "admin@urbanstore.pe",
      "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK", // admin123
      "Admin Urban",
      "51999999999",
      "Lima, Perú",
      "admin",
      storeId,
      now,
      now,
    ],
  })
  console.log("✅ Admin user created")

  // 3. Create Customer User
  const customerId = uid()
  await client.execute({
    sql: `INSERT INTO "StoreUser" (id, email, password, name, phone, address, role, storeId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      customerId,
      "cliente@ejemplo.com",
      "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK", // admin123
      "María García",
      "51988888888",
      "Calle Los Olivos 456, Lima",
      "customer",
      storeId,
      now,
      now,
    ],
  })
  console.log("✅ Customer user created")

  // 4. Create Categories
  const categories = [
    { name: "Camisetas", slug: "camisetas", sortOrder: 1 },
    { name: "Pantalones", slug: "pantalones", sortOrder: 2 },
    { name: "Zapatillas", slug: "zapatillas", sortOrder: 3 },
    { name: "Accesorios", slug: "accesorios", sortOrder: 4 },
    { name: "Chaquetas", slug: "chaquetas", sortOrder: 5 },
    { name: "Hoodies", slug: "hoodies", sortOrder: 6 },
  ]

  const categoryIds: Record<string, string> = {}
  for (const cat of categories) {
    const id = uid()
    categoryIds[cat.slug] = id
    await client.execute({
      sql: `INSERT INTO "Category" (id, name, slug, image, sortOrder, storeId, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, cat.name, cat.slug, "", cat.sortOrder, storeId, now],
    })
  }
  console.log(`✅ ${categories.length} categories created`)

  // 5. Create Products
  const products = [
    // Camisetas
    { name: "Camiseta Urban Classic", slug: "camiseta-urban-classic", cat: "camisetas", price: 79.90, compare: 99.90, featured: true, isNew: false, discount: 20 },
    { name: "Camiseta Oversize Street", slug: "camiseta-oversize-street", cat: "camisetas", price: 89.90, compare: null, featured: true, isNew: true, discount: null },
    { name: "Camiseta Logo Premium", slug: "camiseta-logo-premium", cat: "camisetas", price: 69.90, compare: 89.90, featured: false, isNew: false, discount: 22 },
    { name: "Camiseta Minimal Black", slug: "camiseta-minimal-black", cat: "camisetas", price: 59.90, compare: null, featured: false, isNew: true, discount: null },

    // Pantalones
    { name: "Jogger Cargo Negro", slug: "jogger-cargo-negro", cat: "pantalones", price: 129.90, compare: 159.90, featured: true, isNew: false, discount: 19 },
    { name: "Jeans Slim Fit", slug: "jeans-slim-fit", cat: "pantalones", price: 149.90, compare: null, featured: false, isNew: false, discount: null },
    { name: "Jogger Gris Urbano", slug: "jogger-gris-urbano", cat: "pantalones", price: 109.90, compare: null, featured: false, isNew: true, discount: null },

    // Zapatillas
    { name: "Air Runner Pro", slug: "air-runner-pro", cat: "zapatillas", price: 249.90, compare: 299.90, featured: true, isNew: true, discount: 17 },
    { name: "Street Style High", slug: "street-style-high", cat: "zapatillas", price: 199.90, compare: null, featured: true, isNew: false, discount: null },
    { name: "Classic White Low", slug: "classic-white-low", cat: "zapatillas", price: 179.90, compare: 219.90, featured: false, isNew: false, discount: 18 },

    // Accesorios
    { name: "Gorra Snapback Urban", slug: "gorra-snapback-urban", cat: "accesorios", price: 49.90, compare: null, featured: false, isNew: true, discount: null },
    { name: "Mochila Laptop Pro", slug: "mochila-laptop-pro", cat: "accesorios", price: 139.90, compare: 169.90, featured: true, isNew: false, discount: 18 },
    { name: "Cadena Urban Gold", slug: "cadena-urban-gold", cat: "accesorios", price: 39.90, compare: null, featured: false, isNew: false, discount: null },

    // Chaquetas
    { name: "Bomber Jacket Negro", slug: "bomber-jacket-negro", cat: "chaquetas", price: 199.90, compare: 249.90, featured: true, isNew: false, discount: 20 },
    { name: "Windbreaker deportivo", slug: "windbreaker-deportivo", cat: "chaquetas", price: 159.90, compare: null, featured: false, isNew: true, discount: null },

    // Hoodies
    { name: "Hoodie Oversize Grey", slug: "hoodie-oversize-grey", cat: "hoodies", price: 119.90, compare: 149.90, featured: true, isNew: false, discount: 20 },
    { name: "Hoodie Zip Street", slug: "hoodie-zip-street", cat: "hoodies", price: 139.90, compare: null, featured: false, isNew: true, discount: null },
  ]

  for (const p of products) {
    const id = uid()
    await client.execute({
      sql: `INSERT INTO "Product" (id, name, slug, description, price, comparePrice, image, categoryId, storeId, isFeatured, isNew, discount, sizes, colors, rating, reviewCount, inStock, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        p.name,
        p.slug,
        `${p.name} - Calidad premium para tu estilo urbano. Diseño moderno y cómodo para el día a día.`,
        p.price,
        p.compare,
        "",
        categoryIds[p.cat],
        storeId,
        p.featured ? 1 : 0,
        p.isNew ? 1 : 0,
        p.discount,
        JSON.stringify(["S", "M", "L", "XL"]),
        JSON.stringify(["Negro", "Blanco", "Gris"]),
        4.5 + Math.random() * 0.5,
        Math.floor(10 + Math.random() * 90),
        1,
        now,
        now,
      ],
    })
  }
  console.log(`✅ ${products.length} products created`)

  // 6. Create Demo Orders
  const orders = [
    { name: "María García", phone: "51988888888", status: "completed", total: 329.80, items: [{ name: "Camiseta Urban Classic", price: 79.90, qty: 2 }, { name: "Gorra Snapback Urban", price: 49.90, qty: 1 }, { name: "Cadena Urban Gold", price: 39.90, qty: 3 }] },
    { name: "Carlos López", phone: "51977777777", status: "pending", total: 249.90, items: [{ name: "Air Runner Pro", price: 249.90, qty: 1 }] },
    { name: "Ana Torres", phone: "51966666666", status: "processing", total: 449.70, items: [{ name: "Bomber Jacket Negro", price: 199.90, qty: 1 }, { name: "Jogger Cargo Negro", price: 129.90, qty: 1 }, { name: "Hoodie Oversize Grey", price: 119.90, qty: 1 }] },
    { name: "Luis Ramírez", phone: "51955555555", status: "completed", total: 189.80, items: [{ name: "Jeans Slim Fit", price: 149.90, qty: 1 }, { name: "Camiseta Minimal Black", price: 59.90, qty: 1 }] },
    { name: "Sofía Martínez", phone: "51944444444", status: "shipped", total: 379.80, items: [{ name: "Street Style High", price: 199.90, qty: 1 }, { name: "Mochila Laptop Pro", price: 139.90, qty: 1 }, { name: "Camiseta Logo Premium", price: 69.90, qty: 1 }] },
  ]

  for (const o of orders) {
    const orderId = uid()
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    await client.execute({
      sql: `INSERT INTO "Order" (id, orderNumber, customerName, customerPhone, customerAddress, status, total, notes, storeId, userId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [orderId, orderNumber, o.name, o.phone, "Lima, Perú", o.status, o.total, "", storeId, customerId, now, now],
    })

    for (const item of o.items) {
      await client.execute({
        sql: `INSERT INTO "OrderItem" (id, productId, productName, productImage, price, quantity, size, color, orderId, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [uid(), uid(), item.name, "", item.price, item.qty, "M", "Negro", orderId, now],
      })
    }
  }
  console.log(`✅ ${orders.length} orders created`)

  // 7. Create Testimonials
  const testimonials = [
    { name: "María García", role: "Cliente frecuente", content: "¡Me encanta Urban Store! La calidad de la ropa es increíble y el envío es súper rápido. Recomiendo 100%.", rating: 5 },
    { name: "Carlos López", role: "Comprador verificado", content: "Las zapatillas Air Runner Pro son espectaculares. Muy cómodas y el diseño es genial. Volveré a comprar.", rating: 5 },
    { name: "Ana Torres", role: "Cliente VIP", content: "Excelente atención al cliente y productos de primera calidad. La chaqueta bomber es mi favorita.", rating: 4 },
    { name: "Luis Ramírez", role: "Influencer urbano", content: "El estilo urbano que ofrecen es único. Los hoodies son de los mejores que he probado.", rating: 5 },
    { name: "Sofía Martínez", role: "Diseñadora de moda", content: "Como profesional de la moda, puedo decir que la calidad de Urban Store está a la altura de marcas premium.", rating: 5 },
    { name: "Diego Flores", role: "Estudiante universitario", content: "Buen precio y excelente calidad. Perfecto para el día a día. Los jogger cargo son lo máximo.", rating: 4 },
  ]

  for (const t of testimonials) {
    await client.execute({
      sql: `INSERT INTO "Testimonial" (id, name, role, content, rating, storeId, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [uid(), t.name, t.role, t.content, t.rating, storeId, now],
    })
  }
  console.log(`✅ ${testimonials.length} testimonials created`)

  console.log("\n🎉 Database seeded successfully!")
  console.log("\n📋 Summary:")
  console.log("  - Store: Urban Store (urban-store)")
  console.log("  - Admin: admin@urbanstore.pe / admin123")
  console.log("  - Customer: cliente@ejemplo.com / admin123")
  console.log(`  - Categories: ${categories.length}`)
  console.log(`  - Products: ${products.length}`)
  console.log(`  - Orders: ${orders.length}`)
  console.log(`  - Testimonials: ${testimonials.length}`)

  await client.close()
}

seed().catch(err => {
  console.error("Seed failed:", err)
  process.exit(1)
})
