import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*"],
  images: {
    unoptimized: true,
  },
  // Don't bundle these packages with Turbopack - they need to load at runtime
  serverExternalPackages: ['@prisma/adapter-libsql', '@libsql/client'],
};

export default nextConfig;
