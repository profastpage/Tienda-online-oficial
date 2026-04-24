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

      // Use raw SQL (compatible with Turso adapter)
      const methods = await db.$queryRaw<{
        id: string
        type: string
        name: string
        qrCode: string | null
        accountNumber: string | null
        accountHolder: string | null
        bankName: string | null
        isActive: boolean
        sortOrder: number
      }[]>`
        SELECT id, type, name, qrCode, accountNumber, accountHolder, bankName, isActive, sortOrder
        FROM PaymentMethod
        WHERE storeId = ${storeId} AND isActive = 1
        ORDER BY sortOrder ASC
      `

      const activeMethods = methods
        .filter(m => m.isActive === true || m.isActive === 1)
        .map(m => ({
          id: m.id,
          type: m.type,
          name: m.name,
          qrCode: m.qrCode,
          accountNumber: m.accountNumber,
          accountHolder: m.accountHolder,
          bankName: m.bankName,
        }))

      return NextResponse.json({ methods: activeMethods })
    } catch (dbError) {
      console.warn('[api/store/payment-methods] Database error:', dbError instanceof Error ? dbError.message : dbError)
      return NextResponse.json({ methods: [] })
    }
  } catch (error) {
    console.error('[api/store/payment-methods] Error:', error)
    return NextResponse.json({ methods: [] })
  }
}
