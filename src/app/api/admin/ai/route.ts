import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getDb } from '@/lib/db'
import { canUseFeature } from '@/lib/plan-limits'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId
    const db = await getDb()

    // Fetch store to check plan
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { plan: true, name: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Check plan feature access
    if (!canUseFeature(store.plan, 'ai_assistant')) {
      return NextResponse.json(
        {
          error: 'El asistente de IA no está disponible en tu plan actual. Actualiza a Premium para acceder a esta funcionalidad.',
          code: 'PLAN_UPGRADE_REQUIRED',
        },
        { status: 403 }
      )
    }

    // Parse request body
    let body: { action: string; context?: Record<string, unknown> }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
    }

    const { action, context } = body

    // Initialize AI SDK
    const zai = await ZAI.create()

    // Build store context data
    const storeContext = await buildStoreContext(db, storeId, store.name, action)

    // Handle different actions
    let systemPrompt = ''
    let userMessage = ''

    switch (action) {
      case 'inventory_analysis': {
        systemPrompt = buildInventoryAnalysisPrompt(storeContext)
        userMessage = 'Analiza el inventario actual de la tienda y proporciona insights detallados sobre stock bajo, sugerencias de precios y distribución por categorías. Responde en español con formato claro y organizado usando listas.'
        break
      }

      case 'order_insights': {
        systemPrompt = buildOrderInsightsPrompt(storeContext)
        userMessage = 'Analiza los pedidos recientes de los últimos 30 días y proporciona insights sobre tendencias, productos más vendidos y patrones de ingresos. Responde en español con formato claro.'
        break
      }

      case 'restock_suggestions': {
        systemPrompt = buildRestockPrompt(storeContext)
        userMessage = 'Analiza la frecuencia de pedidos versus el inventario actual y sugiere qué productos reabastecer y en qué cantidades. Prioriza por urgencia. Responde en español.'
        break
      }

      case 'chat': {
        const message = (context?.message as string) || ''
        if (!message) {
          return NextResponse.json({ error: 'El mensaje es requerido para el chat' }, { status: 400 })
        }
        systemPrompt = buildChatPrompt(storeContext)
        userMessage = message
        break
      }

      default:
        return NextResponse.json(
          { error: `Acción no reconocida: ${action}` },
          { status: 400 }
        )
    }

    // Call AI
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'

    return NextResponse.json({ success: true, data: aiResponse, action })
  } catch (error) {
    console.error('[AI API] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud con IA. Por favor, intenta de nuevo.' },
      { status: 500 }
    )
  }
}

// ─── Store Context Builder ──────────────────────────────────────────────────

interface StoreContext {
  storeName: string
  products: {
    id: string
    name: string
    price: number
    comparePrice: number | null
    inStock: boolean
    category: string
    createdAt: string
    isFeatured: boolean
    isNew: boolean
    discount: number | null
  }[]
  orders: {
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
    items: { productName: string; quantity: number; price: number }[]
  }[]
  categories: { name: string; productCount: number }[]
  orderStats: {
    total: number
    totalRevenue: number
    pending: number
    delivered: number
    cancelled: number
    avgOrderValue: number
  }
}

async function buildStoreContext(
  db: Awaited<ReturnType<typeof getDb>>,
  storeId: string,
  storeName: string,
  action: string
): Promise<StoreContext> {
  // Fetch products
  const products = await db.product.findMany({
    where: { storeId },
    select: {
      id: true,
      name: true,
      price: true,
      comparePrice: true,
      inStock: true,
      category: { select: { name: true } },
      createdAt: true,
      isFeatured: true,
      isNew: true,
      discount: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch orders (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const orders = await db.order.findMany({
    where: { storeId, createdAt: { gte: thirtyDaysAgo } },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch categories with product counts
  const categories = await db.category.findMany({
    where: { storeId },
    select: {
      name: true,
      _count: { select: { products: true } },
    },
  })

  // Compute order stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pending = orders.filter((o) => o.status === 'pending').length
  const delivered = orders.filter((o) => o.status === 'delivered').length
  const cancelled = orders.filter((o) => o.status === 'cancelled').length
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return {
    storeName,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      comparePrice: p.comparePrice,
      inStock: p.inStock,
      category: p.category.name,
      createdAt: p.createdAt.toISOString(),
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      discount: p.discount,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
      })),
    })),
    categories: categories.map((c) => ({
      name: c.name,
      productCount: c._count.products,
    })),
    orderStats: {
      total: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pending,
      delivered,
      cancelled,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    },
  }
}

