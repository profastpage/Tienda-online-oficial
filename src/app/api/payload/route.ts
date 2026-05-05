// ═══════════════════════════════════════════════════════════
// Payload CMS 3.0 API Route Handler
// Bridges existing auth → Payload CMS
// All /api/payload/* requests go through this handler
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api-auth'

let payloadInstance: any = null

async function getPayload() {
  if (payloadInstance) return payloadInstance
  const { getPayloadHMR } = await import('@payloadcms/next/utilities')
  payloadInstance = await getPayloadHMR({ configPath: 'payload.config.ts' })
  return payloadInstance
}

// Verify auth and get storeId
async function authenticate(req: NextRequest): Promise<{ authorized: boolean; storeId?: string; userId?: string; role?: string }> {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return { authorized: false }

    const user = await verifyAuth(token)
    if (!user) return { authorized: false }

    return {
      authorized: true,
      storeId: user.storeId,
      userId: user.id,
      role: user.role,
    }
  } catch {
    return { authorized: false }
  }
}

// Auto-filter queries by storeId (multi-tenant)
function applyStoreFilter(searchParams: URLSearchParams, storeId: string): void {
  const existingWhere = searchParams.get('where')
  if (existingWhere) {
    // Merge storeId filter with existing filters
    searchParams.set('where', JSON.stringify({
      and: [
        JSON.parse(existingWhere),
        { storeId: { equals: storeId } },
      ],
    }))
  } else {
    searchParams.set('where', JSON.stringify({ storeId: { equals: storeId } }))
  }
}

// Auto-filter by storeSlug for store-pages
function applyStorePageFilter(searchParams: URLSearchParams, storeId: string): void {
  const existingWhere = searchParams.get('where')
  if (existingWhere) {
    searchParams.set('where', JSON.stringify({
      and: [
        JSON.parse(existingWhere),
        { storeId: { equals: storeId } },
      ],
    }))
  } else {
    searchParams.set('where', JSON.stringify({ storeId: { equals: storeId } }))
  }
}

export async function GET(req: NextRequest) {
  const payload = await getPayload()
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''

  // Store content endpoints can be public (for storefront rendering)
  const isPublicEndpoint = path.includes('/api/store-pages') && !path.includes('/api/store-pages/') // list is public for store content

  // For collection queries, auto-filter by storeId
  const auth = await authenticate(req)

  if (!isPublicEndpoint && !auth.authorized) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // For collections that need multi-tenant filtering
    if (auth.storeId && (path.includes('/api/content-blocks') || path.includes('/api/store-pages'))) {
      if (path.includes('/api/content-blocks')) {
        applyStoreFilter(searchParams, auth.storeId)
      } else if (path.includes('/api/store-pages')) {
        applyStorePageFilter(searchParams, auth.storeId)
      }
    }

    // Build request options
    const reqOptions: any = { req }
    const where = searchParams.get('where')
    if (where) {
      try {
        reqOptions.where = JSON.parse(where)
        searchParams.delete('where')
      } catch { /* ignore */ }
    }

    // Copy remaining params
    const params: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        if (['limit', 'page', 'sort', 'depth'].includes(key)) {
          params[key] = isNaN(Number(value)) ? value : Number(value)
        } else {
          params[key] = value
        }
      }
    })

    const response = await payload.localAPI({
      url: path,
      ...params,
      ...reqOptions,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] GET error:', error.message)
    return Response.json({ error: error.message }, { status: error.status || 500 })
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

  // Auto-inject storeId for new records
  if (auth.storeId && !body.storeId) {
    body.storeId = auth.storeId
  }

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'POST',
      data: body,
      req,
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

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'PUT',
      data: body,
      req,
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

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'DELETE',
      req,
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

  try {
    const response = await payload.localAPI({
      url: path,
      method: 'PATCH',
      data: body,
      req,
    })
    return Response.json(response)
  } catch (error: any) {
    console.error('[Payload API] PATCH error:', error.message)
    return Response.json({ error: error.message }, { status: error.status || 500 })
  }
}
