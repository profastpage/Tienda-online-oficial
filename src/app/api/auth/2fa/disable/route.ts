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

    const db = await getDb()
    const dbUser = await db.storeUser.findUnique({
      where: { id: user.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (!dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
      return NextResponse.json({ error: 'La autenticación en dos pasos no está habilitada' }, { status: 400 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Código de verificación requerido' }, { status: 400 })
    }

    const isValid = verifyTwoFactorCode(dbUser.twoFactorSecret, code)
    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido. Intenta de nuevo.' }, { status: 400 })
    }

    await db.storeUser.update({
      where: { id: user.userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    })

    return NextResponse.json({ message: 'Autenticación en dos pasos deshabilitada correctamente' })
  } catch (error) {
    console.error('[2fa/disable] Error:', error)
    return NextResponse.json(
      { error: 'Error al deshabilitar autenticación en dos pasos' },
      { status: 500 }
    )
  }
}