// ─── Prompt Builders ────────────────────────────────────────────────────────

function buildInventoryAnalysisPrompt(ctx: StoreContext): string {
  const productsSummary = ctx.products
    .map(
      (p) =>
        `- ${p.name} | Precio: S/ ${p.price.toFixed(2)} | ${
          p.comparePrice ? `Precio comparación: S/ ${p.comparePrice.toFixed(2)}` : 'Sin comparación'
        } | En stock: ${p.inStock ? 'Sí' : 'No'} | Categoría: ${p.category} | Destacado: ${p.isFeatured ? 'Sí' : 'No'} | Nuevo: ${p.isNew ? 'Sí' : 'No'}`
    )
    .join('\n')

  const categoriesSummary = ctx.categories
    .map((c) => `- ${c.name}: ${c.productCount} productos`)
    .join('\n')

  const outOfStock = ctx.products.filter((p) => !p.inStock).length
  const avgPrice = ctx.products.length > 0
    ? ctx.products.reduce((s, p) => s + p.price, 0) / ctx.products.length
    : 0

  return `Eres un asistente experto en gestión de tiendas online. Analiza el inventario de la siguiente tienda y proporciona insights accionables en español.

DATOS DE LA TIENDA:
Nombre: ${ctx.storeName}

RESUMEN DE INVENTARIO:
- Total de productos: ${ctx.products.length}
- Productos sin stock: ${outOfStock}
- Precio promedio: S/ ${avgPrice.toFixed(2)}

CATEGORÍAS:
${categoriesSummary}

PRODUCTOS:
${productsSummary}

Proporciona un análisis detallado que incluya:
1. **Resumen general del inventario** - Estado actual, fortalezas y debilidades
2. **Alertas de stock bajo/sin stock** - Productos que necesitan atención urgente
3. **Sugerencias de precios** - Productos donde podría ajustarse el precio, productos sin precio de comparación que podrían beneficiarse de uno
4. **Distribución por categorías** - Análisis de balance entre categorías
5. **Recomendaciones accionables** - Pasos concretos que el administrador puede tomar

Usa emojis para hacer el análisis más legible y formatos claros con listas numeradas.`
}

function buildOrderInsightsPrompt(ctx: StoreContext): string {
  const ordersSummary = ctx.orders
    .map(
      (o) =>
        `- Pedido #${o.orderNumber.slice(-6)} | Cliente: ${o.customerName} | Total: S/ ${o.total.toFixed(2)} | Estado: ${o.status} | Fecha: ${o.createdAt.split('T')[0]} | Items: ${o.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}`
    )
    .join('\n')

  // Calculate top products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const order of ctx.orders) {
    for (const item of order.items) {
      const existing = productSales.get(item.productName)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.price * item.quantity
      } else {
        productSales.set(item.productName, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        })
      }
    }
  }
  const topProducts = [...productSales.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(
      ([, v], i) =>
        `${i + 1}. ${v.name} - ${v.quantity} vendidos, S/ ${v.revenue.toFixed(2)} ingresos`
    )
    .join('\n')

  return `Eres un asistente experto en análisis de ventas para tiendas online. Analiza los pedidos recientes y proporciona insights valiosos en español.

DATOS DE LA TIENDA:
Nombre: ${ctx.storeName}

ESTADÍSTICAS DE PEDIDOS (últimos 30 días):
- Total de pedidos: ${ctx.orderStats.total}
- Ingresos totales: S/ ${ctx.orderStats.totalRevenue.toFixed(2)}
- Valor promedio por pedido: S/ ${ctx.orderStats.avgOrderValue.toFixed(2)}
- Pendientes: ${ctx.orderStats.pending}
- Entregados: ${ctx.orderStats.delivered}
- Cancelados: ${ctx.orderStats.cancelled}

PRODUCTOS MÁS VENDIDOS:
${topProducts || 'No hay datos suficientes'}

PEDIDOS RECIENTES:
${ordersSummary || 'No hay pedidos en los últimos 30 días'}

Proporciona un análisis detallado que incluya:
1. **Resumen de ventas** - Panorama general del período
2. **Tendencias observadas** - Patrones en las ventas, días o productos con más actividad
3. **Top productos** - Análisis de los productos más vendidos y por qué podrían destacar
4. **Patrones de ingresos** - Distribución de ingresos, oportunidades de crecimiento
5. **Recomendaciones** - Acciones concretas para mejorar las ventas

Usa emojis para hacer el análisis más legible y formatos claros con listas numeradas.`
}

