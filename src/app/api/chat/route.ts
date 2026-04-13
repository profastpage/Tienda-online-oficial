import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { filterSeedProducts } from '@/lib/seed-data'
import { getClientIp, rateLimit } from '@/lib/auth'

const CHAT_RATE_LIMIT = 10       // max requests
const CHAT_RATE_WINDOW = 60000   // per 60 seconds

const BASE_SYSTEM_PROMPT = `Eres un asistente de ventas amigable y profesional para "Urban Style", una tienda de ropa urbana y streetwear premium en Perú. Ayudas a los clientes con preguntas sobre productos, tallas, envíos, devoluciones y consultas generales. Sé cálido, profesional y conciso. Los precios están en Soles peruanos (S/). Horario: Lun-Sáb 9am-8pm. Envío: 1-3 días hábiles. Envío gratis en pedidos mayores a S/199. Pago: contra entrega o transferencia bancaria. Respondes SIEMPRE en español.

IMPORTANTE: Utiliza la información de productos proporcionada a continuación para responder preguntas específicas sobre productos, precios, tallas, colores y disponibilidad. Si el usuario pregunta sobre un producto específico, busca en el catálogo y da información precisa. Si el usuario pide recomendaciones, sugiere productos relevantes del catálogo. No inventes productos que no estén en la lista.`

async function getProductContext(): Promise<string> {
  try {
    const db = await getDb()
    const store = await db.store.findUnique({ where: { slug: 'urban-style' } })
    if (store) {
      const products = await db.product.findMany({
        where: { storeId: store.id, inStock: true },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      })
      if (products.length > 0) {
        const productLines = products.map((p, i) => {
          let sizes = 'N/D'
          let colors = 'N/D'
          try { sizes = (JSON.parse(p.sizes as string) as string[]).join(', ') } catch {}
          try { colors = (JSON.parse(p.colors as string) as { name: string }[]).map(c => c.name).join(', ') } catch {}
          return `${i + 1}. ${p.name} | Categoría: ${p.category?.name || 'General'} | Precio: S/ ${Number(p.price).toFixed(2)}${p.comparePrice ? ` (antes S/ ${Number(p.comparePrice).toFixed(2)})` : ''}${p.discount ? ` | Descuento: -${p.discount}%` : ''} | Tallas: ${sizes} | Colores: ${colors}${p.isNew ? ' | ★ NUEVO' : ''}${p.description ? ` | Descripción: ${p.description.substring(0, 100)}` : ''}`
        }).join('\n')
        return `\n\nCATÁLOGO DE PRODUCTOS ACTUALIZADO:\n${productLines}\n\nTotal de productos disponibles: ${products.length}`
      }
    }
  } catch (error) {
    console.warn('[chat] Could not fetch products from DB:', error)
  }

  // Fallback to seed data
  try {
    const fallback = filterSeedProducts({})
    if (fallback.length > 0) {
      const productLines = fallback.map((p: any, i: number) => {
        let sizes = 'N/D'
        let colors = 'N/D'
        try { sizes = (JSON.parse(p.sizes) as string[]).join(', ') } catch {}
        try { colors = (JSON.parse(p.colors) as { name: string }[]).map(c => c.name).join(', ') } catch {}
        return `${i + 1}. ${p.name} | Categoría: ${p.category?.name || 'General'} | Precio: S/ ${Number(p.price).toFixed(2)}${p.comparePrice ? ` (antes S/ ${Number(p.comparePrice).toFixed(2)})` : ''}${p.discount ? ` | Descuento: -${p.discount}%` : ''} | Tallas: ${sizes} | Colores: ${colors}`
      }).join('\n')
      return `\n\nCATÁLOGO DE PRODUCTOS ACTUALIZADO:\n${productLines}\n\nTotal de productos disponibles: ${fallback.length}`
    }
  } catch {}

  return ''
}

