import { NextResponse } from 'next/server'
import { extractToken, verifyToken, authError } from '@/lib/auth'

// Simple notification endpoint that can be called after deployments
// Returns a JSON with deployment status and timestamp
// Requires authentication
export async function POST(request: Request) {
  // Auth check
  const token = extractToken(request)
  if (!token) return authError('No autenticado')

  const payload = await verifyToken(token)
  if (!payload) return authError('Token inválido')

  try {
    const body = await request.json()
    const { message, type = 'deploy' } = body

    const timestamp = new Date().toISOString()
    const project = 'Tienda Online Oficial'

    // Log the notification (for now)
    console.log(`[NOTIFY] ${type}: ${message} at ${timestamp}`)

    return NextResponse.json({
      success: true,
      timestamp,
      project,
      message,
      type,
    })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

// GET endpoint to check notification system status
// Requires authentication
export async function GET(request: Request) {
  // Auth check
  const token = extractToken(request)
  if (!token) return authError('No autenticado')

  const payload = await verifyToken(token)
  if (!payload) return authError('Token inválido')

  return NextResponse.json({
    service: 'Tienda Online Oficial - Notification System',
    status: 'active',
    channels: {
      whatsapp: 'pending_setup',
      sms: 'pending_setup',
      browser: 'available',
      webhook: 'available',
    },
    note: 'Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN in Vercel env for WhatsApp/SMS notifications',
  })
}
