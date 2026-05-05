import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter for middleware
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

// Custom domain → slug cache (avoid calling lookup API on every request)
const customDomainCache = new Map<string, { slug: string; ts: number }>()
const DOMAIN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Known app domains that should NOT be treated as custom domains
const APP_DOMAINS = [
  process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : null,
  'localhost',
  'tiendaonlineoficial.com',
  'www.tiendaonlineoficial.com',
].filter(Boolean) as string[]

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

// Check if path matches /:slug/editordetienda pattern
function isEditorDeTiendaPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 2 && segments[1] === 'editordetienda'
}

// Check if path matches /:slug/visual-editor pattern
function isVisualEditorPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 2 && segments[1] === 'visual-editor'
}

// Routes that should be public (no auth required)
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
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
  '/api/payload',
  '/api/payments/mercadopago/webhook',
  '/api/payments/mercadopago/success',
  '/api/payments/mercadopago/failure',
  '/api/payments/mercadopago/pending',
  '/api/seed-sync',
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host')?.split(':')[0] || '' // strip port

  // ═══ CUSTOM DOMAIN HANDLING ═══
  // If the hostname is NOT a known app domain, check if it's a custom domain
  if (hostname && !APP_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))) {
    // Check in-memory cache first
    const cached = customDomainCache.get(hostname)
    if (cached && Date.now() - cached.ts < DOMAIN_CACHE_TTL) {
      const url = request.nextUrl.clone()
      url.pathname = `/${cached.slug}${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }

    // Look up the domain via internal API
    try {
      const lookupUrl = new URL('/api/store/lookup-domain', request.url)
      lookupUrl.searchParams.set('hostname', hostname)
      const res = await fetch(lookupUrl.toString(), {
        headers: { 'x-internal': '1' },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.slug) {
          customDomainCache.set(hostname, { slug: data.slug, ts: Date.now() })
          const url = request.nextUrl.clone()
          url.pathname = `/${data.slug}${pathname === '/' ? '' : pathname}`
          return NextResponse.rewrite(url)
        }
      }
    } catch {
      // Lookup failed, fall through to normal handling
    }
  }

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

  // Super admin page protection — accept both auth-token and super-admin-token
  if (pathname.startsWith('/super-admin')) {
    const authToken = request.cookies.get('auth-token')?.value
    const superAdminToken = request.cookies.get('super-admin-token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const anyToken = bearerToken || authToken || superAdminToken

    if (!anyToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Protect /[slug]/editordetienda and /[slug]/visual-editor pages — require authentication
  if (isEditorDeTiendaPath(pathname) || isVisualEditorPath(pathname)) {
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
  if (pathname.startsWith('/api/super-admin')) {
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
  if (pathname.startsWith('/api/customer/') && pathname !== '/api/customer/checkout' && pathname !== '/api/customer/profile') {
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
  matcher: [
    '/:path*',  // Match all paths for custom domain support + existing route protection
  ],
}
