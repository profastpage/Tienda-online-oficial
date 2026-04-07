import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getPayment } from '@/lib/mercadopago'

// Helper: always return 200 JSON (MercadoPago retries on non-2xx)
function ok(body: Record<string, string> = { status: 'ok' }) {
  return NextResponse.json(body, { status: 200 })
}

// GET: MercadoPago IPN verification challenge
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic')
    const resource = searchParams.get('resource')

    // MercadoPago sends GET requests for topic=merchant_order verification
    if (topic && resource) {
      if (resource.startsWith('https://api.mercadopago.com/')) {
        return NextResponse.json({ status: 'verified' })
      }
    }

    return ok()
  } catch (error: any) {
    console.error('[MercadoPago Webhook GET] Error:', error)
    return ok()
  }
}

// POST: MercadoPago IPN notification handler
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Log notification for debugging
    console.log('[MercadoPago Webhook] Notification received:', JSON.stringify(body))

    const action = body.action
    const type = body.type
    const data = body.data

    // Handle payment notifications
    if (action === 'payment.updated' || type === 'payment') {
      const paymentId = data?.id

      if (!paymentId) {
        console.warn('[MercadoPago Webhook] No paymentId in notification')
        return ok()
      }

      try {
        // Fetch payment details from MercadoPago
        const payment = await getPayment(String(paymentId))
        const paymentData = payment as any

        const externalReference = paymentData.external_reference
        const mpStatus = paymentData.status // approved, rejected, cancelled, refunded, in_process, etc.
        const paymentType = paymentData.payment_type_id || '' // credit_card, debit_card, transfer, etc.
        const lastFour = paymentData.card?.last_four_digits || ''
        const installments = paymentData.installments || 1
        const payerEmail = paymentData.payer?.email || ''
        const payerDocType = paymentData.payer?.identification?.type || ''
        const payerDocNumber = paymentData.payer?.identification?.number || ''

        if (!externalReference) {
          console.warn(`[MercadoPago Webhook] No external_reference for payment ${paymentId}`)
          return ok()
        }

        const db = await getDb()

        // Find the MercadoPago payment record by paymentId or orderId (external_reference)
        let mpPayment = await db.mercadoPagoPayment.findFirst({
          where: { paymentId: String(paymentId) },
        })

        if (!mpPayment) {
          // Try finding by orderId (external_reference)
          mpPayment = await db.mercadoPagoPayment.findUnique({
            where: { orderId: externalReference },
          })
        }

        if (!mpPayment) {
          console.warn(`[MercadoPago Webhook] No MercadoPagoPayment record found for payment ${paymentId} / order ${externalReference}`)
          return ok()
        }

        // Map MercadoPago status to our status
        let orderStatus = mpPayment.status
        let mpStatusFinal = mpStatus

        switch (mpStatus) {
          case 'approved':
            orderStatus = 'confirmed'
            mpStatusFinal = 'approved'
            break
          case 'rejected':
            orderStatus = 'cancelled'
            mpStatusFinal = 'rejected'
            break
          case 'cancelled':
            orderStatus = 'cancelled'
            mpStatusFinal = 'cancelled'
            break
          case 'refunded':
            orderStatus = 'refunded'
            mpStatusFinal = 'refunded'
            break
          case 'in_process':
            orderStatus = 'pending'
            mpStatusFinal = 'pending'
            break
          case 'authorized':
          case 'in_mediation':
            orderStatus = 'pending'
            break
          default:
            // Keep existing status for unknown states
            break
        }

        // Update MercadoPago payment record
        await db.mercadoPagoPayment.update({
          where: { id: mpPayment.id },
          data: {
            paymentId: String(paymentId),
            status: mpStatusFinal,
            paymentType,
            lastFourDigits: lastFour,
            installments,
            payerEmail,
            payerDocType,
            payerDocNumber,
            metadata: JSON.stringify({
              ...(JSON.parse(mpPayment.metadata || '{}')),
              mpPaymentId: paymentId,
              mpStatus: paymentData.status,
              mpStatusDetail: paymentData.status_detail,
              transactionAmount: paymentData.transaction_amount,
              currencyId: paymentData.currency_id,
            }),
          },
        })

        // Update order status
        await db.order.update({
          where: { id: mpPayment.orderId },
          data: { status: orderStatus },
        })

        console.log(`[MercadoPago Webhook] Order ${mpPayment.orderId} updated to status: ${orderStatus} (MP: ${mpStatus})`)
      } catch (innerError: any) {
        console.error('[MercadoPago Webhook] Error processing payment:', innerError)
        // Return 200 to prevent MP retries
        return ok({ status: 'error_handled' })
      }
    }

    return ok()
  } catch (error: any) {
    console.error('[MercadoPago Webhook] Error:', error)
    // Always return 200 to prevent MercadoPago from retrying
    return ok({ status: 'error' })
  }
}
