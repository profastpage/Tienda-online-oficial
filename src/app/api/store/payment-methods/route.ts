import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 })
    }

    const methods = await db.paymentMethod.findMany({
      where: {
        storeId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        type: true,
        name: true,
        qrCode: true,
        accountNumber: true,
        accountHolder: true,
        bankName: true,
      },
    })

    return NextResponse.json({ methods })
  } catch {
    // If PaymentMethod table doesn't exist (e.g. fresh deploy without db push),
    // return empty array so storefront falls back to hardcoded payment methods
    return NextResponse.json({ methods: [] })
  }
}
