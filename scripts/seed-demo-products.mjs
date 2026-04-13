/**
 * Seeding script: Seed all 21 seed-data products into the Urban Style demo store
 * Store ID: kmpw0h5ig4o518kg4zsm5huo3
 * 
 * Strategy:
 * 1. Delete existing seed-data products (IDs starting with "prod-") that have no images
 * 2. Insert all 21 products from seed-data.ts with proper images and category mapping
 * 3. Keep the 8 manually created products (polera-oversize-black, etc.) untouched
 */

import { createClient } from '@libsql/client'

const STORE_ID = 'kmpw0h5ig4o518kg4zsm5huo3'

const client = createClient({
  url: 'libsql://tienda-oficial-fast-page-pro.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU2ODM5MzQsImlkIjoiMDE5ZDVlMjYtNWYwMS03NmU5LTlkN2ItNWMwNjgxZDIyYTE2IiwicmlkIjoiNGRiY2ZlOWEtODVmNi00OWFmLTlmM2QtNTNiODFkZjZhNzAzIn0.q3HXxi47K9uZfhdxgENSdUuf7-nMIHGMvfl2ra_k-E44m9pVvKIops-WtEWPZFERcl94jH4Oy_bC-QnUhb8CBA'
})

// Category slug → demo store category ID mapping
const CATEGORY_MAP = {
  camisetas: '6ur5tcdnkvlhbz0popz83ooox',   // Polos
  pantalones: '43wkjiku1ux4hhvi51rvumgdf',    // Pantalones
  zapatillas: 'txfju4yp5i7alvpalvsqy0fok',    // Zapatos
  accesorios: 'cat-acc-1775692119956',        // Accesorios
  chaquetas: 'cat-chq-1775692121012',         // Chaquetas
  hoodies: 'mibdlcdc6gq0b5q658gwbntvu',      // Hoodies
}

function uid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

