import mercadopago from 'mercadopago'

// @ts-expect-error — mercadopago SDK lacks proper TS exports
const mpConfig = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

// @ts-expect-error — mercadopago SDK lacks proper TS exports
const preferenceClient = new mercadopago.Preference(mpConfig)
// @ts-expect-error — mercadopago SDK lacks proper TS exports
const paymentClient = new mercadopago.Payment(mpConfig)
// @ts-expect-error — mercadopago SDK lacks proper TS exports
const merchantOrderClient = new mercadopago.MerchantOrder(mpConfig)

export interface PreferenceItem {
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CreatePreferenceData {
  orderId: string
  orderNumber: string
  items: PreferenceItem[]
  customerEmail?: string
  customerName?: string
  siteUrl: string
}

export async function createPreference(data: CreatePreferenceData) {
  const siteUrl = data.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const items = data.items.map((item) => ({
    id: data.orderId,
    title: item.name.substring(0, 256),
    unit_price: Number(item.price),
    quantity: Number(item.quantity),
    currency_id: 'PEN',
    picture_url: item.image || undefined,
    description: `Pedido #${data.orderNumber}`,
  }))

  const preference: any = await preferenceClient.create({
    body: {
      items,
      external_reference: data.orderId,
      notification_url: `${siteUrl}/api/payments/mercadopago/webhook`,
      back_urls: {
        success: `${siteUrl}/api/payments/mercadopago/success?order_id=${data.orderId}&preference_id={preference_id}`,
        failure: `${siteUrl}/api/payments/mercadopago/failure?order_id=${data.orderId}`,
        pending: `${siteUrl}/api/payments/mercadopago/pending?order_id=${data.orderId}`,
      },
      auto_return: 'approved',
      binary_mode: false,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      payer: data.customerEmail
        ? {
            email: data.customerEmail,
            name: data.customerName || '',
          }
        : undefined,
      statement_descriptor: 'Tienda Online Oficial',
    },
  })

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point || '',
    sandboxInitPoint: preference.sandbox_init_point || '',
  }
}

export async function getPayment(paymentId: string) {
  const payment: any = await paymentClient.get({ id: Number(paymentId) })
  return payment
}

export async function getMerchantOrder(merchantOrderId: string) {
  const order: any = await merchantOrderClient.get({ merchantOrderId: Number(merchantOrderId) })
  return order
}
