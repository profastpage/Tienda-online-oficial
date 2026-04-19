import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    // Return empty methods if no storeId provided
    if (!storeId || storeId.startsWith('seed-')) {
      return NextResponse.json({ methods: [] })
    }

    try {
      const db = await getDb()

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
    } catch (dbError) {
      console.warn('[api/store/payment-methods] Database error:', dbError instanceof Error ? dbError.message : dbError)
      return NextResponse.json({ methods: [] })
    }
  } catch (error) {
    console.error('[api/store/payment-methods] Error:', error)
    return NextResponse.json({ methods: [] })
  }
}
