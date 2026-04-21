import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it in Vercel dashboard or .env.local')
  }
  return new TextEncoder().encode(secret)
}

// Token expiration: 7 days
const JWT_EXPIRATION = '7d'

export interface JwtPayload {
  userId: string
  email: string
  role: string
  storeId: string
}

// Sign a JWT token
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRATION)
    .setIssuedAt()
    .sign(getJwtSecret())
}

// Verify and decode a JWT token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      storeId: payload.storeId as string,
    }
  } catch {
    return null
  }
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Extract JWT from Authorization header or cookies
export function extractToken(request: Request): string | null {
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)

  // Also check cookies for SSR
  const cookie = request.headers.get('cookie')
  if (cookie) {
    const match = cookie.match(/auth-token=([^;]+)/)
    if (match) return match[1]
  }

  return null
}

// Create an authenticated API response helper
export function authError(message: string = 'No autenticado', status: number = 401) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Distributed rate limiter using the database.
 * Works across serverless invocations (unlike in-memory Map).
 * Uses a sliding window approach.
 *
 * @param key - Unique identifier (e.g. "chat:1.2.3.4", "login:1.2.3.4")
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Window size in milliseconds (default: 60000 = 1 min)
 * @returns true if request is allowed, false if rate limited
 */
export async function rateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): Promise<boolean> {
  try {
    const db = await getDb()
    const now = new Date()
    const windowEnd = new Date(now.getTime() + windowMs)

    // Try to find existing record
    let record = await db.rateLimit.findUnique({
      where: { key },
    })

    // No record or window expired — create new
    if (!record || now > record.windowEnd) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowEnd },
        update: { count: 1, windowEnd },
      })
      return true
    }

    // Window still active
    if (record.count >= maxRequests) {
      return false
    }

    // Increment counter
    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })
    return true
  } catch (error) {
    // If DB is unavailable, fail open (allow request) but log
    console.error('[rateLimit] DB error, allowing request:', error)
    return true
  }
}

// Get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

// Authenticated user check - returns user payload or null
// Supports both auth-token (JWT) and super-admin-token (secret) cookies
export async function getAuthUser(request: Request): Promise<JwtPayload | null> {
  // Try JWT from header or auth-token cookie first
  const token = extractToken(request)
  if (token) {
    const payload = await verifyToken(token)
    if (payload) return payload
  }

  // Fallback: check super-admin-token cookie (for super admin panel)
  const cookie = request.headers.get('cookie')
  if (cookie) {
    const matchSA = cookie.match(/super-admin-token=([^;]+)/)
    if (matchSA && matchSA[1] === process.env.SUPER_ADMIN_SECRET) {
      return {
        userId: 'super-admin-001',
        email: process.env.SUPER_ADMIN_EMAIL || 'super-admin',
        role: 'super-admin',
        storeId: '__super_admin__',
      }
    }
  }

  return null
}
