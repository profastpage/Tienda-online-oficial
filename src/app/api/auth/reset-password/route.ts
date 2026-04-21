import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyPasswordResetToken, hashPassword, rateLimit, getClientIp } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 requests per minute
    const ip = getClientIp(request)
    if (!rateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verify the reset token
    const payload = await verifyPasswordResetToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.' },
        { status: 401 }
      )
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password in DB
    try {
      const db = await getDb()

      const user = await db.storeUser.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }

      await db.storeUser.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      })

      console.log(`[reset-password] Password updated for user ${payload.email}`)

      return NextResponse.json({
        success: true,
        message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
      })
    } catch (dbError) {
      console.error('[reset-password] DB error:', dbError)
      return NextResponse.json(
        { error: 'Error de base de datos. Intenta de nuevo.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('[reset-password] Error:', error)
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    )
  }
}
