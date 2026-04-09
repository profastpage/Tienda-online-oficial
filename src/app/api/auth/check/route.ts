import { NextResponse } from 'next/server'

// Diagnostic endpoint to verify NextAuth configuration
// Call: GET /api/auth/check
// Returns: status of Google OAuth credentials and NEXTAUTH settings
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env['GOOGLE-CLIENT-ID'] || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env['GOOGLE-CLIENT-SECRET'] || ''
  const nextauthUrl = process.env.NEXTAUTH_URL || ''
  const vercelUrl = process.env.VERCEL_URL || ''
  const nextauthSecret = process.env.NEXTAUTH_SECRET || ''
  const nodeEnv = process.env.NODE_ENV || 'development'

  const hasClientId = Boolean(clientId && !clientId.startsWith('your_'))
  const hasClientSecret = Boolean(clientSecret)
  const hasUrl = Boolean(nextauthUrl || vercelUrl)
  const hasSecret = Boolean(nextauthSecret)

  // Check all env var variants
  const allEnvVars: Record<string, boolean> = {}
  const toCheck = [
    'GOOGLE_CLIENT_ID', 'GOOGLE-CLIENT-ID', 'google_client_id', 'google-client-id',
    'GOOGLE_CLIENT_SECRET', 'GOOGLE-CLIENT-SECRET', 'google_client_secret', 'google-client-secret',
    'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'VERCEL_URL', 'NODE_ENV',
  ]
  for (const key of toCheck) {
    allEnvVars[key] = Boolean(process.env[key])
  }

  return NextResponse.json({
    status: hasClientId && hasClientSecret ? 'OK' : 'ERROR',
    checks: {
      googleClientId: { set: hasClientId, prefix: clientId ? clientId.substring(0, 8) + '...' : '(empty)' },
      googleClientSecret: { set: hasClientSecret },
      nextauthUrl: { set: hasUrl, value: nextauthUrl || (vercelUrl ? `https://${vercelUrl}` : '(empty)') },
      nextauthSecret: { set: hasSecret },
      vercelUrl: { set: Boolean(vercelUrl), value: vercelUrl || '(empty)' },
      nodeEnv,
    },
    envVarsFound: allEnvVars,
    recommendations: !hasClientId || !hasClientSecret
      ? [
          'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel → Settings → Environment Variables',
          'Also set NEXTAUTH_SECRET (generate one with: openssl rand -base64 32)',
          'Set NEXTAUTH_URL to https://tienda-online-oficial.vercel.app',
        ]
      : [],
    timestamp: new Date().toISOString(),
  })
}
