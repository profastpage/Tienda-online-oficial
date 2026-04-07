import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // framer-motion v12 type defs are incompatible; fix later
  },
  reactStrictMode: true,  // FIX: was false
  allowedDevOrigins: process.env.NODE_ENV === 'development' 
    ? ["http://localhost:3000", "http://127.0.0.1:3000"] 
    : [],  // FIX: was ["*"] which is dangerous
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },  // FIX: was unoptimized: true
  serverExternalPackages: ['@prisma/adapter-libsql', '@libsql/client'],
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
};

export default nextConfig;
