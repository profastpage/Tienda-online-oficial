import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// ═══════════════════════════════════════════════════════════════
// Environment Variable Reader
// Supports both underscore (GOOGLE_CLIENT_ID) and dash (GOOGLE-CLIENT-ID)
// variants since Vercel UI sometimes auto-replaces underscores.
// ═══════════════════════════════════════════════════════════════

function getEnv(name: string): string {
  if (process.env[name]) return process.env[name]!
  const dash = name.replace(/_/g, '-')
  if (process.env[dash]) return process.env[dash]!
  const norm = name.replace(/[-_]/g, '').toLowerCase()
  for (const [key, value] of Object.entries(process.env)) {
    if (value && key.replace(/[-_]/g, '').toLowerCase() === norm) return value
  }
  return ''
}

const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET')
const hasGoogleCredentials = Boolean(
  GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_SECRET &&
  !GOOGLE_CLIENT_ID.startsWith('your_') &&
  !GOOGLE_CLIENT_ID.startsWith('YOUR_')
)

// ═══════════════════════════════════════════════════════════════
// NEXTAUTH_URL — Critical for OAuth redirects in production
// Must be https:// in production for secure cookies to work.
// ═══════════════════════════════════════════════════════════════

const NEXTAUTH_URL = (() => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.startsWith('http')
      ? process.env.NEXTAUTH_URL
      : `https://${process.env.NEXTAUTH_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NODE_ENV === 'production') return 'https://tienda-online-oficial.vercel.app'
  return 'http://localhost:3000'
})()

// ═══════════════════════════════════════════════════════════════
// NEXTAUTH_SECRET — Must be identical across all serverless invocations
// ═══════════════════════════════════════════════════════════════

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'tienda-online-oficial-secret-2024-x7k9m2p5q8'

// ═══════════════════════════════════════════════════════════════
// Logging (no secrets logged)
// ═══════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════')
console.log('[nextauth] Config:')
console.log(`  Google creds: ${hasGoogleCredentials ? 'FOUND ✓' : 'MISSING ✗ — Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET on Vercel'}`)
console.log(`  URL:          ${NEXTAUTH_URL}`)
console.log(`  Secret:       ${process.env.NEXTAUTH_SECRET ? 'from env' : 'using fallback'}`)
console.log(`  Env:          ${process.env.NODE_ENV || 'dev'}`)
console.log('═══════════════════════════════════════════════════')

// ═══════════════════════════════════════════════════════════════
// NextAuth Configuration
// ═══════════════════════════════════════════════════════════════

export const authOptions: NextAuthOptions = {
  providers: hasGoogleCredentials
    ? [
        GoogleProvider({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: 'select_account',
              access_type: 'offline',
            },
          },
        }),
      ]
    : [],

  secret: NEXTAUTH_SECRET,
  url: NEXTAUTH_URL,

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  // Explicit production cookie configuration
  // In production on Vercel (HTTPS), NextAuth needs __Secure- prefix + secure:true
  // Without this, session cookies may not persist across redirects
  cookies: process.env.NODE_ENV === 'production'
    ? {
        sessionToken: {
          name: '__Secure-next-auth.session-token',
          options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' },
        },
        callbackUrl: {
          name: '__Secure-next-auth.callback-url',
          options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' },
        },
        csrfToken: {
          name: '__Secure-next-auth.csrf-token',
          options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' },
        },
      }
    : {},

  callbacks: {
    async signIn({ account, profile }) {
      if (!hasGoogleCredentials) {
        console.error('[nextauth] Google OAuth credentials not configured!')
        console.error('[nextauth] Go to Vercel → Settings → Environment Variables')
        console.error('[nextauth] Add: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET')
        return false
      }
      console.log('[nextauth] signIn OK:', profile?.email || account?.providerAccountId)
      return true
    },

    async redirect({ url, baseUrl }) {
      // Pass through our custom callback URL unchanged
      if (url.includes('/auth/google-callback')) {
        console.log('[nextauth] redirect → pass:', url)
        return url
      }
      // After NextAuth internal Google callback, redirect to our handler
      if (url.includes('/api/auth/callback/google')) {
        const target = `${baseUrl}/auth/google-callback?action=login`
        console.log('[nextauth] redirect → intercept:', target)
        return target
      }
      // Default: keep URL within our app
      if (url.startsWith(baseUrl)) return url
      console.log('[nextauth] redirect → fallback:', baseUrl)
      return baseUrl
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
        ;(session.user as Record<string, unknown>).googleId = token.googleId
        ;(session.user as Record<string, unknown>).image = token.picture
      }
      return session
    },
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days (was 30 min — too short, caused session loss)
  },

  debug: process.env.NODE_ENV !== 'production',
}
