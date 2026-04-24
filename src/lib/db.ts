import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ═══════════════════════════════════════════════════════════
// CRITICAL: Prisma schema requires DATABASE_URL even when
// using the Turso adapter. If DATABASE_URL is not set but
// TURSO_URL is available, use TURSO_URL as fallback.
// This prevents PrismaClient initialization failures.
// ═══════════════════════════════════════════════════════════
if (!process.env.DATABASE_URL) {
  if (process.env.TURSO_URL) {
    process.env.DATABASE_URL = process.env.TURSO_URL
    console.log('[db] DATABASE_URL not set, using TURSO_URL as fallback')
  } else {
    // Default to local SQLite for development
    process.env.DATABASE_URL = 'file:./dev.db'
    console.log('[db] No DATABASE_URL or TURSO_URL set, using local SQLite')
  }
}

// Check if Turso credentials are available
const hasTurso = Boolean(process.env.TURSO_URL && process.env.DATABASE_AUTH_TOKEN)

if (hasTurso) {
  console.log('[db] Turso mode enabled - TURSO_URL is set')
} else {
  console.log('[db] Local SQLite mode (no TURSO_URL/DATABASE_AUTH_TOKEN)')
}

// Create local SQLite client (fallback)
function createLocalClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  })
}

// Create Turso client with LibSQL adapter
async function createTursoClient(): Promise<PrismaClient> {
  try {
    const { PrismaLibSQL } = await import('@prisma/adapter-libsql')

    const adapter = new PrismaLibSQL({
      url: process.env.TURSO_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    })

    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    })

    // Test the connection with a simple query
    await client.$queryRaw`SELECT 1 as test`
    console.log('[db] Turso connection established')
    return client
  } catch (error) {
    console.error('[db] Turso connection failed:', error instanceof Error ? error.message : error)
    throw error
  }
}

// Lazy schema migration — only runs ONCE and only if columns are actually missing.
// Uses PRAGMA table_info to check before ALTER TABLE (avoids 11 try/catch on every cold start).
let __schemaMigrated = false
export async function ensureSchema(db: PrismaClient): Promise<void> {
  if (__schemaMigrated) return

  try {
    const cols = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("Store")`)
    const existing = new Set(cols.map(c => c.name))

    const missing: string[] = []
    const migrations: { col: string; sql: string }[] = [
      { col: 'customDomain', sql: 'ALTER TABLE Store ADD COLUMN customDomain TEXT DEFAULT NULL' },
      { col: 'domainVerified', sql: 'ALTER TABLE Store ADD COLUMN domainVerified INTEGER DEFAULT 0' },
      { col: 'domainVerifiedAt', sql: 'ALTER TABLE Store ADD COLUMN domainVerifiedAt TEXT DEFAULT NULL' },
      { col: 'subscriptionExpiresAt', sql: 'ALTER TABLE Store ADD COLUMN subscriptionExpiresAt DATETIME' },
      { col: 'trialDays', sql: 'ALTER TABLE Store ADD COLUMN trialDays INTEGER DEFAULT 0' },
      { col: 'primaryColor', sql: "ALTER TABLE Store ADD COLUMN primaryColor TEXT NOT NULL DEFAULT '#171717'" },
      { col: 'secondaryColor', sql: "ALTER TABLE Store ADD COLUMN secondaryColor TEXT NOT NULL DEFAULT '#fafafa'" },
      { col: 'accentColor', sql: "ALTER TABLE Store ADD COLUMN accentColor TEXT NOT NULL DEFAULT '#171717'" },
      { col: 'fontFamily', sql: "ALTER TABLE Store ADD COLUMN fontFamily TEXT NOT NULL DEFAULT 'system-ui'" },
      { col: 'customCSS', sql: "ALTER TABLE Store ADD COLUMN customCSS TEXT NOT NULL DEFAULT ''" },
      { col: 'favicon', sql: "ALTER TABLE Store ADD COLUMN favicon TEXT NOT NULL DEFAULT ''" },
    ]

    for (const m of migrations) {
      if (!existing.has(m.col)) {
        missing.push(m.sql)
      }
    }

    if (missing.length === 0) {
      __schemaMigrated = true
      return
    }

    console.log(`[db] Migrating ${missing.length} missing Store columns...`)
    for (const sql of missing) {
      try { await db.$executeRawUnsafe(sql) } catch { /* ignore */ }
    }
    __schemaMigrated = true
    console.log('[db] Store schema migration completed')
  } catch (err) {
    console.warn('[db] Schema check failed (non-fatal):', err instanceof Error ? err.message : err)
  }
}

// Default export: synchronous local SQLite client
export const db = globalForPrisma.prisma ?? createLocalClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Async Turso client (lazy loaded, cached globally including serverless)
export async function getDb(): Promise<PrismaClient> {
  // If no Turso credentials, use local SQLite
  if (!hasTurso) return db

  // Return cached Turso client if available (global for serverless warm instances)
  const cachedTurso = (globalThis as any).__tursoDb as PrismaClient | undefined
  if (cachedTurso) return cachedTurso

  // Check if creation is already in progress
  const pendingPromise = (globalThis as any).__tursoPromise as Promise<PrismaClient> | undefined
  if (pendingPromise) return pendingPromise

  // Create Turso client (lazy, only once per instance)
  const promise = createTursoClient()
    .then(async client => {
      (globalThis as any).__tursoDb = client
      // Run schema migration in background (non-blocking for first request)
      ensureSchema(client).catch(() => {})
      return client
    })
    .catch(err => {
      console.error('[db] TURSO CONNECTION FAILED')
      console.error('[db] Error:', err instanceof Error ? err.message : err)
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Cannot connect to Turso database. ` +
          `Check TURSO_URL and DATABASE_AUTH_TOKEN in Vercel. ` +
          `Error: ${err instanceof Error ? err.message : String(err)}`
        )
      }
      return db
    })

  ;(globalThis as any).__tursoPromise = promise
  return promise
}

// Health check function - can be called from /api/health
export async function checkDbHealth(): Promise<{
  status: 'healthy' | 'error'
  mode: 'turso' | 'local'
  details: string
}> {
  try {
    const database = await getDb()
    // Try a simple query to verify the connection works
    const result = await database.$queryRaw<{ test: number }[]>`SELECT 1 as test`

    if (result && result.length > 0) {
      // Check if tables exist
      try {
        const tables = await database.$queryRaw<{ name: string }[]>`
          SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `
        const tableNames = tables.map(t => t.name)
        return {
          status: 'healthy',
          mode: hasTurso ? 'turso' : 'local',
          details: `Connection OK. Tables: ${tableNames.join(', ') || 'NONE (need to run init-db or prisma db push)'}`
        }
      } catch {
        return {
          status: 'healthy',
          mode: hasTurso ? 'turso' : 'local',
          details: 'Connection OK but could not list tables'
        }
      }
    }

    return { status: 'error', mode: hasTurso ? 'turso' : 'local', details: 'Query returned no results' }
  } catch (error) {
    return {
      status: 'error',
      mode: hasTurso ? 'turso' : 'local',
      details: `Connection failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
