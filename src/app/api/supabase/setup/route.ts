// ═══════════════════════════════════════════════════════════
// Supabase Setup API Route
// POST /api/supabase/setup
//
// Initializes Supabase storage buckets, verifies DB connection,
// and runs Payload schema migration to create tables
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.',
      }, { status: 400 })
    }

    const results: Record<string, any> = {}

    // 1. Test database connection
    if (dbUrl) {
      try {
        const { pg } = await import('pg')
        const pool = new pg.Pool({ connectionString: dbUrl })
        const client = await pool.connect()
        await client.query('SELECT 1 as test')
        client.release()
        await pool.end()
        results.database = { status: 'connected', type: 'Supabase PostgreSQL' }
      } catch (err: any) {
        results.database = { status: 'error', message: err.message }
      }
    } else {
      results.database = { status: 'not_configured', message: 'SUPABASE_DB_URL not set' }
    }

    // 2. Initialize Payload CMS and push schema (creates/updates all tables)
    if (dbUrl) {
      try {
        let payload: any = null
        try {
          const { getPayloadHMR } = await import('@payloadcms/next/utilities')
          payload = await getPayloadHMR({ configPath: 'payload.config.ts' })
        } catch {
          const config = (await import('../../../../payload.config')).default
          const { getPayload } = await import('payload')
          payload = await getPayload({ config })
        }

        // Push schema to create all tables (store_pages, content_blocks, media, store_users, etc.)
        await payload.db.schema.push({})
        results.payload = { status: 'connected', schema: 'pushed' }
        console.log('[Setup] Payload schema pushed successfully')
      } catch (err: any) {
        results.payload = { status: 'error', message: err.message }
        console.error('[Setup] Payload schema push failed:', err.message)
      }
    }

    // 3. Initialize Supabase Storage buckets
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data: buckets } = await supabase.storage.listBuckets()
      const mediaBucket = buckets?.find(b => b.id === 'store-media')

      if (!mediaBucket) {
        const { error } = await supabase.storage.createBucket('store-media', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024,
          allowedMimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
        })
        results.storage = error
          ? { status: 'error', message: error.message }
          : { status: 'created', bucket: 'store-media' }
      } else {
        results.storage = { status: 'exists', bucket: 'store-media', public: mediaBucket.public }
      }

      const folders = ['default/general', 'default/products', 'default/banners', 'default/heroes']
      for (const folder of folders) {
        await supabase.storage
          .from('store-media')
          .upload(`${folder}/.keep`, new Blob([''], { type: 'text/plain' }), { upsert: true })
      }
      results.storage.folders = folders.length + ' folders created'
    } catch (err: any) {
      results.storage = { status: 'error', message: err.message }
    }

    const allSuccess = results.database?.status === 'connected' &&
      results.payload?.status !== 'error' &&
      results.storage?.status !== 'error'

    return NextResponse.json({
      success: allSuccess,
      timestamp: new Date().toISOString(),
      ...results,
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 })
  }
}
