import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Allow all sign-ins, we handle user creation in our custom callback
      return true
    },
    async redirect({ url, baseUrl }) {
      // After Google sign-in, redirect to our custom callback handler
      // This allows us to create/link users with our existing JWT system
      if (url.includes('/api/auth')) {
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
    maxAge: 5 * 60, // 5 minutes - just enough for the callback
  },
}
