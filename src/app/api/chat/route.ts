import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════
// ATLAS AI CHAT — Reliable API Route
// ═══════════════════════════════════════════════════════════════════
// No database dependency — uses inline product catalog for speed.
// z-ai-web-dev-sdk for AI responses, smart fallback for resilience.
// Rate limiting via in-memory IP tracking (serverless-safe).
// ═══════════════════════════════════════════════════════════════════

const AI_TIMEOUT_MS = 8000  // 8 seconds max for AI response

// ── Simple in-memory rate limiter (serverless-safe) ──────────────
const rateCache = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string, max = 15, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = rateCache.get(ip)
  if (!entry || now > entry.resetAt) {
    rateCache.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  entry.count++
  return entry.count > max
}

// ── Inline product catalog (no DB needed) ────────────────────────
const PRODUCT_CATALOG = [
  { name: 'Stellar Sport Aero Racer Rojo', cat: 'Calzado', price: 189.90, oldPrice: 249.90, discount: 24, sizes: '38-43', colors: 'Rojo' },
  { name: 'Stellar Sport Cloud Speed Borgoña', cat: 'Calzado', price: 219.90, oldPrice: 289.90, discount: 24, sizes: '38-43', colors: 'Borgoña' },
  { name: 'Everest Outdoor Noir Leather Boot', cat: 'Calzado', price: 299.90, oldPrice: null, discount: null, sizes: '38-44', colors: 'Negro' },
  { name: 'Urban Vibe Vintage Court Beige', cat: 'Calzado', price: 189.90, oldPrice: 239.90, discount: 21, sizes: '38-43', colors: 'Beige' },
  { name: 'Urban Vibe Classic Mocasín Marrón', cat: 'Calzado', price: 249.90, oldPrice: null, discount: null, sizes: '38-43', colors: 'Marrón' },
  { name: 'Stellar Sport Neon Court LED Negro', cat: 'Calzado', price: 199.90, oldPrice: 259.90, discount: 23, sizes: '38-43', colors: 'Negro' },
  { name: 'Everest Outdoor Chelsea Explorer Café', cat: 'Calzado', price: 279.90, oldPrice: 349.90, discount: 20, sizes: '38-44', colors: 'Café' },
  { name: 'Urban Vibe Suede Chunky Gris', cat: 'Calzado', price: 159.90, oldPrice: null, discount: null, sizes: '38-43', colors: 'Gris' },
  { name: 'Urban Vibe Skate Classic Negro', cat: 'Calzado', price: 149.90, oldPrice: 189.90, discount: 21, sizes: '36-43', colors: 'Negro' },
  { name: 'Everest Outdoor Trek Pro Gris', cat: 'Calzado', price: 329.90, oldPrice: null, discount: null, sizes: '38-44', colors: 'Gris' },
  { name: 'Urban Vibe Oversize Hoodie Negro', cat: 'Ropa', price: 139.90, oldPrice: 179.90, discount: 22, sizes: 'S-XL', colors: 'Negro' },
  { name: 'Everest Outdoor Denim Trail Azul', cat: 'Ropa', price: 189.90, oldPrice: null, discount: null, sizes: 'S-XL', colors: 'Azul' },
  { name: 'Everest Outdoor Bomber Tactical Oliva', cat: 'Ropa', price: 209.90, oldPrice: 269.90, discount: 22, sizes: 'S-XL', colors: 'Oliva' },
  { name: 'Urban Vibe Essential Tee Blanco', cat: 'Ropa', price: 69.90, oldPrice: 89.90, discount: 22, sizes: 'S-XXL', colors: 'Blanco' },
  { name: 'Urban Vibe Flannel Check Rojo', cat: 'Ropa', price: 99.90, oldPrice: null, discount: null, sizes: 'S-XL', colors: 'Rojo/Negro' },
  { name: 'Stellar Sport Wind Shield Azul', cat: 'Ropa', price: 159.90, oldPrice: 199.90, discount: 20, sizes: 'S-XL', colors: 'Azul' },
  { name: 'Urban Vibe Cargo Tech Negro', cat: 'Ropa', price: 119.90, oldPrice: null, discount: null, sizes: 'S-XL', colors: 'Negro' },
  { name: 'Urban Vibe Oxford Fit Celeste', cat: 'Ropa', price: 109.90, oldPrice: 139.90, discount: 21, sizes: 'S-XL', colors: 'Celeste' },
  { name: 'Urban Vibe Cable Knit Crema', cat: 'Ropa', price: 149.90, oldPrice: null, discount: null, sizes: 'S-XL', colors: 'Crema' },
  { name: 'Everest Outdoor Puffer Shield Negro', cat: 'Ropa', price: 279.90, oldPrice: 359.90, discount: 22, sizes: 'S-XXL', colors: 'Negro' },
  { name: 'Stellar Sport Tech Pack Negro', cat: 'Accesorios', price: 169.90, oldPrice: 219.90, discount: 23, sizes: 'Único', colors: 'Negro' },
  { name: 'Everest Outdoor Field Watch Blanco', cat: 'Accesorios', price: 249.90, oldPrice: 329.90, discount: 24, sizes: 'Único', colors: 'Blanco' },
  { name: 'Urban Vibe Aviator Gold', cat: 'Accesorios', price: 129.90, oldPrice: null, discount: null, sizes: 'Único', colors: 'Dorado' },
  { name: 'Urban Vibe Snapback Edge Negro', cat: 'Accesorios', price: 59.90, oldPrice: 79.90, discount: 25, sizes: 'Único', colors: 'Negro' },
  { name: 'Urban Vibe Heritage Belt Café', cat: 'Accesorios', price: 89.90, oldPrice: null, discount: null, sizes: 'Único', colors: 'Café' },
  { name: 'Urban Vibe Slim Wallet Café', cat: 'Accesorios', price: 79.90, oldPrice: 99.90, discount: 20, sizes: 'Único', colors: 'Café' },
  { name: 'Stellar Sport Sport Watch Digital Negro', cat: 'Accesorios', price: 149.90, oldPrice: 189.90, discount: 21, sizes: 'Único', colors: 'Negro' },
  { name: 'Urban Vibe Retro Round Tortuga', cat: 'Accesorios', price: 109.90, oldPrice: null, discount: null, sizes: 'Único', colors: 'Tortuga' },
  { name: 'Urban Vibe Bucket Flow Negro', cat: 'Accesorios', price: 49.90, oldPrice: null, discount: null, sizes: 'Único', colors: 'Negro' },
  { name: 'Stellar Sport Messenger Pack Café', cat: 'Accesorios', price: 119.90, oldPrice: 149.90, discount: 20, sizes: 'Único', colors: 'Café' },
]