function generateSmartReply(userMessage: string): string {
  const msg = userMessage.toLowerCase()

  if (msg.includes('precio') || msg.includes('cuánto') || msg.includes('cuanto') || msg.includes('costo')) {
    return 'Nuestros precios varían según el producto. Te recomiendo revisar nuestro catálogo para ver los precios exactos. ¿Buscas algún producto en particular? 💰'
  }
  if (msg.includes('envío') || msg.includes('envio') || msg.includes('despacho') || msg.includes('delivery')) {
    return '¡El envío es GRATIS en pedidos mayores a S/199! 🚚 El tiempo de entrega es de 1-3 días hábiles. Realizamos envíos a todo Lima y provincias. ¿Te gustaría hacer un pedido?'
  }
  if (msg.includes('talla') || msg.includes('medida') || msg.includes('tamaño')) {
    return 'Nuestros productos están disponibles en diferentes tallas (generalmente S, M, L, XL). Recomendamos revisar la guía de tallas en cada producto. Si tienes dudas, ¡escríbenos por WhatsApp y te asesoramos! 📏'
  }
  if (msg.includes('devolución') || msg.includes('devolucion') || msg.includes('cambio') || msg.includes('garantía')) {
    return 'Ofrecemos 30 días de garantía para cambios y devoluciones. El producto debe estar en su estado original con etiquetas. Contáctanos por WhatsApp para iniciar el proceso. 🔄'
  }
  if (msg.includes('pago') || msg.includes('pagar') || msg.includes('metodo')) {
    return 'Aceptamos pago contra entrega (efectivo o Yape/Plin) y transferencia bancaria. ¡Es 100% seguro! 💳 ¿Prefieres algún método en particular?'
  }
  if (msg.includes('horario') || msg.includes('hora') || msg.includes('abierto')) {
    return 'Nuestro horario de atención es Lunes a Sábado de 9am a 8pm. Los pedidos por WhatsApp se pueden hacer 24/7 y los procesamos al siguiente día hábil. 🕐'
  }
  if (msg.includes('whatsapp') || msg.includes('contacto') || msg.includes('comunicar')) {
    return '¡Puedes hacernos tu pedido directamente por WhatsApp! 📱 Haz clic en el botón verde de WhatsApp en nuestra tienda y te atenderemos al instante. ¡Es la forma más rápida!'
  }
  if (msg.includes('hola') || msg.includes('hi') || msg.includes('buenas') || msg.includes('hey')) {
    return '¡Hola! 👋 Bienvenido a Urban Style. ¿En qué puedo ayudarte? Puedo asesorarte sobre productos, tallas, envíos, pagos o cualquier consulta. ¡Pregunta lo que necesites!'
  }
  if (msg.includes('gracias') || msg.includes('thank')) {
    return '¡De nada! 😊 Fue un placer ayudarte. Si tienes alguna otra consulta, no dudes en escribirnos. ¡Que disfrutes tu compra en Urban Style! 🛍️'
  }
  if (msg.includes('descuento') || msg.includes('oferta') || msg.includes('promo')) {
    return '¡Revisa nuestro catálogo para ver los productos con descuento marcados! 🏷️ Además, el envío es gratis en compras mayores a S/199. ¿Buscas algo en particular?'
  }
  if (msg.includes('recomend') || msg.includes('sugerencia') || msg.includes('qué comprar')) {
    return '¡Te puedo ayudar! Cuéntame qué tipo de producto buscas (polo, pantalón, zapatillas, accesorio) y te doy recomendaciones de nuestro catálogo actual. 🔥'
  }

  return 'Gracias por tu mensaje a Urban Style! 😊 Puedo ayudarte con información sobre productos, tallas, precios, envíos y pagos. ¿Sobre qué te gustaría saber? También puedes hacer tu pedido directamente por WhatsApp. 🛍️'
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP (distributed via DB)
    const ip = getClientIp(request)
    const rateKey = `chat:${ip}`
    const allowed = await rateLimit(rateKey, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Por favor espera un momento antes de intentar de nuevo.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Se requiere un array de mensajes' }, { status: 400 })
    }

    // Get the last user message for smart reply fallback
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''

    // Build system prompt with real product context
    const productContext = await getProductContext()
    const systemPrompt = BASE_SYSTEM_PROMPT + productContext

    // Try AI SDK first
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const messageContent = completion.choices[0]?.message?.content
      if (messageContent) {
        return NextResponse.json({ message: messageContent })
      }
    } catch (aiError) {
      console.warn('AI SDK unavailable, using smart reply fallback:', aiError)
    }

    // Fallback to smart reply
    const reply = generateSmartReply(lastUserMessage)
    return NextResponse.json({ message: reply })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    return NextResponse.json({ message: 'Lo siento, tuve un problema técnico. Por favor intenta de nuevo o escríbenos por WhatsApp. 📱' })
  }
}
