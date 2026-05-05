import type { NextConfig } from "next";
import path from "path";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // framer-motion v12 type defs incompatible
  },
  reactStrictMode: true,
  allowedDevOrigins: process.env.NODE_ENV === 'development'
    ? ["http://localhost:3000", "http://127.0.0.1:3000"]
    : [],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      // Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  serverExternalPackages: [
    '@prisma/adapter-libsql',
    '@libsql/client',
    'z-ai-web-dev-sdk',
    // Payload CMS - server-only packages
    'payload',
    '@payloadcms/db-postgres',
    '@payloadcms/storage-s3',
    '@supabase/supabase-js',
    'pg',
  ],
  async headers() {
    return [
      {
        source: '/:slug*/visual-editor',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOW-FROM *' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
};

// Wrap with Payload CMS to enable getPayloadHMR / getPayload resolution
export default withPayload(nextConfig);
