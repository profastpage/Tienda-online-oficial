// ═══════════════════════════════════════════════════════════
// Payload Auth Bridge API Route
// Bridges existing auth system with Payload CMS
// POST: Syncs user and returns Payload credentials
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return auth.error

    const user = auth.user
    const { getPayloadHMR } = await import('@payloadcms/next/utilities')
    const payload = await getPayloadHMR({ configPath: 'payload.config.ts' })

    // Find or create Payload user
    const existing = await payload.find({
      collection: 'store-users',
      where: { email: { equals: user.email } },
      limit: 1,
    })

    let payloadUserId = existing.docs?.[0]?.id

    if (!payloadUserId) {
      const randomPassword = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const created = await payload.localAPI({
        url: '/api/store-users',
        method: 'POST',
        data: {
          email: user.email,
          password: randomPassword,
          name: user.name || user.email,
          storeId: user.storeId || '',
          storeName: user.storeName || '',
          role: user.role || 'admin',
        },
      })
      payloadUserId = created.id
    }

    return NextResponse.json({
      success: true,
      payloadUserId,
      storeId: user.storeId,
      email: user.email,
      role: user.role,
    })
  } catch (error: any) {
    console.error('[Payload Auth] Error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
