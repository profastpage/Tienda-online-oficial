import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signPasswordResetToken, rateLimit, getClientIp } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { passwordResetEmail } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    // Rate limit: 3 requests per minute
    const ip = getClientIp(request)
    if (!rateLimit(ip, 3, 60000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Always return success to prevent email enumeration
    // But only actually send the email if the user exists
    try {
      const db = await getDb()

      // Find user across all stores
      const user = await db.storeUser.findFirst({
        where: { email },
        include: { store: { select: { name: true, slug: true } } },
      })

      if (user) {
        // Generate reset token
        const token = await signPasswordResetToken(user.email, user.id, user.storeId)

        // Build reset link
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
        const resetLink = `${origin}/login?reset=${encodeURIComponent(token)}`

        // Send email (fire and forget - don't block response)
        const emailTemplate = passwordResetEmail(resetLink, user.name)
        sendEmail({ to: user.email, subject: emailTemplate.subject, html: emailTemplate.html }).catch((err) => {
          console.error('[forgot-password] Failed to send reset email:', err)
        })

        console.log(`[forgot-password] Reset link generated for ${user.email}`)
      } else {
        console.log(`[forgot-password] Email not found: ${email} (returning success to prevent enumeration)`)
      }
    } catch (dbError) {
      console.error('[forgot-password] DB error (returning success anyway):', dbError)
    }

    // Always return success
    return NextResponse.json({
      success: true,
      message: 'Si el email está registrado, recibirás un enlace de recuperación.',
    })
  } catch (error) {
    console.error('[forgot-password] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
