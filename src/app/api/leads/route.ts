import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const { name, email, phone, message, source, plan } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone: phone || '',
        message: message || '',
        source: source || 'landing',
        plan: plan || '',
      },
    })

    return NextResponse.json({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      message: 'Gracias por tu interés. Nos pondremos en contacto pronto.',
    })
  } catch (error) {
    console.error('[leads] Error:', error)
    return NextResponse.json(
      { error: 'Error al enviar tu información' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'new'

    const leads = await db.lead.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('[leads] Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