// All 21 products from seed-data.ts
const SEED_PRODUCTS = [
  {
    name: 'Camiseta Urban Classic',
    slug: 'camiseta-urban-classic',
    description: 'Camiseta de algodón pima 100% con estampado urbano exclusivo. Corte regular fit ideal para el día a día.',
    price: 79.9, comparePrice: 99.9,
    image: '/images/products/polera-oversize.png',
    categorySlug: 'camisetas',
    isFeatured: true, isNew: false, discount: 20,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"},{"name":"Gris","hex":"#6b7280"}]',
    rating: 4.87, reviewCount: 54,
  },
  {
    name: 'Camiseta Oversize Street',
    slug: 'camiseta-oversize-street',
    description: 'Polo oversize de algodón premium con caída relajada. Perfecto para combinar con joggers o jeans.',
    price: 89.9, comparePrice: null,
    image: '/images/products/polera-black.png',
    categorySlug: 'camisetas',
    isFeatured: true, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"}]',
    rating: 4.80, reviewCount: 80,
  },
  {
    name: 'Camiseta Logo Premium',
    slug: 'camiseta-logo-premium',
    description: 'Camiseta con logo bordado en el pecho. Algodón 24/1 de alta suavidad, no destiñe.',
    price: 69.9, comparePrice: 89.9,
    image: '/images/products/polera-white.png',
    categorySlug: 'camisetas',
    isFeatured: false, isNew: false, discount: 22,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Rojo","hex":"#ef4444"}]',
    rating: 4.86, reviewCount: 61,
  },
  {
    name: 'Camiseta Minimal Black',
    slug: 'camiseta-minimal-black',
    description: 'Polo negro minimalista sin estampados. Algodón peinado con acabado mate, básico imperdible.',
    price: 59.9, comparePrice: null,
    image: '/images/products/polera-black.png',
    categorySlug: 'camisetas',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.79, reviewCount: 44,
  },
  {
    name: 'Jogger Cargo Negro',
    slug: 'jogger-cargo-negro',
    description: 'Jogger cargo con 6 bolsillos funcionales. Tela de gabardina stretch, cintura elástica con cordón.',
    price: 129.9, comparePrice: 159.9,
    image: '/images/products/cargo-black.png',
    categorySlug: 'pantalones',
    isFeatured: true, isNew: false, discount: 19,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Oliva","hex":"#4b5320"}]',
    rating: 4.59, reviewCount: 12,
  },
  {
    name: 'Jeans Slim Fit',
    slug: 'jeans-slim-fit',
    description: 'Jeans de mezclilla premium 12oz con stretch. Lavado dark blue, slim fit con acabado vintage.',
    price: 149.9, comparePrice: null,
    image: '/images/products/jean-dark.png',
    categorySlug: 'pantalones',
    isFeatured: false, isNew: false, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Azul Oscuro","hex":"#1e3a5f"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.66, reviewCount: 60,
  },
  {
    name: 'Jogger Gris Urbano',
    slug: 'jogger-gris-urbano',
    description: 'Jogger de fleece premium con puños y cintura elástica. Ideal para deporte o uso casual.',
    price: 109.9, comparePrice: null,
    image: '/images/products/jogger-black.png',
    categorySlug: 'pantalones',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Gris","hex":"#6b7280"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.84, reviewCount: 41,
  },
  {
    name: 'Cargo Oliva Street',
    slug: 'cargo-oliva-street',
    description: 'Pantalón cargo oliva con bolsillos laterales. Tela ripstop resistente, ajuste regular, ideal para outdoor.',
    price: 134.9, comparePrice: null,
    image: '/images/products/cargo-olive.png',
    categorySlug: 'pantalones',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Oliva","hex":"#4b5320"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.52, reviewCount: 42,
  },
  {
    name: 'Air Runner Pro',
    slug: 'air-runner-pro',
    description: 'Zapatillas deportivas con suela de gel amortiguante. Upper de mesh transpirable, diseño moderno.',
    price: 249.9, comparePrice: 299.9,
    image: '/images/products/sneakers-white.png',
    categorySlug: 'zapatillas',
    isFeatured: true, isNew: true, discount: 17,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.68, reviewCount: 60,
  },
  {
    name: 'Street Style High',
    slug: 'street-style-high',
    description: 'Zapatillas high-top de cuero sintético con suela gruesa. Estilo urbano con máxima comodidad.',
    price: 199.9, comparePrice: null,
    image: '/images/products/sneakers-white-v2.png',
    categorySlug: 'zapatillas',
    isFeatured: true, isNew: false, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Rojo","hex":"#ef4444"}]',
    rating: 4.85, reviewCount: 90,
  },
  {
    name: 'Classic White Low',
    slug: 'classic-white-low',
    description: 'Zapatillas low-top blancas clásicas. Cuero sintético premium, suela vulcanizada anti-deslizante.',
    price: 179.9, comparePrice: 219.9,
    image: '/images/products/sneakers-white.png',
    categorySlug: 'zapatillas',
    isFeatured: false, isNew: false, discount: 18,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"}]',
    rating: 4.64, reviewCount: 25,
  },
  {
    name: 'Gorra Snapback Urban',
    slug: 'gorra-snapback-urban',
    description: 'Gorra snapback con visera plana y cierre ajustable. Tela de gabardina, logo bordado 3D.',
    price: 49.9, comparePrice: null,
    image: '/images/products/hoodie-gray.png',
    categorySlug: 'accesorios',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"}]',
    rating: 4.78, reviewCount: 86,
  },
  {
    name: 'Mochila Laptop Pro',
    slug: 'mochila-laptop-pro',
    description: 'Mochila para laptop 15.6" con compartimento acolchado. Material resistente al agua, puerto USB lateral.',
    price: 139.9, comparePrice: 169.9,
    image: '/images/products/bomber-black.png',
    categorySlug: 'accesorios',
    isFeatured: true, isNew: false, discount: 18,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Gris","hex":"#6b7280"}]',
    rating: 4.55, reviewCount: 48,
  },
  {
    name: 'Cadena Urban Gold',
    slug: 'cadena-urban-gold',
    description: 'Cadena de acero inoxidable bañada en oro 18k. Diseño cubano link, cierre de langosta.',
    price: 39.9, comparePrice: null,
    image: '/images/products/hoodie-red.png',
    categorySlug: 'accesorios',
    isFeatured: false, isNew: false, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Dorado","hex":"#d4af37"},{"name":"Plateado","hex":"#c0c0c0"}]',
    rating: 4.74, reviewCount: 74,
  },
  {
    name: 'Bomber Jacket Negro',
    slug: 'bomber-jacket-negro',
    description: 'Bomber de nylon con forro polar. Cierre YKK, bolsillos con cremallera, acabado premium.',
    price: 199.9, comparePrice: 249.9,
    image: '/images/products/bomber-black.png',
    categorySlug: 'chaquetas',
    isFeatured: true, isNew: false, discount: 20,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Verde Militar","hex":"#4b5320"}]',
    rating: 4.63, reviewCount: 14,
  },
  {
    name: 'Windbreaker Deportivo',
    slug: 'windbreaker-deportivo',
    description: 'Chaqueta windbreaker ligera e impermeable. Capucha plegable, ventilación trasera, reflectivos.',
    price: 159.9, comparePrice: null,
    image: '/images/products/denim-jacket.png',
    categorySlug: 'chaquetas',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Azul","hex":"#3b82f6"}]',
    rating: 4.98, reviewCount: 45,
  },
  {
    name: 'Denim Jacket Vintage',
    slug: 'denim-jacket-vintage',
    description: 'Chaqueta denim de mezclilla lavada. Estilo cropped, botones de metal, forro de satén.',
    price: 189.9, comparePrice: 229.9,
    image: '/images/products/denim-vintage.png',
    categorySlug: 'chaquetas',
    isFeatured: true, isNew: false, discount: 17,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Azul Denim","hex":"#5b8db8"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.74, reviewCount: 48,
  },
  {
    name: 'Hoodie Oversize Grey',
    slug: 'hoodie-oversize-grey',
    description: 'Hoodie oversize de fleece 380gsm. Capucha amplia con cordones planos, bolsillo canguro.',
    price: 119.9, comparePrice: 149.9,
    image: '/images/products/hoodie-gray.png',
    categorySlug: 'hoodies',
    isFeatured: true, isNew: false, discount: 20,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Gris","hex":"#6b7280"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Beige","hex":"#d4b896"}]',
    rating: 4.99, reviewCount: 41,
  },
  {
    name: 'Hoodie Zip Street',
    slug: 'hoodie-zip-street',
    description: 'Buzo con cierre frontal completo. Fleece suave anti-pilling, mangas raglan para mejor movilidad.',
    price: 139.9, comparePrice: null,
    image: '/images/products/hoodie-red.png',
    categorySlug: 'hoodies',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Rojo","hex":"#ef4444"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.94, reviewCount: 86,
  },
  {
    name: 'Sweater Beige Premium',
    slug: 'sweater-beige-premium',
    description: 'Suéter de lana merino premium. Punto jersey suave, cuello redondo, acabado profesional.',
    price: 109.9, comparePrice: 139.9,
    image: '/images/products/sweater-beige.png',
    categorySlug: 'hoodies',
    isFeatured: false, isNew: false, discount: 21,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Beige","hex":"#d4b896"},{"name":"Crema","hex":"#f5f0e8"}]',
    rating: 4.81, reviewCount: 21,
  },
  {
    name: 'Sweater Cream Vintage',
    slug: 'sweater-cream-vintage',
    description: 'Suéter crema con textura vintage. Algodón macramé, costuras reforzadas, corte relajado.',
    price: 99.9, comparePrice: null,
    image: '/images/products/sweater-cream.png',
    categorySlug: 'hoodies',
    isFeatured: false, isNew: true, discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Crema","hex":"#f5f0e8"},{"name":"Gris","hex":"#6b7280"}]',
    rating: 4.69, reviewCount: 59,
  },
]

