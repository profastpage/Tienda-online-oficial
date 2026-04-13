import { db } from './src/lib/db'

async function addProducts() {
  const store = await db.store.findFirst({ where: { slug: 'urban-style' } })
  if (!store) { console.error('Store not found'); return }

  const categories = await db.category.findMany({ where: { storeId: store.id } })
  const catMap: Record<string, string> = {}
  for (const c of categories) catMap[c.slug] = c.id

  const newProducts = [
    { name: 'Polera Oversize Graphic', slug: 'polera-oversize-graphic', description: 'Polera oversize con estampado gráfico urbano, algodón premium 100%.', price: 89.90, comparePrice: 99.90, image: '/images/products/polera-oversize.png', catSlug: 'polos', isFeatured: true, discount: 10, isNew: true, sizes: ['S','M','L','XL'], colors: [{name:'Negro',hex:'#000000'},{name:'Blanco',hex:'#FFFFFF'}], rating: 4.7, reviewCount: 34 },
    { name: 'Sweater Cream Knit', slug: 'sweater-cream-knit', description: 'Suéter de punto cremoso, perfecto para climas frescos. Comodidad premium.', price: 129.90, image: '/images/products/sweater-cream.png', catSlug: 'hoodies', isFeatured: false, isNew: true, sizes: ['S','M','L'], colors: [{name:'Crema',hex:'#F5F0E8'}], rating: 4.5, reviewCount: 19 },
    { name: 'Bomber Jacket Black', slug: 'bomber-jacket-black', description: 'Bomber jacket negro con ribetes elásticos. Estilo urbano clásico.', price: 189.90, comparePrice: 219.90, image: '/images/products/bomber-black.png', catSlug: 'hoodies', isFeatured: true, discount: 14, isNew: true, sizes: ['S','M','L','XL'], colors: [{name:'Negro',hex:'#000000'}], rating: 4.8, reviewCount: 47 },
    { name: 'Denim Vintage Wash', slug: 'denim-vintage-wash', description: 'Chaqueta denim con lavado vintage, acabado desgastado auténtico.', price: 179.90, image: '/images/products/denim-vintage.png', catSlug: 'hoodies', isFeatured: false, isNew: true, sizes: ['S','M','L','XL'], colors: [{name:'Azul Vintage',hex:'#5C7EAA'}], rating: 4.6, reviewCount: 22 },
    { name: 'Cargo Utility Olive', slug: 'cargo-utility-olive', description: 'Pantalón cargo verde oliva con múltiples bolsillos funcionales.', price: 149.90, image: '/images/products/cargo-olive.png', catSlug: 'pantalones', isFeatured: true, isNew: true, sizes: ['S','M','L','XL'], colors: [{name:'Oliva',hex:'#556B2F'}], rating: 4.7, reviewCount: 28 },
    { name: 'Jogger Athletic Black', slug: 'jogger-athletic-black', description: 'Jogger negro deportivo, tela elástica con ajuste perfecto.', price: 119.90, comparePrice: 139.90, image: '/images/products/jogger-black.png', catSlug: 'pantalones', isFeatured: false, discount: 14, sizes: ['S','M','L','XL'], colors: [{name:'Negro',hex:'#000000'}], rating: 4.4, reviewCount: 16 },
    { name: 'Hoodie Fire Red', slug: 'hoodie-fire-red', description: 'Hoodie rojo vibrante con capucha y bolsillo canguro. Edición limitada.', price: 119.90, image: '/images/products/hoodie-red.png', catSlug: 'hoodies', isFeatured: true, isNew: true, sizes: ['M','L','XL'], colors: [{name:'Rojo',hex:'#DC2626'}], rating: 4.9, reviewCount: 61 },
    { name: 'Sneakers Classic White V2', slug: 'sneakers-classic-white-v2', description: 'Zapatillas blancas clásicas rediseñadas. Suela antideslizante.', price: 219.90, comparePrice: 249.90, image: '/images/products/sneakers-white-v2.png', catSlug: 'zapatos', isFeatured: true, discount: 12, isNew: true, sizes: ['38','39','40','41','42','43','44'], colors: [{name:'Blanco',hex:'#FFFFFF'}], rating: 4.8, reviewCount: 73 },
  ]

  let added = 0
  for (const p of newProducts) {
    const categoryId = catMap[p.catSlug]
    if (!categoryId) { console.warn(`Category ${p.catSlug} not found, skipping ${p.name}`); continue }

    const existing = await db.product.findFirst({ where: { slug: p.slug, storeId: store.id } })
    if (existing) { console.log(`Skipping ${p.name} (already exists)`); continue }

    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice || null,
        image: p.image,
        categoryId,
        storeId: store.id,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        discount: p.discount || null,
        sizes: JSON.stringify(p.sizes),
        colors: JSON.stringify(p.colors),
        rating: p.rating,
        reviewCount: p.reviewCount,
      },
    })
    added++
    console.log(`Added: ${p.name}`)
  }

  // Add more testimonials
  const newTestimonials = [
    { name: 'Sofía Herrera', role: 'Cliente nueva', content: 'Acabo de recibir mi hoodie rojo y es HERMOSO. La calidad superó mis expectativas. Ya estoy viendo qué más comprar.', rating: 5 },
    { name: 'Mateo Castillo', role: 'Comprador verificado', content: 'Las zapatillas son comodísimas. Las uso todos los días y siguen como nuevas. El precio es muy justo.', rating: 5 },
  ]

  let addedT = 0
  for (const t of newTestimonials) {
    await db.testimonial.create({ data: { name: t.name, role: t.role, content: t.content, rating: t.rating, storeId: store.id } })
    addedT++
  }

  console.log(`\nDone! Added ${added} products and ${addedT} testimonials.`)
}

addProducts().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
