// Usage: TURSO_URL=... DATABASE_AUTH_TOKEN=... npx tsx scripts/sync-missing-tables.ts
import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_URL || ''
const TURSO_TOKEN = process.env.DATABASE_AUTH_TOKEN || ''

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
})

async function syncTables() {
  console.log("🔧 Syncing missing tables to Turso...")

  // 1. Check existing tables
  const existing = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  const existingNames = new Set(existing.rows.map(r => r.name))
  console.log("Existing tables:", [...existingNames].join(", "))

  const newTables: string[] = []

  // StoreContent table (for editable storefront content)
  if (!existingNames.has('StoreContent')) {
    await client.execute(`
      CREATE TABLE "StoreContent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storeId" TEXT NOT NULL,
        "section" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL DEFAULT '',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StoreContent_storeId_section_key_key" UNIQUE("storeId", "section", "key"),
        FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "StoreContent_storeId_idx" ON "StoreContent"("storeId")`)
    newTables.push('StoreContent')
    console.log("✅ Created StoreContent table")
  }

  // PaymentMethod table
  if (!existingNames.has('PaymentMethod')) {
    await client.execute(`
      CREATE TABLE "PaymentMethod" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "qrCode" TEXT NOT NULL DEFAULT '',
        "accountNumber" TEXT NOT NULL DEFAULT '',
        "accountHolder" TEXT NOT NULL DEFAULT '',
        "bankName" TEXT NOT NULL DEFAULT '',
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PaymentMethod_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "PaymentMethod_storeId_idx" ON "PaymentMethod"("storeId")`)
    newTables.push('PaymentMethod')
    console.log("✅ Created PaymentMethod table")
  }

  // Lead table
  if (!existingNames.has('Lead')) {
    await client.execute(`
      CREATE TABLE "Lead" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL DEFAULT '',
        "message" TEXT NOT NULL DEFAULT '',
        "source" TEXT NOT NULL DEFAULT 'landing',
        "plan" TEXT NOT NULL DEFAULT '',
        "status" TEXT NOT NULL DEFAULT 'new',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status")`)
    await client.execute(`CREATE INDEX IF NOT EXISTS "Lead_source_idx" ON "Lead"("source")`)
    newTables.push('Lead')
    console.log("✅ Created Lead table")
  }

  // MercadoPagoPayment table
  if (!existingNames.has('MercadoPagoPayment')) {
    await client.execute(`
      CREATE TABLE "MercadoPagoPayment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "preferenceId" TEXT NOT NULL,
        "paymentId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "paymentType" TEXT NOT NULL DEFAULT '',
        "lastFourDigits" TEXT NOT NULL DEFAULT '',
        "installments" INTEGER NOT NULL DEFAULT 1,
        "payerEmail" TEXT NOT NULL DEFAULT '',
        "payerDocType" TEXT NOT NULL DEFAULT '',
        "payerDocNumber" TEXT NOT NULL DEFAULT '',
        "metadata" TEXT NOT NULL DEFAULT '{}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MercadoPagoPayment_orderId_key" UNIQUE("orderId"),
        CONSTRAINT "MercadoPagoPayment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "MercadoPagoPayment_storeId_idx" ON "MercadoPagoPayment"("storeId")`)
    await client.execute(`CREATE INDEX IF NOT EXISTS "MercadoPagoPayment_status_idx" ON "MercadoPagoPayment"("status")`)
    newTables.push('MercadoPagoPayment')
    console.log("✅ Created MercadoPagoPayment table")
  }

  // Coupon table
  if (!existingNames.has('Coupon')) {
    await client.execute(`
      CREATE TABLE "Coupon" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'percentage',
        "value" REAL NOT NULL,
        "minPurchase" REAL,
        "maxUses" INTEGER NOT NULL DEFAULT 0,
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "expiresAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Coupon_code_key" UNIQUE("code"),
        CONSTRAINT "Coupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "Coupon_storeId_idx" ON "Coupon"("storeId")`)
    await client.execute(`CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code")`)
    newTables.push('Coupon')
    console.log("✅ Created Coupon table")
  }

  // AdminNotification table
  if (!existingNames.has('AdminNotification')) {
    await client.execute(`
      CREATE TABLE "AdminNotification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storeId" TEXT,
        "type" TEXT NOT NULL DEFAULT 'info',
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "data" TEXT NOT NULL DEFAULT '{}',
        "isRead" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AdminNotification_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "AdminNotification_storeId_idx" ON "AdminNotification"("storeId")`)
    newTables.push('AdminNotification')
    console.log("✅ Created AdminNotification table")
  }

  // RateLimit table
  if (!existingNames.has('RateLimit')) {
    await client.execute(`
      CREATE TABLE "RateLimit" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL,
        "count" INTEGER NOT NULL DEFAULT 1,
        "windowEnd" DATETIME NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RateLimit_key_key" UNIQUE("key"),
        CONSTRAINT "RateLimit_windowEnd_idx_key" UNIQUE("windowEnd")
      )
    `)
    await client.execute(`CREATE INDEX IF NOT EXISTS "RateLimit_key_idx" ON "RateLimit"("key")`)
    await client.execute(`CREATE INDEX IF NOT EXISTS "RateLimit_windowEnd_idx" ON "RateLimit"("windowEnd")`)
    newTables.push('RateLimit')
    console.log("✅ Created RateLimit table")
  }

  // Add missing columns to Store table
  try {
    const storeCols = await client.execute("PRAGMA table_info(\"Store\")")
    const storeColNames = new Set(storeCols.rows.map(r => r.name))

    if (!storeColNames.has('subscriptionExpiresAt')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "subscriptionExpiresAt" DATETIME`)
      console.log("✅ Added Store.subscriptionExpiresAt")
    }
    if (!storeColNames.has('trialDays')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "trialDays" INTEGER NOT NULL DEFAULT 0`)
      console.log("✅ Added Store.trialDays")
    }
    if (!storeColNames.has('customDomain')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "customDomain" TEXT DEFAULT NULL`)
      console.log("✅ Added Store.customDomain")
    }
    if (!storeColNames.has('domainVerified')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "domainVerified" INTEGER NOT NULL DEFAULT 0`)
      console.log("✅ Added Store.domainVerified")
    }
    if (!storeColNames.has('domainVerifiedAt')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "domainVerifiedAt" TEXT DEFAULT NULL`)
      console.log("✅ Added Store.domainVerifiedAt")
    }
    if (!storeColNames.has('primaryColor')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#171717'`)
      console.log("✅ Added Store.primaryColor")
    }
    if (!storeColNames.has('secondaryColor')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "secondaryColor" TEXT NOT NULL DEFAULT '#fafafa'`)
      console.log("✅ Added Store.secondaryColor")
    }
    if (!storeColNames.has('accentColor')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#171717'`)
      console.log("✅ Added Store.accentColor")
    }
    if (!storeColNames.has('fontFamily')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "fontFamily" TEXT NOT NULL DEFAULT 'system-ui'`)
      console.log("✅ Added Store.fontFamily")
    }
    if (!storeColNames.has('customCSS')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "customCSS" TEXT NOT NULL DEFAULT ''`)
      console.log("✅ Added Store.customCSS")
    }
    if (!storeColNames.has('favicon')) {
      await client.execute(`ALTER TABLE "Store" ADD COLUMN "favicon" TEXT NOT NULL DEFAULT ''`)
      console.log("✅ Added Store.favicon")
    }
  } catch (e) {
    console.warn("Could not check Store columns:", e)
  }

  // Add missing columns to StoreUser table
  try {
    const userCols = await client.execute("PRAGMA table_info(\"StoreUser\")")
    const userColNames = new Set(userCols.rows.map(r => r.name))

    if (!userColNames.has('twoFactorSecret')) {
      await client.execute(`ALTER TABLE "StoreUser" ADD COLUMN "twoFactorSecret" TEXT`)
      console.log("✅ Added StoreUser.twoFactorSecret")
    }
    if (!userColNames.has('twoFactorEnabled')) {
      await client.execute(`ALTER TABLE "StoreUser" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT 0`)
      console.log("✅ Added StoreUser.twoFactorEnabled")
    }
    if (!userColNames.has('googleId')) {
      await client.execute(`ALTER TABLE "StoreUser" ADD COLUMN "googleId" TEXT`)
      console.log("✅ Added StoreUser.googleId")
    }
    if (!userColNames.has('avatar')) {
      await client.execute(`ALTER TABLE "StoreUser" ADD COLUMN "avatar" TEXT NOT NULL DEFAULT ''`)
      console.log("✅ Added StoreUser.avatar")
    }
  } catch (e) {
    console.warn("Could not check StoreUser columns:", e)
  }

  // Add missing columns to Product table
  try {
    const prodCols = await client.execute("PRAGMA table_info(\"Product\")")
    const prodColNames = new Set(prodCols.rows.map(r => r.name))

    if (!prodColNames.has('images')) {
      await client.execute(`ALTER TABLE "Product" ADD COLUMN "images" TEXT NOT NULL DEFAULT '[]'`)
      console.log("✅ Added Product.images")
    }
  } catch (e) {
    console.warn("Could not check Product columns:", e)
  }

  // Add missing columns to Order table
  try {
    const orderCols = await client.execute("PRAGMA table_info(\"Order\")")
    const orderColNames = new Set(orderCols.rows.map(r => r.name))

    if (!orderColNames.has('paymentMethodId')) {
      await client.execute(`ALTER TABLE "Order" ADD COLUMN "paymentMethodId" TEXT`)
      console.log("✅ Added Order.paymentMethodId")
    }
  } catch (e) {
    console.warn("Could not check Order columns:", e)
  }

  if (newTables.length === 0) {
    console.log("\n✅ All tables already exist - no changes needed")
  } else {
    console.log(`\n🎉 Created ${newTables.length} new table(s): ${newTables.join(", ")}`)
  }

  // Verify final state
  const final = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  console.log("\n📋 Final tables in database:")
  for (const row of final.rows) {
    console.log(`  - ${row.name}`)
  }

  // Seed default testimonials for all stores that don't have them
  const stores = await client.execute(`SELECT id FROM "Store"`)
  console.log(`\n📊 Found ${stores.rows.length} stores`)

  for (const store of stores.rows) {
    const storeId = store.id as string

    const existingTestimonials = await client.execute({
      sql: `SELECT COUNT(*) as count FROM "Testimonial" WHERE storeId = ?`,
      args: [storeId]
    })
    const count = (existingTestimonials.rows[0] as any).count as number

    if (count === 0) {
      console.log(`  Seeding testimonials for store ${storeId}...`)
      const defaultTestimonials = [
        { name: 'María García', role: 'Cliente Frecuente', content: 'Excelente calidad y atención. Los productos llegaron en perfectas condiciones y el envío fue súper rápido.', rating: 5 },
        { name: 'Carlos López', role: 'Cliente Verificado', content: 'La mejor tienda online que he usado. Los precios son competitivos y la atención al cliente es excepcional.', rating: 5 },
        { name: 'Ana Torres', role: 'Compradora Regular', content: 'Me encanta la variedad de productos. Siempre encuentro lo que busco y la calidad es excelente.', rating: 5 },
      ]
      const now = new Date().toISOString()
      for (const t of defaultTestimonials) {
        const id = 't_' + Math.random().toString(36).substring(2, 22)
        await client.execute({
          sql: `INSERT INTO "Testimonial" (id, name, role, content, rating, storeId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [id, t.name, t.role, t.content, t.rating, storeId, now]
        })
      }
      console.log(`  ✅ 3 testimonials seeded for store ${storeId}`)
    }
  }

  await client.close()
}

syncTables().catch(err => {
  console.error("Sync failed:", err)
  process.exit(1)
})
