import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

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
    const db = await getDb()
    const body = await request.json()
    const { storeId, type, name, isActive, qrCode, accountNumber, accountHolder, bankName, sortOrder } = body

    if (!storeId || !type || !name) {
      return NextResponse.json({ error: 'storeId, type, and name are required' }, { status: 400 })
    }

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
