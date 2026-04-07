// MercadoPago SDK — dynamic import to avoid ESM/CJS bundling issues with Turbopack
// The SDK uses default exports that don't work correctly with static imports in Next.js 16

let _mp: any = null

async function getMP() {
  if (!_mp) {
    _mp = await import('mercadopago')
  }
  return _mp
}

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
  const mp = await getMP()
  const mpConfig = new mp.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  })

  const preferenceClient = new mp.Preference(mpConfig)

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
  const mp = await getMP()
  const mpConfig = new mp.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  })
  const paymentClient = new mp.Payment(mpConfig)
  const payment: any = await paymentClient.get({ id: Number(paymentId) })
  return payment
}

export async function getMerchantOrder(merchantOrderId: string) {
  const mp = await getMP()
  const mpConfig = new mp.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  })
  const merchantOrderClient = new mp.MerchantOrder(mpConfig)
  const order: any = await merchantOrderClient.get({ merchantOrderId: Number(merchantOrderId) })
  return order
}
