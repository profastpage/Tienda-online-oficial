import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createHash } from 'crypto'

/**
 * Robust env var reader that supports both underscore and dash variants.
 * Vercel UI sometimes auto-replaces underscores with dashes in env var names.
 */
function getEnvVar(underscoreName: string, dashName: string): string {
  if (process.env[underscoreName]) return process.env[underscoreName]!
  if (process.env[dashName]) return process.env[dashName]!
  for (const [key, value] of Object.entries(process.env)) {
    if (value && key.replace(/[-_]/g, '').toLowerCase() === underscoreName.replace(/_/g, '').toLowerCase()) {
      return value
    }
  }
  return ''
}

const clientId = getEnvVar('GOOGLE_CLIENT_ID', 'GOOGLE-CLIENT-ID')
const clientSecret = getEnvVar('GOOGLE_CLIENT_SECRET', 'GOOGLE-CLIENT-SECRET')
const hasCredentials = Boolean(clientId && clientSecret && !clientId.startsWith('your-'))

// NEXTAUTH_URL: CRITICAL for production OAuth redirects
// Must be set explicitly for Vercel deployments
const VERCEL_URL = process.env.VERCEL_URL || ''
const explicitUrl = process.env.NEXTAUTH_URL || ''

// Build the NEXTAUTH_URL - this is required for Google OAuth to work
let nextauthUrl: string | undefined

if (explicitUrl) {
  nextauthUrl = explicitUrl
} else if (VERCEL_URL) {
  // Vercel provides this without protocol
  nextauthUrl = `https://${VERCEL_URL}`
}
// In production, always require a URL
if (!nextauthUrl && process.env.NODE_ENV === 'production') {
  // Fallback to known domain
  nextauthUrl = 'https://tienda-online-oficial.vercel.app'
  console.warn('[nextauth] NEXTAUTH_URL not set, using fallback:', nextauthUrl)
}

// Stable NEXTAUTH_SECRET - required for JWT signing
const nextauthSecret = process.env.NEXTAUTH_SECRET || createHash('sha256')
  .update('tienda-online-oficial-nextauth-production-secret-2024')
  .digest('hex')

console.log(`[nextauth] Google OAuth credentials: ${hasCredentials ? 'FOUND' : 'MISSING'}`)
console.log(`[nextauth] Client ID: ${clientId ? clientId.substring(0, 10) + '...' : '(empty)'}`)
console.log(`[nextauth] NEXTAUTH_URL: ${nextauthUrl || 'auto'}`)
console.log(`[nextauth] NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'FALLBACK'}`)

export const authOptions: NextAuthOptions = {
  providers: hasCredentials
    ? [
        GoogleProvider({
          clientId,
          clientSecret,
          authorization: {
            params: {
              prompt: 'select_account',
              access_type: 'offline',
            },
          },
        }),
      ]
    : [],
  secret: nextauthSecret,
  ...(nextauthUrl ? { url: nextauthUrl } : {}),
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (!hasCredentials) {
        console.error('[nextauth] Google OAuth credentials not configured')
        return false
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Pass through our custom callback URLs
      if (url.includes('/auth/google-callback')) {
        return url
      }
      // After Google callback, redirect to our handler
      if (url.includes('/api/auth/callback/google')) {
        return `${baseUrl}/auth/google-callback?action=login`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.googleId = account.providerAccountId
        token.email = profile.email
        token.name = profile.name
        token.picture = profile.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as Record<string, unknown>).googleId = token.googleId
        ;(session.user as Record<string, unknown>).image = token.picture
      }
      return session
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 60, // 30 minutes
  },
  // Do NOT override cookies - let NextAuth v4 handle production cookies automatically
}
