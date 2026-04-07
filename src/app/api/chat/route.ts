import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Eres un asistente de ventas amigable y profesional para "Urban Style", una tienda de ropa urbana y streetwear premium en Perú. Ayudas a los clientes con preguntas sobre productos, tallas, envíos, devoluciones y consultas generales. Sé cálido, profesional y conciso. Los precios están en Soles peruanos (S/). Horario: Lun-Sáb 9am-8pm. Envío: 1-3 días hábiles. Envío gratis en pedidos mayores a S/199. Pago: contra entrega o transferencia bancaria. Respondes SIEMPRE en español.`

function generateSmartReply(userMessage: string): string {
  const msg = userMessage.toLowerCase()

  if (msg.includes('precio') || msg.includes('cuánto') || msg.includes('cuanto') || msg.includes('costo')) {
    return ' nuestros precios van desde S/ 49.90 hasta S/ 249.90 dependiendo del producto. ¡Tenemos ofertas increíbles! Puedes ver todos los precios en nuestro catálogo. ¿Buscas algo en especial? 💰'
  }
  if (msg.includes('envío') || msg.includes('envio') || msg.includes('despacho') || msg.includes('delivery')) {
    return '¡El envío es GRATIS en pedidos mayores a S/199! 🚚 El tiempo de entrega es de 1-3 días hábiles. Realizamos envíos a todo Lima y provincias. ¿Te gustaría hacer un pedido?'
  }
  if (msg.includes('talla') || msg.includes('medida') || msg.includes('tamaño')) {
    return 'Nuestros productos están disponibles en tallas S, M, L y XL. Recomendamos revisar la guía de tallas en cada producto. Si tienes dudas, ¡escríbenos por WhatsApp y te asesoramos! 📏'
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
    return '¡Tenemos ofertas increíbles! 🏷️ Usa el código URBAN15 para obtener 15% de descuento en toda la colección de Hoodies. Además, el envío es gratis en compras mayores a S/199. ¡No te lo pierdas!'
  }
  if (msg.includes('recomend') || msg.includes('sugerencia') || msg.includes('qué comprar')) {
    return 'Te recomiendo nuestros productos más vendidos: 🔥\n\n1. Jogger Cargo Negro - S/ 129.90\n2. Air Runner Pro - S/ 249.90\n3. Hoodie Oversize Grey - S/ 119.90\n4. Bomber Jacket Negro - S/ 199.90\n\n¡Son los favoritos de nuestros clientes! ¿Te interesa alguno?'
  }

  return 'Gracias por tu mensaje a Urban Style! 😊 Puedo ayudarte con información sobre productos, tallas, precios, envíos y pagos. ¿Sobre qué te gustaría saber? También puedes hacer tu pedido directamente por WhatsApp haciendo clic en el botón verde. 🛍️'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Se requiere un array de mensajes' }, { status: 400 })
    }

    // Get the last user message for smart reply fallback
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''

    // Try AI SDK first
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
