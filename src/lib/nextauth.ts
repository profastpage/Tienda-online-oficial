import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createHash } from 'crypto'

/**
 * Robust env var reader that supports both underscore and dash variants.
 * Vercel UI sometimes auto-replaces underscores with dashes in env var names.
 */
function getEnvVar(underscoreName: string, dashName: string): string {
  // Try exact underscore name first (standard)
  if (process.env[underscoreName]) return process.env[underscoreName]!
  // Try dash variant (Vercel sometimes uses this)
  if (process.env[dashName]) return process.env[dashName]!
  // Scan all env vars as last resort (handles any casing/separator issues)
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

// Infer NEXTAUTH_URL from Vercel environment or use explicit value
const nextauthUrl = process.env.NEXTAUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

// Fallback NEXTAUTH_SECRET if not set (required by NextAuth v4+)
// Uses a stable hash so it's consistent across deploys
const nextauthSecret = process.env.NEXTAUTH_SECRET || createHash('sha256')
  .update('tienda-online-oficial-nextauth-production-secret-2024')
  .digest('hex')

console.log(`[nextauth] Google OAuth credentials: ${hasCredentials ? 'FOUND' : 'MISSING'}`)
console.log(`[nextauth] Client ID prefix: ${clientId ? clientId.substring(0, 15) + '...' : '(empty)'}`)
console.log(`[nextauth] NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'USING FALLBACK'}`)
console.log(`[nextauth] NEXTAUTH_URL: ${nextauthUrl || process.env.NEXTAUTH_URL || 'auto'}`)

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
      // Allow all Google sign-ins
      return true
    },
    async redirect({ url, baseUrl }) {
      // If the URL is our custom callback page, let it pass through
      if (url.includes('/auth/google-callback')) {
        return url
      }
      // For NextAuth's internal callback URLs, redirect to our handler
      if (url.includes('/api/auth/callback/google')) {
        // Preserve the original callbackUrl search params
        const callbackUrl = `${baseUrl}/auth/google-callback?action=login`
        return callbackUrl
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, account, profile }) {
      // Store Google profile info in the JWT token
      if (account && profile) {
        token.googleId = account.providerAccountId
        token.email = profile.email
        token.name = profile.name
        token.picture = profile.image
      }
      return token
    },
    async session({ session, token }) {
      // Pass custom data to the session
      if (session.user && token) {
        (session.user as Record<string, unknown>).googleId = token.googleId
        (session.user as Record<string, unknown>).image = token.picture
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes - enough for the full OAuth flow
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}
