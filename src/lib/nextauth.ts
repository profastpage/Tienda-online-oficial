import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const clientId = process.env.GOOGLE_CLIENT_ID || ''
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
const hasCredentials = clientId && clientSecret && !clientId.startsWith('your-')

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
