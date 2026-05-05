// ═══════════════════════════════════════════════════════════
// Payload Auth Bridge API Route
// Bridges existing auth system with Payload CMS
// POST: Syncs user and returns Payload credentials
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api-auth'
import { getPayloadHMR } from '@payloadcms/next/utilities'

export async function POST(req: NextRequest) {
  try {
    // Verify existing auth
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await verifyAuth(token)
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const payload = await getPayloadHMR({ configPath: 'payload.config.ts' })

    // Find or create Payload user
    const existing = await payload.find({
      collection: 'store-users',
      where: { email: { equals: user.email } },
      limit: 1,
    })

    let payloadUserId = existing.docs?.[0]?.id

    if (!payloadUserId) {
      // Create Payload user (sync from existing auth)
      const randomPassword = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const created = await payload.localAPI({
        url: '/api/store-users',
        method: 'POST',
        data: {
          email: user.email,
          password: randomPassword,
          name: user.name,
          storeId: user.storeId || '',
          storeName: user.storeName || '',
          role: user.role,
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
