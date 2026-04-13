import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { generateTwoFactorSecret, generateQRCodeDataURL, generateBackupCodes } from '@/lib/two-factor'

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const secret = generateTwoFactorSecret(user.email)
    const qrCode = await generateQRCodeDataURL(secret, user.email)
    const backupCodes = generateBackupCodes()

    return NextResponse.json({ secret, qrCode, backupCodes })
  } catch (error) {
    console.error('[2fa/setup] Error:', error)
    return NextResponse.json(
      { error: 'Error al configurar autenticación en dos pasos' },
      { status: 500 }
    )
  }
}
