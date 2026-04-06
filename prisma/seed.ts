import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function uid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

async function seed() {
  console.log("🌱 Seeding local SQLite database...")

  const storeId = uid()

  // 1. Create Store
  await db.store.upsert({
    where: { slug: 'urban-store' },
    update: {},
    create: {
      id: storeId,
      name: "Urban Store",
      slug: "urban-store",
      whatsappNumber: "51999999999",
      address: "Av. Arequipa 1234, Lima, Perú",
      description: "Tu tienda de moda urbana favorita. Ropa, accesorios y más para un estilo único.",
      isActive: true,
      plan: "pro",
    },
  })
  console.log("✅ Store created")

  const store = await db.store.findUnique({ where: { slug: 'urban-store' } })!
  const sid = store!.id

  // 2. Admin User
  await db.storeUser.upsert({
    where: { email_storeId: { email: 'admin@urbanstore.pe', storeId: sid } },
    update: {},
    create: {
      id: uid(),
      email: "admin@urbanstore.pe",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK",
      name: "Admin Urban",
      phone: "51999999999",
      role: "admin",
      storeId: sid,
    },
  })
  console.log("✅ Admin user created")

  // 3. Categories
  const categories = [
    { name: "Camisetas", slug: "camisetas", image: "/images/categories/polos.png", sortOrder: 1 },
    { name: "Pantalones", slug: "pantalones", image: "/images/categories/pantalones.png", sortOrder: 2 },
    { name: "Zapatillas", slug: "zapatillas", image: "/images/categories/zapatos.png", sortOrder: 3 },
    { name: "Accesorios", slug: "accesorios", image: "/images/categories/hoodies.png", sortOrder: 4 },
    { name: "Chaquetas", slug: "chaquetas", image: "/images/categories/hoodies.png", sortOrder: 5 },
    { name: "Hoodies", slug: "hoodies", image: "/images/categories/hoodies.png", sortOrder: 6 },
  ]

  const categoryIds: Record<string, string> = {}
  for (const cat of categories) {
    const existing = await db.category.findFirst({ where: { slug: cat.slug, storeId: sid } })
    if (existing) {
      categoryIds[cat.slug] = existing.id
    } else {
      const created = await db.category.create({ data: { ...cat, storeId: sid } })
      categoryIds[cat.slug] = created.id
    }
  }
  console.log(`✅ ${categories.length} categories created`)

  // 4. Products with images and proper color hex values
  const products = [
    { name: "Camiseta Urban Classic", slug: "camiseta-urban-classic", cat: "camisetas", price: 79.90, compare: 99.90, featured: true, isNew: false, discount: 20, image: "/images/products/polera-oversize.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"},{"name":"Gris","hex":"#6b7280"}]' },
    { name: "Camiseta Oversize Street", slug: "camiseta-oversize-street", cat: "camisetas", price: 89.90, compare: null, featured: true, isNew: true, discount: null, image: "/images/products/polera-black.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"}]' },
    { name: "Camiseta Logo Premium", slug: "camiseta-logo-premium", cat: "camisetas", price: 69.90, compare: 89.90, featured: false, isNew: false, discount: 22, image: "/images/products/polera-white.png", colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Rojo","hex":"#ef4444"}]' },
    { name: "Camiseta Minimal Black", slug: "camiseta-minimal-black", cat: "camisetas", price: 59.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/polera-black.png", colors: '[{"name":"Negro","hex":"#1a1a1a"}]' },
    { name: "Jogger Cargo Negro", slug: "jogger-cargo-negro", cat: "pantalones", price: 129.90, compare: 159.90, featured: true, isNew: false, discount: 19, image: "/images/products/cargo-black.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Oliva","hex":"#4b5320"}]' },
    { name: "Jeans Slim Fit", slug: "jeans-slim-fit", cat: "pantalones", price: 149.90, compare: null, featured: false, isNew: false, discount: null, image: "/images/products/jean-dark.png", colors: '[{"name":"Azul Oscuro","hex":"#1e3a5f"},{"name":"Negro","hex":"#1a1a1a"}]' },
    { name: "Jogger Gris Urbano", slug: "jogger-gris-urbano", cat: "pantalones", price: 109.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/jogger-black.png", colors: '[{"name":"Gris","hex":"#6b7280"},{"name":"Negro","hex":"#1a1a1a"}]' },
    { name: "Air Runner Pro", slug: "air-runner-pro", cat: "zapatillas", price: 249.90, compare: 299.90, featured: true, isNew: true, discount: 17, image: "/images/products/sneakers-white.png", colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"}]' },
    { name: "Street Style High", slug: "street-style-high", cat: "zapatillas", price: 199.90, compare: null, featured: true, isNew: false, discount: null, image: "/images/products/sneakers-white-v2.png", colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Rojo","hex":"#ef4444"}]' },
    { name: "Classic White Low", slug: "classic-white-low", cat: "zapatillas", price: 179.90, compare: 219.90, featured: false, isNew: false, discount: 18, image: "/images/products/sneakers-white.png", colors: '[{"name":"Blanco","hex":"#ffffff"}]' },
    { name: "Gorra Snapback Urban", slug: "gorra-snapback-urban", cat: "accesorios", price: 49.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/hoodie-gray.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"}]' },
    { name: "Mochila Laptop Pro", slug: "mochila-laptop-pro", cat: "accesorios", price: 139.90, compare: 169.90, featured: true, isNew: false, discount: 18, image: "/images/products/bomber-black.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Gris","hex":"#6b7280"}]' },
    { name: "Cadena Urban Gold", slug: "cadena-urban-gold", cat: "accesorios", price: 39.90, compare: null, featured: false, isNew: false, discount: null, image: "/images/products/hoodie-red.png", colors: '[{"name":"Dorado","hex":"#d4af37"},{"name":"Plateado","hex":"#c0c0c0"}]' },
    { name: "Bomber Jacket Negro", slug: "bomber-jacket-negro", cat: "chaquetas", price: 199.90, compare: 249.90, featured: true, isNew: false, discount: 20, image: "/images/products/bomber-black.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Verde Militar","hex":"#4b5320"}]' },
    { name: "Windbreaker Deportivo", slug: "windbreaker-deportivo", cat: "chaquetas", price: 159.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/denim-jacket.png", colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Azul","hex":"#3b82f6"}]' },
    { name: "Hoodie Oversize Grey", slug: "hoodie-oversize-grey", cat: "hoodies", price: 119.90, compare: 149.90, featured: true, isNew: false, discount: 20, image: "/images/products/hoodie-gray.png", colors: '[{"name":"Gris","hex":"#6b7280"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Beige","hex":"#d4b896"}]' },
    { name: "Hoodie Zip Street", slug: "hoodie-zip-street", cat: "hoodies", price: 139.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/hoodie-red.png", colors: '[{"name":"Rojo","hex":"#ef4444"},{"name":"Negro","hex":"#1a1a1a"}]' },
    { name: "Sweater Beige Premium", slug: "sweater-beige-premium", cat: "hoodies", price: 109.90, compare: 139.90, featured: false, isNew: false, discount: 21, image: "/images/products/sweater-beige.png", colors: '[{"name":"Beige","hex":"#d4b896"},{"name":"Crema","hex":"#f5f0e8"}]' },
    { name: "Sweater Cream Vintage", slug: "sweater-cream-vintage", cat: "hoodies", price: 99.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/sweater-cream.png", colors: '[{"name":"Crema","hex":"#f5f0e8"},{"name":"Gris","hex":"#6b7280"}]' },
    { name: "Denim Jacket Vintage", slug: "denim-jacket-vintage", cat: "chaquetas", price: 189.90, compare: 229.90, featured: true, isNew: false, discount: 17, image: "/images/products/denim-vintage.png", colors: '[{"name":"Azul Denim","hex":"#5b8db8"},{"name":"Negro","hex":"#1a1a1a"}]' },
    { name: "Cargo Oliva Street", slug: "cargo-oliva-street", cat: "pantalones", price: 134.90, compare: null, featured: false, isNew: true, discount: null, image: "/images/products/cargo-olive.png", colors: '[{"name":"Oliva","hex":"#4b5320"},{"name":"Negro","hex":"#1a1a1a"}]' },
  ]

  let productCount = 0
  for (const p of products) {
    const existing = await db.product.findFirst({ where: { slug: p.slug, storeId: sid } })
    if (!existing) {
      await db.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: `${p.name} - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.`,
          price: p.price,
          comparePrice: p.compare,
          image: p.image,
          categoryId: categoryIds[p.cat],
          storeId: sid,
          isFeatured: p.featured,
          isNew: p.isNew,
          discount: p.discount,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          colors: p.colors,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(10 + Math.random() * 90),
          inStock: true,
        },
      })
      productCount++
    }
  }
  console.log(`✅ ${productCount} products created`)

  // 5. Testimonials
  const testimonials = [
    { name: "María García", role: "Cliente frecuente", content: "¡Me encanta Urban Store! La calidad de la ropa es increíble y el envío es súper rápido.", rating: 5 },
    { name: "Carlos López", role: "Comprador verificado", content: "Las zapatillas Air Runner Pro son espectaculares. Muy cómodas y el diseño es genial.", rating: 5 },
    { name: "Ana Torres", role: "Cliente VIP", content: "Excelente atención al cliente y productos de primera calidad.", rating: 4 },
    { name: "Luis Ramírez", role: "Influencer urbano", content: "El estilo urbano que ofrecen es único. Los hoodies son de los mejores.", rating: 5 },
    { name: "Sofía Martínez", role: "Diseñadora de moda", content: "Como profesional de la moda, la calidad de Urban Store está a la altura de marcas premium.", rating: 5 },
    { name: "Diego Flores", role: "Estudiante universitario", content: "Buen precio y excelente calidad. Los jogger cargo son lo máximo.", rating: 4 },
  ]

  let testCount = 0
  for (const t of testimonials) {
    const existing = await db.testimonial.findFirst({ where: { storeId: sid, name: t.name } })
    if (!existing) {
      await db.testimonial.create({
        data: { ...t, storeId: sid },
      })
      testCount++
    }
  }
  console.log(`✅ ${testCount} testimonials created`)

  console.log("\n🎉 Local database seeded successfully!")
  await db.$disconnect()
}

seed().catch(err => {
  console.error("Seed failed:", err)
  process.exit(1)
})
