import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if Turso credentials are available
const hasTurso = Boolean(process.env.TURSO_URL && process.env.DATABASE_AUTH_TOKEN)

// Create default client
function createLocalClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

// Create Turso client
async function createTursoClient(): Promise<PrismaClient> {
  const { PrismaLibSQL } = await import('@prisma/adapter-libsql')
  
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  })

  return new PrismaClient({ adapter })
}

// Default export: synchronous local SQLite client
export const db = globalForPrisma.prisma ?? createLocalClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Async Turso client (lazy loaded)
let _tursoDb: PrismaClient | null = null
let _tursoPromise: Promise<PrismaClient> | null = null

export async function getDb(): Promise<PrismaClient> {
  if (!hasTurso) return db
  
  if (_tursoDb) return _tursoDb
  
  if (!_tursoPromise) {
    _tursoPromise = createTursoClient().then(client => {
      _tursoDb = client
      return client
    }).catch(err => {
      console.error('[db] Turso connection failed, using local:', err)
      return db
    })
  }
  
  return _tursoPromise
}
