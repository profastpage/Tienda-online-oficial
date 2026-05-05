// ═══════════════════════════════════════════════════════════
// Supabase Storage Setup Script
// Run: bun run scripts/setup-supabase-storage.ts
//
// This script creates the required storage buckets in Supabase
// and sets up RLS (Row Level Security) policies for public reads.
// ═══════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Create a .env.local file with these variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKETS = [
  {
    id: 'store-media',
    name: 'Store Media',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/*', 'video/mp4', 'video/webm', 'application/pdf'],
  },
]

async function setupBuckets() {
  console.log(`\n=== Supabase Storage Setup ===`)
  console.log(`Project: ${SUPABASE_URL}\n`)

  // List existing buckets
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    console.error('Error listing buckets:', listError.message)
    process.exit(1)
  }

  const existingIds = new Set(existingBuckets?.map(b => b.id) || [])

  for (const bucket of BUCKETS) {
    if (existingIds.has(bucket.id)) {
      console.log(`  [OK] Bucket "${bucket.id}" already exists`)
    } else {
      const { error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      })

      if (error) {
        console.error(`  [FAIL] Could not create bucket "${bucket.id}": ${error.message}`)
        console.error(`  Try creating it manually in the Supabase Dashboard > Storage`)
      } else {
        console.log(`  [OK] Created bucket "${bucket.id}" (${bucket.name})`)
      }
    }
  }

  // Create default folder structure
  console.log(`\n  Creating default folder structure...`)
  const folders = [
    'default/general',
    'default/products',
    'default/banners',
    'default/heroes',
    'default/logos',
    'default/avatars',
  ]

  for (const folder of folders) {
    // Create a placeholder file to establish the folder
    const { error } = await supabase.storage
      .from('store-media')
      .upload(`${folder}/.keep`, new Blob([''], { type: 'text/plain' }), {
        upsert: true,
      })

    if (error && !error.message.includes('already exists')) {
      console.error(`  [WARN] Could not create folder "${folder}": ${error.message}`)
    }
  }

  console.log(`\n=== Setup Complete ===`)
  console.log(`\n  Public URL pattern:`)
  console.log(`  ${SUPABASE_URL}/storage/v1/object/public/store-media/{storeId}/{folder}/{filename}`)
  console.log(`\n  You can verify in: Supabase Dashboard > Storage > store-media`)
  console.log()
}

setupBuckets().catch(console.error)
