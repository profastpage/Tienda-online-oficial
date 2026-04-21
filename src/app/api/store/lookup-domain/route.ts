import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { findStoreByCustomDomain } from '@/lib/store-helpers'

// Simple in-memory cache for domain lookups (middleware calls this frequently)
const domainCache = new Map<string, { slug: string; storeId: string; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hostname = searchParams.get('hostname')

    if (!hostname) {
      return NextResponse.json({ error: 'hostname is required' }, { status: 400 })
    }

    // Check cache first
    const cleanHost = hostname.toLowerCase().replace(/^www\./, '')
    const cached = domainCache.get(cleanHost)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ slug: cached.slug, storeId: cached.storeId, cached: true })
    }

    // Try with www prefix
    const wwwHost = `www.${cleanHost}`

    const db = await getDb()

    // Look up by both exact match and www-prefixed/non-www versions
    const store = await findStoreByCustomDomain(db, hostname)
      ?? await findStoreByCustomDomain(db, cleanHost)
      ?? await findStoreByCustomDomain(db, wwwHost)

    if (!store) {
      return NextResponse.json({ slug: null }, { status: 404 })
    }

    // Cache the result
    domainCache.set(cleanHost, { slug: store.slug, storeId: store.id, ts: Date.now() })
    domainCache.set(wwwHost, { slug: store.slug, storeId: store.id, ts: Date.now() })
    if (hostname !== cleanHost && hostname !== wwwHost) {
      domainCache.set(hostname, { slug: store.slug, storeId: store.id, ts: Date.now() })
    }

    return NextResponse.json({ slug: store.slug, storeId: store.id })
  } catch (error) {
    console.error('[store/lookup-domain]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
