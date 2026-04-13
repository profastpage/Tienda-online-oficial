// MercadoPago REST API — Direct fetch calls (no SDK dependency)
// This approach is more stable in Vercel serverless environments
// and avoids ESM/CJS bundling issues from the mercadopago npm package.

const MP_API_BASE = 'https://api.mercadopago.com'

function getAccessToken(): string {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    throw new Error('MP_ACCESS_TOKEN no está configurada en las variables de entorno')
  }
  return token
}

function mpHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getAccessToken()}`,
    'Content-Type': 'application/json',
    'X-Idempotency-Key': crypto.randomUUID(),
  }
}

// ── Types ──────────────────────────────────────────────────────────────

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

// ── Create Preference ──────────────────────────────────────────────────

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

  const body: Record<string, any> = {
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
    statement_descriptor: 'Tienda Online Oficial',
  }

  if (data.customerEmail) {
    body.payer = {
      email: data.customerEmail,
      name: data.customerName || '',
    }
  }

  const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: mpHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('[MercadoPago REST] Create preference error:', response.status, errorData)
    throw new Error(`MercadoPago error ${response.status}: ${errorData}`)
  }

  const preference = await response.json()

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point || '',
    sandboxInitPoint: preference.sandbox_init_point || '',
  }
}

// ── Get Payment by ID ──────────────────────────────────────────────────

export async function getPayment(paymentId: string) {
  const response = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: mpHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('[MercadoPago REST] Get payment error:', response.status, errorData)
    throw new Error(`MercadoPago error ${response.status}: ${errorData}`)
  }

  return await response.json()
}

// ── Get Merchant Order by ID ───────────────────────────────────────────

export async function getMerchantOrder(merchantOrderId: string) {
  const response = await fetch(`${MP_API_BASE}/merchant_orders/${merchantOrderId}`, {
    method: 'GET',
    headers: mpHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('[MercadoPago REST] Get merchant order error:', response.status, errorData)
    throw new Error(`MercadoPago error ${response.status}: ${errorData}`)
  }

  return await response.json()
}
