import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Default content template for new stores
const DEFAULT_CONTENT: Record<string, Record<string, string>> = {
  announcement: {
    text: 'ENVÍO GRATIS en pedidos mayores a S/199',
    subtext: 'Pago seguro contra entrega',
  },
  hero: {
    badge: '🔥 Nueva Colección 2026',
    title1: 'Estilo urbano',
    title2: 'sin límites',
    subtitle: 'Ofertas exclusivas en streetwear. Descubre nuestra colección premium de ropa urbana con los mejores precios del mercado.',
    btnText1: 'Ver Colección',
    btnText2: 'Ver Ofertas',
    image1: '/images/hero/banner.png',
    image2: '/images/hero/banner-2.png',
    image3: '/images/hero/banner-3.png',
    stat1Icon: '⭐',
    stat1Value: '4.8/5',
    stat1Label: '+200 reseñas',
    stat2Icon: '🚚',
    stat2Value: 'Envío rápido',
    stat2Label: '1-3 días hábiles',
    trustText1: '✅ Envío gratis',
    trustText2: '💰 Pago contra entrega',
  },
  brands: {
    items: '["KUNA","ÑAÑA","MISTURA","ALPACA","TUMI","INTI","WAYKI","CHAKRA"]',
  },
  offers: {
    title: 'Ofertas',
    subtitle: 'Los mejores precios en productos seleccionados',
    btnText: 'Ver todo',
  },
  categories: {
    title: 'Explora por Categoría',
    subtitle: 'Encuentra exactamente lo que buscas',
  },
  about: {
    badge: 'Nuestra Historia',
    title: 'Mi Tienda',
    subtitle: 'Somos una marca que nace de la pasión por ofrecer lo mejor a nuestros clientes.',
    description: 'Cada producto es cuidadosamente seleccionado para garantizar la mejor calidad y experiencia de compra.',
    features: JSON.stringify([
      { icon: '✨', text: 'Calidad premium en cada producto' },
      { icon: '🧵', text: 'Materiales cuidadosamente seleccionados' },
      { icon: '🎨', text: 'Diseños exclusivos y originales' },
      { icon: '🚚', text: 'Envío a todo el país' },
    ]),
    image: '',
    btnText: 'Ver Catálogo',
  },
  features: {
    items: JSON.stringify([
      { icon: '🚚', title: 'Envío Gratis', desc: 'En pedidos +S/199' },
      { icon: '💬', title: 'WhatsApp', desc: 'Pedidos directos' },
      { icon: '💰', title: '0% Comisión', desc: 'Sin cargos extra' },
      { icon: '🔄', title: 'Devolución', desc: '30 días garantía' },
    ]),
  },
  testimonials: {
    title: 'Lo que dicen nuestros clientes',
    subtitle: 'Reseñas verificadas de compradores reales',
  },
  newsletter: {
    title: 'Recibe ofertas exclusivas',
    subtitle: 'Suscríbete y obtén un 10% de descuento en tu primera compra',
    placeholder: 'tu@email.com',
    btnText: 'Suscribirme',
    footer: 'Sin spam. Puedes darte de baja cuando quieras.',
  },
  stats: {
    items: JSON.stringify([
      { value: '+120', label: 'Negocios activos' },
      { value: '24/7', label: 'Siempre vendiendo' },
      { value: '0%', label: 'Comisión por venta' },
      { value: '+2K', label: 'Clientes felices' },
    ]),
  },
  cta: {
    title: '¿Listo para encontrar tu estilo?',
    subtitle: 'Únete a cientos de clientes que ya confiaron en nosotros.',
    btnText: 'Ver Catálogo Completo',
    footer: 'Envío gratis desde S/199 · Pago contra entrega · Garantía de 30 días',
  },
  footer: {
    shopLinks: '["Polos","Hoodies","Pantalones","Zapatos","Novedades"]',
    helpLinks: '["FAQ","Guía de tallas","Devoluciones","Contacto","Términos"]',
    contactAddress: '📍 Lima, Perú',
    contactPhone: '📞 +51 999 888 777',
    contactWhatsapp: '💬 WhatsApp 24/7',
    contactHours: '🕐 Lun-Sáb: 9am-8pm',
    copyright: '© 2026 Mi Tienda. Todos los derechos reservados.',
    creditsText: 'Creado y desarrollado por Tienda Online',
    creditsUrl: 'https://tienda-online-oficial.vercel.app/',
  },
  social: {
    links: '["facebook","instagram","tiktok"]',
  },
  faq: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre tu compra',
    items: JSON.stringify([
      { q: '¿Cuánto tarda el envío?', a: 'El envío es de 1 a 3 días hábiles a Lima y 3 a 7 días a provincias. Envío gratis en pedidos mayores a S/199.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos pago contra entrega, transferencia bancaria, y Yape/Plin. También puedes pagar con tarjeta a través de MercadoPago.' },
      { q: '¿Puedo devolver mi pedido?', a: 'Sí, tienes 30 días para devolver tu producto si no estás satisfecho. El producto debe estar en su estado original.' },
      { q: '¿Cómo hago mi pedido?', a: 'Puedes hacer tu pedido directamente por WhatsApp o a través de nuestra tienda online. Te guiaremos en cada paso.' },
      { q: '¿Las tallas son estándar?', a: 'Sí, nuestras tallas siguen la tabla de medidas peruanas estándar. Revisa nuestra guía de tallas para más detalles.' },
    ]),
  },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeSlug = searchParams.get('store') || 'urban-store'

    const db = await getDb()

    // Find store by slug
    const stores = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM Store WHERE slug = ${storeSlug}
    `
    const store = stores[0]

    if (!store) {
      // Return defaults for unknown stores
      return NextResponse.json({ ...DEFAULT_CONTENT, _fromDefault: true })
    }

    // Ensure StoreContent table exists (auto-create if missing)
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "StoreContent" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "storeId" TEXT NOT NULL,
          "section" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL DEFAULT '',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "StoreContent_storeId_section_key_key" UNIQUE("storeId", "section", "key"),
          FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)
    } catch {
      // Table creation may fail if it already exists with constraints
    }

    let rows: Array<{ section: string; key: string; value: string }> = []
    try {
      rows = await db.$queryRaw<{ section: string; key: string; value: string }[]>`
        SELECT section, key, value FROM StoreContent WHERE storeId = ${store.id}
      `
    } catch {
      // Query failed, will use defaults
    }

    // Build content: defaults merged with DB values
    const content: Record<string, Record<string, string>> = {}
    for (const [section, keys] of Object.entries(DEFAULT_CONTENT)) {
      content[section] = { ...keys }
    }

    // Override with DB values
    for (const row of rows) {
      if (!content[row.section]) content[row.section] = {}
      content[row.section][row.key] = row.value
    }

    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store',
      }
    })
  } catch (error) {
    console.error('[api/store-content GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ ...DEFAULT_CONTENT, _error: true })
  }
}