async function main() {
  console.log('=== Seeding Demo Products for Urban Style ===')
  console.log(`Store ID: ${STORE_ID}\n`)

  // Step 1: Get existing products with their slugs
  const existing = await client.execute({
    sql: 'SELECT id, slug, image FROM Product WHERE storeId = ?',
    args: [STORE_ID],
  })
  const existingBySlug = new Map(existing.rows.map(r => [r.slug, r]))
  console.log(`Found ${existing.rows.length} existing products`)

  // Step 2: Identify seed-data products (those with ID starting with "prod-")
  const toDelete = existing.rows.filter(r => r.id.startsWith('prod-'))
  console.log(`Deleting ${toDelete.length} old seed-data products...`)
  
  for (const row of toDelete) {
    await client.execute({
      sql: 'DELETE FROM OrderItem WHERE productId = ?',
      args: [row.id],
    })
    await client.execute({
      sql: 'DELETE FROM Product WHERE id = ?',
      args: [row.id],
    })
  }

  // Step 3: Insert or update all 21 seed products
  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const p of SEED_PRODUCTS) {
    const categoryId = CATEGORY_MAP[p.categorySlug]
    if (!categoryId) {
      console.error(`  ERROR: No category mapping for "${p.categorySlug}"`)
      continue
    }

    const existingProduct = existingBySlug.get(p.slug)
    
    if (existingProduct) {
      // Update existing manually-created product that happens to share a slug
      if (existingProduct.id.startsWith('prod-')) {
        // Already deleted above, will be re-inserted
        continue
      }
      // This is a manually created product - skip it, don't overwrite
      console.log(`  ⊘ Skipped (manual): ${p.name}`)
      skipped++
      continue
    }

    // Insert new product
    const id = uid()
    const now = new Date().toISOString()
    await client.execute({
      sql: `INSERT INTO Product (id, name, slug, description, price, comparePrice, image, categoryId, storeId, isFeatured, isNew, discount, sizes, colors, rating, reviewCount, inStock, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.comparePrice,
        p.image,
        categoryId,
        STORE_ID,
        p.isFeatured ? 1 : 0,
        p.isNew ? 1 : 0,
        p.discount,
        p.sizes,
        p.colors,
        p.rating,
        p.reviewCount,
        1,
        now,
        now,
      ],
    })
    console.log(`  ✓ Inserted: ${p.name} [${p.categorySlug}]`)
    inserted++
  }

  // Step 4: Verify results
  const finalCount = await client.execute({
    sql: 'SELECT count(*) as cnt FROM Product WHERE storeId = ?',
    args: [STORE_ID],
  })
  
  const withImages = await client.execute({
    sql: "SELECT count(*) as cnt FROM Product WHERE storeId = ? AND image != '' AND image IS NOT NULL",
    args: [STORE_ID],
  })

  console.log(`\n=== Results ===`)
  console.log(`Inserted: ${inserted} new products`)
  console.log(`Skipped: ${skipped} manually created products`)
  console.log(`Total products: ${finalCount.rows[0].cnt}`)
  console.log(`Products with images: ${withImages.rows[0].cnt}`)

  // Breakdown by category
  const breakdown = await client.execute({
    sql: `SELECT c.name as category, COUNT(p.id) as product_count
          FROM Product p
          JOIN Category c ON p.categoryId = c.id
          WHERE p.storeId = ?
          GROUP BY p.categoryId
          ORDER BY c.sortOrder`,
    args: [STORE_ID],
  })
  console.log('\nProduct breakdown by category:')
  for (const row of breakdown.rows) {
    console.log(`  - ${row.category}: ${row.product_count} products`)
  }

  // List all products with images
  console.log('\nAll products with images:')
  const allProds = await client.execute({
    sql: 'SELECT name, slug, image, categoryId FROM Product WHERE storeId = ? ORDER BY name',
    args: [STORE_ID],
  })
  for (const p of allProds.rows) {
    const hasImg = p.image && p.image.length > 0 ? '✓' : '✗'
    console.log(`  ${hasImg} ${p.name} | ${p.slug} | img: ${p.image || 'NONE'}`)
  }
}

main().catch(console.error)
