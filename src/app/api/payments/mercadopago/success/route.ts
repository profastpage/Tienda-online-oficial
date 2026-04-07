import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const preferenceId = searchParams.get('preference_id')
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')

    // Build redirect URL to storefront with success query params
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const params = new URLSearchParams({
      checkout_status: 'success',
      payment_method: 'mercadopago',
    })

    if (orderId) params.set('order_id', orderId)
    if (preferenceId) params.set('preference_id', preferenceId)
    if (paymentId) params.set('payment_id', paymentId)
    if (status) params.set('mp_status', status)

    // Redirect to the main page with success indicators
    return NextResponse.redirect(`${siteUrl}/?${params.toString()}`)
  } catch (error: any) {
    console.error('[MercadoPago Success] Error:', error)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${siteUrl}/?checkout_status=success&payment_method=mercadopago`)
  }
}
