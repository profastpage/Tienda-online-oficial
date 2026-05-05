// ═══════════════════════════════════════════════════════════
// Payload CMS 3.0 API Route Handler
// Bridges existing auth → Payload CMS
// All /api/payload/* requests go through this handler
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

let payloadInstance: any = null

async function getPayload() {
  if (payloadInstance) return payloadInstance

  // Strategy 1: Try getPayloadHMR (works when next.config.ts is wrapped with payload())
  try {
    const { getPayloadHMR } = await import('@payloadcms/next/utilities')
    payloadInstance = await getPayloadHMR({ configPath: 'payload.config.ts' })
    if (payloadInstance) {
      console.log('[Payload API] Initialized via getPayloadHMR')
      return payloadInstance
    }
  } catch (err) {
    console.warn('[Payload API] getPayloadHMR failed, trying direct import:', (err as Error).message)
  }

  // Strategy 2: Direct config import (fallback for edge cases)
  try {
    const config = (await import('../../../../payload.config')).default
    const { getPayload } = await import('payload')
    payloadInstance = await getPayload({ config })
    if (payloadInstance) {
      console.log('[Payload API] Initialized via direct config import')
      return payloadInstance
    }
  } catch (err) {
    console.error('[Payload API] Direct import also failed:', (err as Error).message)
  }

  throw new Error('[Payload API] Could not initialize Payload CMS. Ensure payload.config.ts is valid and database is reachable.')
}

// Verify auth and get storeId
async function authenticate(req: NextRequest): Promise<{ authorized: boolean; storeId?: string; userId?: string; role?: string }> {
  try {
    const result = await requireAuth(req)
    if (result.error) return { authorized: false }

    return {
      authorized: true,
      storeId: result.user.storeId,
      userId: result.user.userId,
      role: result.user.role,
    }
  } catch {
    return { authorized: false }
  }
}

// Parse bracket-notation where params from URL into a nested object
// e.g. where[storeSlug][equals]=urban-style → { storeSlug: { equals: 'urban-style' } }
function parseBracketWhereParams(searchParams: URLSearchParams): Record<string, any> | null {
  const where: Record<string, any> = {}
  let found = false

  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('where[')) continue
    // Match patterns like: where[field][operator] or where[field]
    const match = key.match(/^where\[([^\]]+)\](?:\[([^\]]+)\])?$/)
    if (match) {
      found = true
      const [, field, operator] = match
      if (operator) {
        // where[field][operator] = value
        if (!where[field]) where[field] = {}
        where[field][operator] = isNaN(Number(value)) ? value : Number(value)
      } else {
        // where[field] = value
        where[field] = isNaN(Number(value)) ? value : Number(value)
      }
    }
  }

  return found ? where : null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''

  // Store content endpoints can be public (for storefront rendering)
  const isPublicEndpoint = path.includes('/api/store-pages') || path.includes('/api/content-blocks')

  const auth = await authenticate(req)

  if (!isPublicEndpoint && !auth.authorized) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const payload = await getPayload()

    // Build where clause from bracket-notation URL params
    let whereClause: Record<string, any> = {}

    // First, parse bracket notation: where[storeSlug][equals]=...
    const bracketWhere = parseBracketWhereParams(searchParams)
    if (bracketWhere) {
      Object.assign(whereClause, bracketWhere)
    }

    // Then, check for JSON where param (legacy support)
    const jsonWhere = searchParams.get('where')
    if (jsonWhere) {
      try {
        const parsed = JSON.parse(jsonWhere)
        Object.assign(whereClause, parsed)
      } catch { /* ignore malformed JSON */ }
    }

    // For multi-tenant: inject storeId filter for authenticated users
    if (auth.authorized && auth.storeId && (path.includes('/api/content-blocks') || path.includes('/api/store-pages'))) {
      whereClause.storeId = { equals: auth.storeId }
    }

    // Build query params
    const params: Record<string, any> = {}
    if (Object.keys(whereClause).length > 0) {
      params.where = whereClause
    }

    searchParams.forEach((value, key) => {
      if (key === 'path' || key.startsWith('where[') || key === 'where') return
      if (['limit', 'page', 'sort', 'depth'].includes(key)) {
        params[key] = isNaN(Number(value)) ? value : Number(value)
      } else {
        params[key] = value
      }
    })

    // Use a Payload-like request context with user info for access control
    const payloadReq: any = { user: auth.authorized ? { id: auth.userId, storeId: auth.storeId, role: auth.role } : null }

    const response = await payload.localAPI({
      url: path,
      ...params,
      req: payloadReq,
      fallbackErrorHandler: true,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] GET error:', error?.message || error)

    // Provide user-friendly error messages
    let message = 'Error interno del servidor'
    let status = 500

    if (error?.message?.includes('does not exist') || error?.message?.includes('relation')) {
      message = 'Las tablas de la base de datos no existen. El sistema las creará automáticamente en el próximo intento.'
      status = 503
    } else if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes('connect')) {
      message = 'No se pudo conectar a la base de datos. Verifica las variables de entorno SUPABASE_DB_URL.'
      status = 503
    } else if (error?.message?.includes('authentication') || error?.message?.includes('auth')) {
      message = 'Error de autenticación con la base de datos.'
      status = 401
    } else if (error?.message) {
      message = error.message
    }

    return Response.json({ error: message, details: error?.message }, { status })
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth.authorized) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = await getPayload()
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''
  const body = await req.json()

  if (auth.storeId && !body.storeId) {
    body.storeId = auth.storeId
  }

  const payloadReq: any = { user: { id: auth.userId, storeId: auth.storeId, role: auth.role } }

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'POST',
      data: body,
      req: payloadReq,
      fallbackErrorHandler: true,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] POST error:', error.message)
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth.authorized) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = await getPayload()
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''
  const body = await req.json()

  const payloadReq: any = { user: { id: auth.userId, storeId: auth.storeId, role: auth.role } }

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'PUT',
      data: body,
      req: payloadReq,
      fallbackErrorHandler: true,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] PUT error:', error.message)
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth.authorized) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = await getPayload()
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''

  const payloadReq: any = { user: { id: auth.userId, storeId: auth.storeId, role: auth.role } }

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'DELETE',
      req: payloadReq,
      fallbackErrorHandler: true,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] DELETE error:', error.message)
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth.authorized) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = await getPayload()
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''
  const body = await req.json()

  const payloadReq: any = { user: { id: auth.userId, storeId: auth.storeId, role: auth.role } }

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'PATCH',
      data: body,
      req: payloadReq,
      fallbackErrorHandler: true,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] PATCH error:', error.message)
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}
