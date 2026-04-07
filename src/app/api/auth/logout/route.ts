import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure',
      },
    }
  )
}
