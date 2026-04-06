import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `Eres un asistente de ventas amigable y profesional para "Urban Style", una tienda de ropa urbana y streetwear premium en Perú. Ayudas a los clientes con preguntas sobre productos, tallas, envíos, devoluciones y consultas generales. Sé cálido, profesional y conciso. Los precios están en Soles peruanos (S/). Horario: Lun-Sáb 9am-8pm. Envío: 1-3 días hábiles. Envío gratis en pedidos mayores a S/199. Pago: contra entrega o transferencia bancaria. Respondes SIEMPRE en español.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Se requiere un array de mensajes' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const messageContent = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje. Intenta de nuevo.'

    return NextResponse.json({ message: messageContent })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
