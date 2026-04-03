import { db } from './src/lib/db'

async function seed() {
  // Default Store
  const store = await db.store.create({
    data: {
      name: 'Urban Style',
      slug: 'urban-style',
      whatsappNumber: '+51999888777',
      address: 'Lima, Perú',
      description: 'Tu tienda de streetwear de confianza. Moda urbana premium con pedidos fáciles por WhatsApp.',
      plan: 'pro',
    },
  })

  // Admin User
  const admin = await db.storeUser.create({
    data: {
      email: 'admin@urbanstyle.pe',
      password: 'admin123',
      name: 'Carlos Admin',
      phone: '+51999888777',
      role: 'admin',
      storeId: store.id,
    },
  })

  // Customer User
  const customer = await db.storeUser.create({
    data: {
      email: 'cliente@email.com',
      password: 'cliente123',
      name: 'María López',
      phone: '+51988776655',
      address: 'Av. Arequipa 1200, Lima',
      role: 'customer',
      storeId: store.id,
    },
  })

  // Categories
  const cats = await Promise.all([
    db.category.create({ data: { name: 'Polos', slug: 'polos', image: '/images/categories/polos.png', sortOrder: 1, storeId: store.id } }),
    db.category.create({ data: { name: 'Hoodies', slug: 'hoodies', image: '/images/categories/hoodies.png', sortOrder: 2, storeId: store.id } }),
    db.category.create({ data: { name: 'Pantalones', slug: 'pantalones', image: '/images/categories/pantalones.png', sortOrder: 3, storeId: store.id } }),
    db.category.create({ data: { name: 'Zapatos', slug: 'zapatos', image: '/images/categories/zapatos.png', sortOrder: 4, storeId: store.id } }),
  ])

  // Products
  const products = [
    { name: 'Polera Oversize Black', slug: 'polera-oversize-black', description: 'Polera oversize 100% algodón, corte urbano.', price: 79.90, comparePrice: 89.90, image: '/images/products/polera-black.png', catIdx: 0, isFeatured: true, discount: 11, sizes: ['S','M','L','XL'], colors: [{name:'Negro',hex:'#000000'}], rating: 4.7, reviewCount: 23 },
    { name: 'Polera Graphic White', slug: 'polera-graphic-white', description: 'Polera con estampado gráfico frontal.', price: 79.90, image: '/images/products/polera-white.png', catIdx: 0, isFeatured: true, isNew: true, sizes: ['S','M','L'], colors: [{name:'Blanco',hex:'#FFFFFF'}], rating: 4.5, reviewCount: 18 },
    { name: 'Hoodie Premium Gray', slug: 'hoodie-premium-gray', description: 'Hoodie urbano con capucha de alta calidad.', price: 109.90, comparePrice: 129.90, image: '/images/products/hoodie-gray.png', catIdx: 1, isFeatured: true, discount: 15, sizes: ['M','L','XL'], colors: [{name:'Gris',hex:'#808080'}], rating: 4.8, reviewCount: 42 },
    { name: 'Jean Slim Fit Dark', slug: 'jean-slim-fit-dark', description: 'Jean slim fit con lavado oscuro.', price: 149.90, image: '/images/products/jean-dark.png', catIdx: 2, isFeatured: true, isNew: true, sizes: ['28','30','32','34'], colors: [{name:'Azul Oscuro',hex:'#1a237e'}], rating: 4.6, reviewCount: 31 },
    { name: 'Sweater Beige Knit', slug: 'sweater-beige-knit', description: 'Suéter de punto en tono beige.', price: 119.90, image: '/images/products/sweater-beige.png', catIdx: 1, isNew: true, sizes: ['S','M','L'], colors: [{name:'Beige',hex:'#D4B896'}], rating: 4.4, reviewCount: 12 },
    { name: 'Cargo Utility Black', slug: 'cargo-utility-black', description: 'Pantalón cargo negro funcional.', price: 139.90, comparePrice: 159.90, image: '/images/products/cargo-black.png', catIdx: 2, isFeatured: true, discount: 13, sizes: ['S','M','L','XL'], colors: [{name:'Negro',hex:'#000000'}], rating: 4.9, reviewCount: 56 },
    { name: 'Sneakers Urban White', slug: 'sneakers-urban-white', description: 'Zapatillas blancas minimalistas.', price: 199.90, image: '/images/products/sneakers-white.png', catIdx: 3, isFeatured: true, isNew: true, sizes: ['38','39','40','41','42','43'], colors: [{name:'Blanco',hex:'#FFFFFF'}], rating: 4.8, reviewCount: 89 },
    { name: 'Denim Jacket Classic', slug: 'denim-jacket-classic', description: 'Chaqueta de mezclilla azul clásica.', price: 169.90, image: '/images/products/denim-jacket.png', catIdx: 1, sizes: ['S','M','L','XL'], colors: [{name:'Azul',hex:'#4169E1'}], rating: 4.3, reviewCount: 15 },
  ]

  for (const p of products) {
    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice || null,
        image: p.image,
        categoryId: cats[p.catIdx].id,
        storeId: store.id,
        isFeatured: p.isFeatured || false,
        isNew: p.isNew || false,
        discount: p.discount || null,
        sizes: JSON.stringify(p.sizes),
        colors: JSON.stringify(p.colors),
        rating: p.rating,
        reviewCount: p.reviewCount,
      },
    })
  }

  // Sample Orders
  const order1 = await db.order.create({
    data: {
      orderNumber: 'ORD-0001',
      customerName: 'María López',
      customerPhone: '+51988776655',
      customerAddress: 'Av. Arequipa 1200, Lima',
      status: 'delivered',
      total: 189.80,
      storeId: store.id,
      userId: customer.id,
      items: {
        create: [
          { productId: 'p1', productName: 'Polera Oversize Black', productImage: '/images/products/polera-black.png', price: 79.90, quantity: 1, size: 'M', color: 'Negro' },
          { productId: 'p2', productName: 'Polera Graphic White', productImage: '/images/products/polera-white.png', price: 79.90, quantity: 1, size: 'S', color: 'Blanco' },
        ],
      },
    },
  })

  const order2 = await db.order.create({
    data: {
      orderNumber: 'ORD-0002',
      customerName: 'Diego Torres',
      customerPhone: '+51977665544',
      customerAddress: 'Jr. de la Unión 500, Lima',
      status: 'shipped',
      total: 249.80,
      storeId: store.id,
      items: {
        create: [
          { productId: 'p3', productName: 'Hoodie Premium Gray', productImage: '/images/products/hoodie-gray.png', price: 109.90, quantity: 1, size: 'L', color: 'Gris' },
          { productId: 'p4', productName: 'Jean Slim Fit Dark', productImage: '/images/products/jean-dark.png', price: 139.90, quantity: 1, size: '32', color: 'Azul Oscuro' },
        ],
      },
    },
  })

  await db.order.create({
    data: {
      orderNumber: 'ORD-0003',
      customerName: 'Valentina Rojas',
      customerPhone: '+51966554433',
      status: 'pending',
      total: 109.90,
      storeId: store.id,
      items: {
        create: [
          { productId: 'p6', productName: 'Cargo Utility Black', productImage: '/images/products/cargo-black.png', price: 109.90, quantity: 1, size: 'M', color: 'Negro' },
        ],
      },
    },
  })

  // Testimonials
  const testimonials = [
    { name: 'Carla Mendoza', role: 'Cliente frecuente', content: 'La calidad de las poleras es increíble. El algodón es suave y el corte oversize queda perfecto. ¡Volveré por más!', rating: 5 },
    { name: 'Diego Torres', role: 'Comprador verificado', content: 'Pedí por WhatsApp y en menos de 5 minutos tenía mi pedido confirmado. La entrega fue rapidísima. 100% recomendado.', rating: 5 },
    { name: 'Valentina Rojas', role: 'Cliente frecuente', content: 'Los hoodies son de primera calidad. El precio es justo para lo que recibes. Ya es mi tercera compra.', rating: 4 },
    { name: 'Andrés García', role: 'Comprador verificado', content: 'Me encantó la experiencia de compra. Pude ver el catálogo completo y hacer mi pedido sin complicaciones.', rating: 5 },
  ]

  for (const t of testimonials) {
    await db.testimonial.create({
      data: { name: t.name, role: t.role, content: t.content, rating: t.rating, storeId: store.id },
    })
  }

  console.log('Seed completed!')
  console.log(`Store: ${store.name} (${store.slug})`)
  console.log(`Admin: admin@urbanstyle.pe / admin123`)
  console.log(`Customer: cliente@email.com / cliente123`)
  console.log(`Products: ${products.length}`)
  console.log(`Orders: 3`)
}

seed().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