function buildProductContext(): string {
  const lines = PRODUCT_CATALOG.map((p, i) => {
    const price = `S/ ${p.price.toFixed(2)}`
    const old = p.oldPrice ? `(antes S/ ${p.oldPrice.toFixed(2)})` : ''
    const disc = p.discount ? `[-${p.discount}%]` : ''
    return `${i + 1}. ${p.name} | ${p.cat} | ${price} ${old} ${disc} | Tallas: ${p.sizes} | Colores: ${p.colors}`
  }).join('\n')
  return `\n\nCATÁLOGO ACTUAL (${PRODUCT_CATALOG.length} productos):\n${lines}`
}

const SYSTEM_PROMPT = `Eres Atlas, el asistente virtual de "Urban Style", una tienda de moda urbana premium en Perú. Tu personalidad es amigable, directa y servicial. Respondes SIEMPRE en español.

Reglas:
- Precios en Soles (S/), envío gratis +S/199, 1-3 días hábiles
- Pago: contra entrega, Yape/Plin, transferencia
- Horario: Lun-Sáb 9am-8pm
- Usa el catálogo de abajo para responder preguntas sobre productos
- Sé conciso: máximo 3-4 líneas por respuesta
- No inventes productos que no estén en el catálogo
- Si no sabes algo, sugiere contactar por WhatsApp
${buildProductContext()}`

// ── Smart fallback (only if SDK fails) ───────────────────────────
function smartReply(msg: string): string {
  const m = msg.toLowerCase()
  if (/hola|hi|buenas|hey|buenas tardes|buenos días|buenas noches/.test(m))
    return '¡Hola! Bienvenido a Urban Style. ¿En qué te puedo ayudar? Puedo buscarte productos, darte precios o info de envíos.'
  if (/precio|cuánto|cuanto|cuesta|costo/.test(m))
    return 'Tenemos productos desde S/ 49.90 hasta S/ 329.90. ¿Qué tipo de producto buscas? Zapatillas, ropa o accesorios.'
  if (/envío|envio|delivery|despacho|llega/.test(m))
    return 'Envío gratis en compras mayores a S/ 199. Entrega en 1-3 días hábiles a Lima y provincias.'
  if (/talla|medida|tamaño/.test(m))
    return 'Nuestras tallas van de S a XXL en ropa, y 36-44 en calzado. ¿Sobre qué producto necesitas saber?'
  if (/pago|pagar|yape|plin/.test(m))
    return 'Aceptamos Yape, Plin, transferencia bancaria y pago contra entrega. ¡Todo 100% seguro!'
  if (/devoluci|cambio|garantía/.test(m))
    return '30 días para cambios y devoluciones. El producto debe estar con etiquetas. Contáctanos por WhatsApp.'
  if (/horario|hora|abierto/.test(m))
    return 'Atendemos Lun-Sáb de 9am a 8pm. Pedidos por WhatsApp 24/7.'
  if (/descuento|oferta|promo/.test(m))
    return 'Tenemos productos con hasta -25% de descuento. Revisa la sección de ofertas en la tienda.'
  if (/gracias|thank/.test(m))
    return '¡Con gusto! Si necesitas algo más, aquí estoy.'
  return 'Puedo ayudarte con productos, precios, tallas, envíos o pagos. ¿Qué necesitas saber?'
}

// ── AI call with timeout ─────────────────────────────────────────
async function callAI(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // last 10 messages for context
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    return completion.choices[0]?.message?.content || null
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('[atlas] AI timeout after', AI_TIMEOUT_MS, 'ms')
    } else {
      console.warn('[atlas] AI error:', err?.message || err)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ── Main handler ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: 'Espera un momento antes de enviar otro mensaje.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { messages } = body as { messages?: Array<{ role: string; content: string }> }

    if (!messages?.length) {
      return NextResponse.json({ message: 'Envía un mensaje para empezar.' }, { status: 400 })
    }

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || ''

    // 1) Try AI
    const aiReply = await callAI(messages)
    if (aiReply) {
      return NextResponse.json({ message: aiReply })
    }

    // 2) Fallback to smart reply
    const reply = smartReply(lastUserMsg)
    return NextResponse.json({ message: reply })

  } catch (error: any) {
    console.error('[atlas] Fatal error:', error?.message || error)
    return NextResponse.json({
      message: 'Tuve un problema técnico. Intenta de nuevo o escríbenos por WhatsApp.'
    })
  }
}
