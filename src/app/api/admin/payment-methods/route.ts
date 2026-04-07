import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    // Verify the admin can only access their own store's data
    if (storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const methods = await db.paymentMethod.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(methods)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { type, name, isActive, qrCode, accountNumber, accountHolder, bankName, sortOrder } = body

    if (!type || !name) {
      return NextResponse.json({ error: 'type and name are required' }, { status: 400 })
    }

    // Use storeId from JWT token, not from request body
    const storeId = auth.user.storeId

    const method = await db.paymentMethod.create({
      data: {
        storeId,
        type,
        name,
        isActive: isActive ?? true,
        qrCode: qrCode || '',
        accountNumber: accountNumber || '',
        accountHolder: accountHolder || '',
        bankName: bankName || '',
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(method)
  } catch {
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 })
  }
}
