import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const params = new URLSearchParams({
      checkout_status: 'failure',
      payment_method: 'mercadopago',
    })

    if (orderId) params.set('order_id', orderId)

    return NextResponse.redirect(`${siteUrl}/?${params.toString()}`)
  } catch (error: any) {
    console.error('[MercadoPago Failure] Error:', error)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${siteUrl}/?checkout_status=failure&payment_method=mercadopago`)
  }
}
