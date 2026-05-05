// ═══════════════════════════════════════════════════════════
// Supabase Client - Database + Storage
// Used for Payload CMS media uploads and file management
// ═══════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables (set in Vercel / .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Singleton pattern for client-side Supabase
let browserClient: SupabaseClient | null = null

/**
 * Browser/client-side Supabase client (anon key, RLS applied)
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

/**
 * Server-side Supabase client (service role key, bypasses RLS)
 * Use only in API routes, server components, and Payload hooks
 */
export function getSupabaseAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// ═══ STORAGE HELPERS ═══

const MEDIA_BUCKET = 'store-media'

/**
 * Upload a file to Supabase Storage
 * @param file - File buffer or Blob
 * @param filePath - Path in bucket (e.g. "store-abc/product-1.jpg")
 * @param contentType - MIME type
 * @returns Public URL of uploaded file
 */
export async function uploadToSupabaseStorage(
  file: Buffer | Blob,
  filePath: string,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(filePath, file, {
      contentType,
      upsert: true,
      cacheControl: '31536000', // 1 year cache
    })

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`)
  }

  // Return public URL
  const { data: urlData } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabaseStorage(filePath: string): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([filePath])

  if (error) {
    console.error(`[Supabase] Delete failed: ${error.message}`)
  }
}

/**
 * Get public URL for a file in Supabase Storage
 */
export function getSupabasePublicUrl(filePath: string): string {
  if (!supabaseUrl) return ''
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${filePath}`
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey)
}

/**
 * Initialize Supabase storage buckets
 * Run this once to create required buckets
 */
export async function initSupabaseStorage(): Promise<void> {
  const supabase = getSupabaseAdminClient()

  // Create store-media bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets()
  const mediaBucket = buckets?.find(b => b.id === MEDIA_BUCKET)

  if (!mediaBucket) {
    const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB per file
      allowedMimeTypes: [
        'image/*',
        'video/mp4',
        'video/webm',
        'application/pdf',
      ],
    })

    if (error) {
      console.error(`[Supabase] Failed to create bucket "${MEDIA_BUCKET}":`, error.message)
    } else {
      console.log(`[Supabase] Created bucket "${MEDIA_BUCKET}"`)
    }
  }
}

export { MEDIA_BUCKET }
