import { createClient } from '@libsql/client'

const TURSO_URL = "libsql://tienda-oficial-fast-page-pro.aws-us-east-1.turso.io"
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU0MDExNTYsImlkIjoiMDE5ZDVlMjYtNWYwMS03NmU5LTlkN2ItNWMwNjgxZDIyYTE2IiwicmlkIjoiNGRiY2ZlOWEtODVmNi00OWFmLTlmM2QtNTNiODFkZjZhNzAzIn0.Mmm56rAwJD0WnwraGh-mik6AWXOquwjLqNCl-uU3fZHpL5dWVEE-0qazx1ZV7iMVUM1wHcKZnuMUvj2w1FtVCQ"

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
})

async function setupDatabase() {
  console.log("🔧 Creating tables in Turso...")

  const tables = [
    `CREATE TABLE IF NOT EXISTS "Store" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "logo" TEXT NOT NULL DEFAULT '',
      "whatsappNumber" TEXT NOT NULL DEFAULT '',
      "address" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "plan" TEXT NOT NULL DEFAULT 'free',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Store_slug_key" ON "Store"("slug")`,

    `CREATE TABLE IF NOT EXISTS "StoreUser" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL DEFAULT '',
      "address" TEXT NOT NULL DEFAULT '',
      "role" TEXT NOT NULL DEFAULT 'customer',
      "storeId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "StoreUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "StoreUser_email_storeId_key" ON "StoreUser"("email", "storeId")`,

    `CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "image" TEXT NOT NULL DEFAULT '',
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "storeId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "price" REAL NOT NULL,
      "comparePrice" REAL,
      "image" TEXT NOT NULL DEFAULT '',
      "categoryId" TEXT NOT NULL,
      "storeId" TEXT NOT NULL,
      "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
      "isNew" BOOLEAN NOT NULL DEFAULT 0,
      "discount" INTEGER,
      "sizes" TEXT NOT NULL DEFAULT '[]',
      "colors" TEXT NOT NULL DEFAULT '[]',
      "rating" REAL NOT NULL DEFAULT 4.5,
      "reviewCount" INTEGER NOT NULL DEFAULT 0,
      "inStock" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_storeId_key" ON "Product"("slug", "storeId")`,

    `CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderNumber" TEXT NOT NULL,
      "customerName" TEXT NOT NULL,
      "customerPhone" TEXT NOT NULL,
      "customerAddress" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "total" REAL NOT NULL,
      "notes" TEXT NOT NULL DEFAULT '',
      "storeId" TEXT NOT NULL,
      "userId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "StoreUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`,

    `CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "productName" TEXT NOT NULL,
      "productImage" TEXT NOT NULL,
      "price" REAL NOT NULL,
      "quantity" INTEGER NOT NULL,
      "size" TEXT NOT NULL DEFAULT '',
      "color" TEXT NOT NULL DEFAULT '',
      "orderId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS "Testimonial" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT '',
      "content" TEXT NOT NULL,
      "rating" INTEGER NOT NULL DEFAULT 5,
      "storeId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Testimonial_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME NOT NULL,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT NOT NULL,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )`,
  ]

  for (const sql of tables) {
    try {
      await client.execute(sql)
      console.log("✅ Table/index created")
    } catch (err) {
      console.error("❌ Error:", err)
      throw err
    }
  }

  console.log("\n🎉 All tables created successfully!")

  // Verify
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log("\n📋 Tables in database:")
  for (const row of result.rows) {
    console.log(`  - ${row.name}`)
  }

  await client.close()
}

setupDatabase().catch(err => {
  console.error("Setup failed:", err)
  process.exit(1)
})
