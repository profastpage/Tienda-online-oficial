import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TODO: framer-motion v12 type defs incompatible
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
    ],
  },
  serverExternalPackages: [
    '@prisma/adapter-libsql',
    '@libsql/client',
    'z-ai-web-dev-sdk',
    // Payload CMS dependencies that need to be externalized
    'payload',
    '@payloadcms/db-sqlite',
    '@payloadcms/db-postgres',
    'better-sqlite3',
  ],
  // Payload CMS 3.0 integration
  experimental: {
    turbo: {
      // Only include Payload CMS in server bundles
      rules: {
        '@payloadcms/db-sqlite': {
          loaders: ['default'],
        },
      },
    },
  },
  async headers() {
    return [
      {
        // Allow framing for visual editor iframe, deny for everything else
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

export default nextConfig;
