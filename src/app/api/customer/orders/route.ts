import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth, verifyUserOwnership } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || auth.user.userId
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify user can only access their own orders
    const ownership = await verifyUserOwnership(request, userId)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    const orders = await db.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
