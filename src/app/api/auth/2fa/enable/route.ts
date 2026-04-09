import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { verifyTwoFactorCode } from '@/lib/two-factor'

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { secret, code } = await request.json()

    if (!secret || !code) {
      return NextResponse.json({ error: 'Secret y código requeridos' }, { status: 400 })
    }

    const isValid = verifyTwoFactorCode(secret, code)
    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido. Intenta de nuevo.' }, { status: 400 })
    }

    const db = await getDb()
    await db.storeUser.update({
      where: { id: user.userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    })

    return NextResponse.json({ message: 'Autenticación en dos pasos habilitada correctamente' })
  } catch (error) {
    console.error('[2fa/enable] Error:', error)
    return NextResponse.json(
      { error: 'Error al habilitar autenticación en dos pasos' },
      { status: 500 }
    )
  }
}
