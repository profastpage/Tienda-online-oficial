import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter for middleware
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, max: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimiter.get(ip)

  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= max) return false
  record.count++
  return true
}

// Routes that should be public (no auth required)
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/google',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/error',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/signout',
  '/api/auth/check',
  '/api/products',
  '/api/categories',
  '/api/testimonials',
  '/api/store/payment-methods',
  '/api/store/info',
  '/api/leads',
  '/api/customer/checkout',
  '/api/upload',
  '/api/chat',
  '/api/route',
  '/api/payments/mercadopago/webhook',
  '/api/payments/mercadopago/success',
  '/api/payments/mercadopago/failure',
  '/api/payments/mercadopago/pending',
]

// Paths that require admin role
const ADMIN_PATHS = [
  '/api/admin/',
]

// Paths that require super-admin
const SUPER_ADMIN_PATHS = [
  '/api/super-admin',
  '/api/init-db',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ═══ Protect authenticated PAGE routes ═══
  // Redirect to login if no auth token present
  if (pathname.startsWith('/admin') || pathname.startsWith('/cliente')) {
    const cookieToken = request.cookies.get('auth-token')?.value
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const jwtToken = token || cookieToken

    if (!jwtToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Super admin page is now protected — requires auth-token from main login
  if (pathname.startsWith('/super-admin')) {
    const cookieToken = request.cookies.get('auth-token')?.value
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const jwtToken = token || cookieToken

    if (!jwtToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Allow auth callback pages (Google OAuth)
  if (pathname.startsWith('/auth/google-callback')) {
    return NextResponse.next()
  }

  // ═══ API route protection ═══
  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public routes
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    // Rate limit login and register more strictly
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                  request.headers.get('x-real-ip') || 'unknown'

      if (!checkRateLimit(ip, 10, 60000)) { // 10 requests per minute for auth
        return NextResponse.json(
          { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
          { status: 429 }
        )
      }
    }
    return NextResponse.next()
  }

  // Protect notify, auth-status, migrate-db (removed from PUBLIC_PATHS)
  // Auth is handled by each route handler itself, but middleware blocks unauthenticated requests
  if (
    pathname.startsWith('/api/notify') ||
    pathname.startsWith('/api/auth-status') ||
    pathname.startsWith('/api/migrate-db')
  ) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const cookieToken = request.cookies.get('auth-token')?.value
    const jwtToken = token || cookieToken

    if (!jwtToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protect init-db with secret
  if (pathname.startsWith('/api/init-db')) {
    const authHeader = request.headers.get('authorization')
    const secret = authHeader?.replace('Bearer ', '')
    if (secret !== process.env.INIT_DB_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Super-admin API auth is handled by the route handler itself (JWT + secret)
  // Do NOT block here — middleware edge runtime may not read cookies correctly
  if (pathname.startsWith('/api/super-admin/auth')) {
    return NextResponse.next()
  }

  // Protect admin routes - require JWT token
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const cookieToken = request.cookies.get('auth-token')?.value
    const jwtToken = token || cookieToken

    if (!jwtToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // We can't use jose in edge middleware easily, so just check token exists
    // The actual verification happens in each route handler
    return NextResponse.next()
  }

  // Protect customer routes
  if (pathname.startsWith('/api/customer/') && pathname !== '/api/customer/checkout') {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const cookieToken = request.cookies.get('auth-token')?.value
    const jwtToken = token || cookieToken

    if (!jwtToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/cliente/:path*', '/super-admin/:path*'],
}
