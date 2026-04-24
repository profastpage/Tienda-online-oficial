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

    console.log('[db] Turso connection established successfully')
    return client
  } catch (error) {
    console.error('[db] Turso connection failed:', error instanceof Error ? error.message : error)
    console.error('[db] TURSO_URL set:', Boolean(process.env.TURSO_URL))
    console.error('[db] DATABASE_AUTH_TOKEN set:', Boolean(process.env.DATABASE_AUTH_TOKEN))
    throw error
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
    .then(client => {
      (globalThis as any).__tursoDb = client
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
