import { NextResponse } from 'next/server'
import { getAuthUser, signToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Generate a fresh token for the client to use in subsequent API calls
    const token = await signToken({
      userId: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
    })

    // Return the decoded JWT payload plus a fresh token
    return NextResponse.json({
      id: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
      token,
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
