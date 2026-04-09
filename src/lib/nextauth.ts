import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

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

console.log(`[nextauth] Google OAuth credentials: ${hasCredentials ? 'FOUND' : 'MISSING'}`)
console.log(`[nextauth] Client ID prefix: ${clientId ? clientId.substring(0, 15) + '...' : '(empty)'}`)

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
  secret: process.env.NEXTAUTH_SECRET,
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
      // If the URL is our custom callback page, let it pass through
      if (url.includes('/auth/google-callback')) {
        return url
      }
      // For NextAuth's internal callback URLs, redirect to our handler
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/auth/google-callback`
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
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes - enough for the full OAuth flow
  },
}
