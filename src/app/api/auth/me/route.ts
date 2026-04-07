import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Return the decoded JWT payload (userId, email, role, storeId)
    return NextResponse.json({
      id: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
