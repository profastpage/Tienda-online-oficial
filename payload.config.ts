import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { StorePages } from './src/payload/collections/StorePages'
import { ContentBlocks } from './src/payload/collections/ContentBlocks'
import { Media } from './src/payload/collections/Media'
import { StoreUsers } from './src/payload/collections/StoreUsers'

// ═══════════════════════════════════════════════════════════
// Payload CMS 3.0 Configuration
// Multi-tenant Visual Inline Editing System
// Database: PostgreSQL on Supabase
// Storage: Supabase Storage (S3-compatible)
// ═══════════════════════════════════════════════════════════

const MEDIA_BUCKET = 'store-media'

const appURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Supabase PostgreSQL connection
// Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || ''

// Supabase Storage (S3-compatible) credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default buildConfig({
  // ─── DATABASE: Supabase PostgreSQL ───
  db: postgresAdapter({
    // Auto-create tables on first connection (no manual migration needed)
    migrationDir: path.resolve(__dirname, 'src/payload/migrations'),
    // Ensure schema exists on startup
    ...(SUPABASE_DB_URL ? {
      push: false,
    } : {}),
    pool: {
      connectionString: SUPABASE_DB_URL || 'postgresql://postgres:postgres@localhost:5432/payload',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
    ...(SUPABASE_DB_URL ? {
      ssl: { rejectUnauthorized: false },
    } : {}),
  }),

  // ─── COLLECTIONS ───
  collections: [StoreUsers, StorePages, ContentBlocks, Media],

  // ─── PLUGINS (loaded dynamically to avoid build-time errors) ───
  plugins: [],

  // ─── ADMIN PANEL ───
  admin: {
    css: path.join(__dirname, 'src/payload/admin.css'),
    meta: {
      titleSuffix: ' - CMS Visual',
      description: 'Editor visual de tiendas - Payload CMS 3.0',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.ico',
        },
      ],
    },
  },

  // ─── LIVE PREVIEW ───
  livePreview: {
    breakpoints: [
      { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
      { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
      { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
    ],
  },

  // ─── SECURITY ───
  secret: process.env.PAYLOAD_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production-abc123',

  // ─── TYPESCRIPT ───
  typescript: {
    outputFile: path.resolve(__dirname, 'src/payload-types.ts'),
  },

  // ─── LOCALIZATION ───
  localization: {
    locales: [
      { code: 'es', label: 'Espanol' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'es',
    fallback: true,
  },

  // ─── CORS & CSRF ───
  cors: [appURL, '*'],
  csrf: [appURL],

  // ─── DEFAULT ACCESS (public - auth handled at API route level) ───
  defaults: {
    access: {
      read: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
    },
  },

  // ─── ON INIT: auto-migrate + register S3 storage + init Supabase buckets ───
  onInit: async (payload) => {
    // Auto-push schema to database (creates/updates tables as needed)
    if (SUPABASE_DB_URL) {
      try {
        await payload.db.schema.push({})
        console.log('[Payload] Database schema pushed successfully')
      } catch (err) {
        console.warn('[Payload] Schema push failed (tables may already exist):', (err as Error).message)
      }
    }

    // Dynamically load S3 storage plugin when Supabase is configured
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { s3Storage } = await import('@payloadcms/storage-s3')
        // Register the S3 plugin at runtime
        payload.addPlugin({
          name: 'supabase-storage',
          ...s3Storage({
            collections: {
              media: {
                prefix: 'media',
                generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
                  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${prefix || 'media'}/${filename}`
                },
              },
            },
            bucket: MEDIA_BUCKET,
            config: {
              endpoint: `${SUPABASE_URL.replace('https://', '')}/storage/v1/s3`,
              credentials: {
                accessKeyId: SUPABASE_SERVICE_ROLE_KEY,
                secretAccessKey: SUPABASE_SERVICE_ROLE_KEY,
              },
              region: 'auto',
              forcePathStyle: true,
            },
          }),
        })
        console.log('[Payload] Supabase S3 Storage plugin registered')
      } catch (err) {
        console.warn('[Payload] S3 Storage plugin not loaded:', (err as Error).message)
      }

      // Initialize storage buckets
      try {
        const { initSupabaseStorage } = await import('./src/lib/supabase')
        await initSupabaseStorage()
      } catch (err) {
        console.warn('[Payload] Supabase Storage init skipped:', (err as Error).message)
      }
    }

    console.log('[Payload] CMS initialized')
    console.log(`[Payload] DB: ${SUPABASE_DB_URL ? 'Supabase PostgreSQL' : 'Local PostgreSQL'}`)
    console.log(`[Payload] Schema auto-migrate: ${SUPABASE_DB_URL ? 'enabled' : 'disabled'}`)
  },
})
