import { NextResponse } from 'next/server'
import { getAuthUser, rateLimit, getClientIp, type JwtPayload } from './auth'
import { getDb } from './db'

/**
 * Require authentication for a route.
 * Returns the authenticated user payload or an error response.
 */
export async function requireAuth(request: Request): Promise<
  | { user: JwtPayload; error: null }
  | { user: null; error: NextResponse }
> {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }
  return { user, error: null }
}

/**
 * Require admin role.
 * Also allows super-admin to access admin routes.
 */
export async function requireAdmin(request: Request): Promise<
  | { user: JwtPayload; error: null }
  | { user: null; error: NextResponse }
> {
  const result = await requireAuth(request)
  if (result.error) return result

  if (result.user.role !== 'admin' && result.user.role !== 'super-admin') {
    return { user: null, error: NextResponse.json({ error: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 }) }
  }

  return result
}

/**
 * Require any authenticated user (any role: admin, customer, super-admin).
 * Does NOT check for admin role - just checks they're logged in.
 */
export async function requireStoreOwner(request: Request): Promise<
  | { user: JwtPayload; error: null }
  | { user: null; error: NextResponse }
> {
  const result = await requireAuth(request)
  return result
}

/**
 * Verify that a resource belongs to the authenticated user's store.
 * Uses requireAuth (not requireAdmin) so any authenticated user can access.
 * Super admins bypass store ownership checks.
 */
export async function verifyStoreOwnershipAny(
  request: Request,
  model: 'product' | 'category' | 'order' | 'paymentMethod',
  resourceId: string
): Promise<
  | { authorized: true; error: null }
  | { authorized: false; error: NextResponse }
> {
  const auth = await requireAuth(request)
  if (auth.error) return { authorized: false, error: auth.error }

  // Super admins can access any store's resources
  if (auth.user.role === 'super-admin') {
    return { authorized: true, error: null }
  }

  try {
    const db = await getDb()
    const resource = await (db[model] as any).findUnique({
      where: { id: resourceId },
      select: { storeId: true },
    })

    if (!resource) {
      return { authorized: false, error: NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 }) }
    }

    if (resource.storeId !== auth.user.storeId) {
      return { authorized: false, error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
    }

    return { authorized: true, error: null }
  } catch {
    return { authorized: false, error: NextResponse.json({ error: 'Error de verificación' }, { status: 500 }) }
  }
}

/**
 * Verify that a resource belongs to the authenticated user's store.
 * Used before PUT/DELETE operations.
 * Super admins bypass store ownership checks.
 */
export async function verifyStoreOwnership(
  request: Request,
  model: 'product' | 'category' | 'order' | 'paymentMethod',
  resourceId: string
): Promise<
  | { authorized: true; error: null }
  | { authorized: false; error: NextResponse }
> {
  const admin = await requireAdmin(request)
  if (admin.error) return { authorized: false, error: admin.error }

  // Super admins can access any store's resources
  if (admin.user.role === 'super-admin') {
    return { authorized: true, error: null }
  }

  try {
    const db = await getDb()
    const resource = await (db[model] as any).findUnique({
      where: { id: resourceId },
      select: { storeId: true },
    })

    if (!resource) {
      return { authorized: false, error: NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 }) }
    }

    if (resource.storeId !== admin.user.storeId) {
      return { authorized: false, error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
    }

    return { authorized: true, error: null }
  } catch {
    return { authorized: false, error: NextResponse.json({ error: 'Error de verificación' }, { status: 500 }) }
  }
}

/**
 * Verify that a user resource belongs to the authenticated user.
 * Used for customer profile/orders.
 */
export async function verifyUserOwnership(
  request: Request,
  userId: string
): Promise<
  | { authorized: true; error: null }
  | { authorized: false; error: NextResponse }
> {
  const auth = await requireAuth(request)
  if (auth.error) return { authorized: false, error: auth.error }

  if (auth.user.userId !== userId) {
    return { authorized: false, error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
  }

  return { authorized: true, error: null }
}

/**
 * Rate limit check for API routes (distributed via DB)
 */
export async function checkRateLimit(request: Request, max: number = 30, windowMs: number = 60000): Promise<boolean> {
  const ip = getClientIp(request)
  const key = `api:${ip}`
  return rateLimit(key, max, windowMs)
}
