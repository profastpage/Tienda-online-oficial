import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { StorePages } from './src/payload/collections/StorePages'
import { ContentBlocks } from './src/payload/collections/ContentBlocks'
import { Media } from './src/payload/collections/Media'

// ═══════════════════════════════════════════════════════════
// Payload CMS 3.0 Configuration
// Multi-tenant Visual Inline Editing System
// ═══════════════════════════════════════════════════════════

const appURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default buildConfig({
  // Use Postgres in production (Vercel), SQLite for local dev
  db: process.env.PAYLOAD_DATABASE_URI
    ? postgresAdapter({
        pool: {
          connectionString: process.env.PAYLOAD_DATABASE_URI!,
        },
      })
    : sqliteAdapter({
        client: {
          url: path.resolve(process.cwd(), 'payload-data.db'),
        },
      }),

  // Collections (no auth collection - using external auth bridge)
  collections: [StorePages, ContentBlocks, Media],

  // Globals
  globals: [],

  // Admin panel configuration
  admin: {
    css: path.join(__dirname, 'src/payload/admin.css'),
    meta: {
      titleSuffix: ' · CMS Visual',
      description: 'Editor visual de tiendas - Payload CMS 3.0',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.ico',
        },
      ],
    },
    // No built-in auth - we use external auth bridge
    // The admin panel is accessed via the Visual Editor
  },

  // Live preview breakpoints
  livePreview: {
    breakpoints: [
      { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
      { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
      { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
    ],
  },

  // Secret for Payload JWT tokens
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-in-production-abc123',

  // TypeScript
  typescript: {
    outputFile: path.resolve(__dirname, 'src/payload-types.ts'),
  },

  // Localization
  localization: {
    locales: [
      { code: 'es', label: 'Español' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'es',
    fallback: true,
  },

  // CORS - allow all origins for the visual editor iframe
  cors: [appURL, '*'],

  // CSRF
  csrf: [appURL],

  // Default collection access (public - auth handled by API route)
  defaults: {
    access: {
      read: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
    },
  },
})
