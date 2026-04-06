import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// Pass config directly to the adapter, not a pre-created client
const adapter = new PrismaLibSQL({
  url: "libsql://tienda-oficial-fast-page-pro.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU0MDExNTYsImlkIjoiMDE5ZDVlMjYtNWYwMS03NmU5LTlkN2ItNWMwNjgxZDIyYTE2IiwicmlkIjoiNGRiY2ZlOWEtODVmNi00OWFmLTlmM2QtNTNiODFkZjZhNzAzIn0.Mmm56rAwJD0WnwraGh-mik6AWXOquwjLqNCl-uU3fZHpL5dWVEE-0qazx1ZV7iMVUM1wHcKZnuMUvj2w1FtVCQ",
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
