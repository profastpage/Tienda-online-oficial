import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tienda-online-oficial-jwt-secret-change-in-production-2024'
)

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
    .sign(JWT_SECRET)
}

// Verify and decode a JWT token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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

// Extract JWT from Authorization header
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

// Rate limiter (in-memory, simple)
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(ip: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimiter.get(ip)

  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) return false

  record.count++
  return true
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
export async function getAuthUser(request: Request): Promise<JwtPayload | null> {
  const token = extractToken(request)
  if (!token) return null
  return verifyToken(token)
}
