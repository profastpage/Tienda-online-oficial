// Usage: TURSO_URL=... DATABASE_AUTH_TOKEN=... npx tsx scripts/test-turso.ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// Pass config directly to the adapter, not a pre-created client
const adapter = new PrismaLibSQL({
  url: process.env.TURSO_URL || '',
  authToken: process.env.DATABASE_AUTH_TOKEN || '',
})

const prisma = new PrismaClient({ adapter })

try {
  const stores = await prisma.store.findMany()
  console.log("✅ Connected to Turso! Stores:", stores.length)
  for (const s of stores) {
    console.log(`  - ${s.name} (${s.slug})`)
  }
  
  const products = await prisma.product.findMany({ take: 5 })
  console.log(`\n✅ Products: ${products.length}`)
  for (const p of products) {
    console.log(`  - ${p.name}: S/${p.price}`)
  }
} catch (e) {
  console.error("❌ Error:", e)
}
await prisma.$disconnect()