function buildRestockPrompt(ctx: StoreContext): string {
  // Calculate product demand from orders
  const productDemand = new Map<string, { name: string; totalQuantity: number; lastOrdered: string }>()
  for (const order of ctx.orders) {
    for (const item of order.items) {
      const existing = productDemand.get(item.productName)
      if (existing) {
        existing.totalQuantity += item.quantity
        if (order.createdAt > existing.lastOrdered) {
          existing.lastOrdered = order.createdAt
        }
      } else {
        productDemand.set(item.productName, {
          name: item.productName,
          totalQuantity: item.quantity,
          lastOrdered: order.createdAt,
        })
      }
    }
  }

  // Build demand vs stock analysis
  const stockAnalysis = ctx.products.map((p) => {
    const demand = productDemand.get(p.name)
    return {
      name: p.name,
      price: p.price,
      inStock: p.inStock,
      demandQuantity: demand?.totalQuantity || 0,
      lastOrdered: demand?.lastOrdered || 'Nunca pedido',
      category: p.category,
    }
  })

  const analysisStr = stockAnalysis
    .map(
      (a) =>
        `- ${a.name} | En stock: ${a.inStock ? 'Sí' : 'NO'} | Demanda (30d): ${a.demandQuantity} unidades | Último pedido: ${a.lastOrdered.split('T')[0]} | Categoría: ${a.category}`
    )
    .join('\n')

  return `Eres un asistente experto en gestión de inventario para tiendas online. Analiza la demanda de productos versus el inventario actual y sugiere qué reabastecer y en qué prioridad.

DATOS DE LA TIENDA:
Nombre: ${ctx.storeName}

ANÁLISIS DEMANDA VS INVENTARIO (últimos 30 días):
${analysisStr || 'No hay datos suficientes'}

Proporciona una lista priorizada de reabastecimiento que incluya:
1. **Productos urgentes** - Sin stock pero con demanda activa (mayor prioridad)
2. **Productos a vigilar** - Con stock pero alta demanda (riesgo de agotarse)
3. **Sugerencias de cantidad** - Cantidad sugerida basada en la frecuencia de ventas
4. **Productos sin demanda** - Que podrían reducir inventario o descatalogarse
5. **Resumen ejecutivo** - Recomendaciones principales y acciones inmediatas

Ordena por prioridad de urgencia. Usa emojis (🚨, ⚠️, ✅, 💡) para indicar niveles de urgencia. Responde en español.`
}

function buildChatPrompt(ctx: StoreContext): string {
  const productsSummary = ctx.products
    .slice(0, 30)
    .map(
      (p) =>
        `- ${p.name} | Precio: S/ ${p.price.toFixed(2)} | Stock: ${p.inStock ? 'Sí' : 'No'} | Cat: ${p.category}`
    )
    .join('\n')

  const categoriesSummary = ctx.categories
    .map((c) => `- ${c.name}: ${c.productCount} productos`)
    .join('\n')

  return `Eres un asistente inteligente de gestión de tienda online para "${ctx.storeName}". Respondes preguntas del administrador sobre su tienda en español de forma clara y útil.

CONTEXTO ACTUAL DE LA TIENDA:

Inventario (${ctx.products.length} productos):
${productsSummary}

Categorías:
${categoriesSummary}

Estadísticas de pedidos (últimos 30 días):
- Total: ${ctx.orderStats.total} pedidos
- Ingresos: S/ ${ctx.orderStats.totalRevenue.toFixed(2)}
- Valor promedio: S/ ${ctx.orderStats.avgOrderValue.toFixed(2)}
- Pendientes: ${ctx.orderStats.pending} | Entregados: ${ctx.orderStats.delivered} | Cancelados: ${ctx.orderStats.cancelled}

REGLAS:
- Responde SIEMPRE en español
- Sé conciso pero informativo
- Usa emojis cuando sea apropiado para hacer la respuesta más legible
- Si la pregunta no está relacionada con la tienda, redirige amablemente
- Proporciona datos específicos de la tienda cuando sea relevante
- Usa listas numeradas para recomendaciones múltiples
- No inventes datos que no estén en el contexto proporcionado`
}
