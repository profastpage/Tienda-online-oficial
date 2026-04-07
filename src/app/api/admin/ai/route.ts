import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getDb } from '@/lib/db'
import { canUseFeature } from '@/lib/plan-limits'

export async function POST(request: Request) {
  try {
    // 1. Auth
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const storeId = auth.user.storeId

    // 2. Parse body
    let body: { action: string; context?: Record<string, unknown> }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
    }

    const { action, context } = body

    if (!action || !['inventory_analysis', 'order_insights', 'restock_suggestions', 'chat'].includes(action)) {
      return NextResponse.json({ error: `Acción no reconocida: ${action || 'vacía'}` }, { status: 400 })
    }

    if (action === 'chat' && !(context?.message as string)?.trim()) {
      return NextResponse.json({ error: 'El mensaje es requerido para el chat' }, { status: 400 })
    }

    // 3. DB + plan check
    let plan = 'basico'
    let storeName = 'Mi Tienda'

    try {
      const db = await getDb()
      const store = await db.store.findUnique({
        where: { id: storeId },
        select: { plan: true, name: true },
      })
      if (store) {
        plan = store.plan
        storeName = store.name
      }
    } catch (dbErr) {
      console.warn('[AI API] DB lookup failed, using defaults:', dbErr)
    }

    if (!canUseFeature(plan, 'ai_assistant')) {
      return NextResponse.json(
        {
          error: 'El asistente de IA no está disponible en tu plan actual. Actualiza a Premium para acceder a esta funcionalidad.',
          code: 'PLAN_UPGRADE_REQUIRED',
        },
        { status: 403 }
      )
    }

    // 4. Build store context (resilient — each query independently)
    const storeContext = await buildStoreContextSafe(storeId, storeName)

    // 5. Build prompts
    const { systemPrompt, userMessage } = buildPrompts(action, storeContext, context)

    // 6. Call AI with timeout + fallback
    let aiResponse = await callAIWithFallback(systemPrompt, userMessage, action, storeContext)

    return NextResponse.json({ success: true, data: aiResponse, action })
  } catch (error) {
    console.error('[AI API] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud con IA. Por favor, intenta de nuevo.' },
      { status: 500 }
    )
  }
}

// ─── AI Call with Timeout + Fallback ─────────────────────────────────────────

async function callAIWithFallback(
  systemPrompt: string,
  userMessage: string,
  action: string,
  ctx: StoreContext
): Promise<string> {
  // Try ZAI SDK
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    // Race between AI call and 30s timeout
    const aiPromise = zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 30000)
    )

    const result = await Promise.race([aiPromise, timeoutPromise])

    if (result && result.choices?.[0]?.message?.content) {
      return result.choices[0].message.content
    }
    console.warn('[AI API] AI returned empty or timed out, using fallback')
  } catch (aiErr) {
    console.error('[AI API] AI call failed:', aiErr)
  }

  // Fallback: generate a data-driven response without AI
  return generateFallbackResponse(action, ctx)
}

// ─── Fallback Responses (no AI needed) ───────────────────────────────────────

function generateFallbackResponse(action: string, ctx: StoreContext): string {
  switch (action) {
    case 'inventory_analysis':
      return generateInventoryFallback(ctx)
    case 'order_insights':
      return generateOrderInsightsFallback(ctx)
    case 'restock_suggestions':
      return generateRestockFallback(ctx)
    case 'chat':
      return `💡 Aquí un resumen rápido de tu tienda **${ctx.storeName}**:\n\n📦 **Productos:** ${ctx.products.length} registrados\n📋 **Categorías:** ${ctx.categories.length}\n🛒 **Pedidos (30d):** ${ctx.orderStats.total}\n💰 **Ingresos:** S/ ${ctx.orderStats.totalRevenue.toFixed(2)}\n\nEscribe una pregunta específica o usa las acciones rápidas para un análisis detallado.`
    default:
      return 'Lo siento, no pude generar una respuesta en este momento. Intenta de nuevo.'
  }
}

function generateInventoryFallback(ctx: StoreContext): string {
  const outOfStock = ctx.products.filter((p) => !p.inStock)
  const featured = ctx.products.filter((p) => p.isFeatured)
  const withoutCompare = ctx.products.filter((p) => !p.comparePrice)
  const avgPrice = ctx.products.length > 0 ? ctx.products.reduce((s, p) => s + p.price, 0) / ctx.products.length : 0
  const byCategory = ctx.categories.map((c) => `  - ${c.name}: ${c.productCount} productos`).join('\n')

  let report = `## 📊 Análisis de Inventario — ${ctx.storeName}\n\n`
  report += `**Resumen General:**\n  - Total de productos: ${ctx.products.length}\n  - Precio promedio: S/ ${avgPrice.toFixed(2)}\n  - Productos destacados: ${featured.length}\n  - Sin precio de comparación: ${withoutCompare.length}\n\n`

  if (outOfStock.length > 0) {
    report += `🚨 **Productos sin stock (${outOfStock.length}):**\n`
    outOfStock.forEach((p) => { report += `  - ${p.name} (S/ ${p.price.toFixed(2)})\n` })
    report += '\n'
  } else {
    report += '✅ Todos los productos están en stock.\n\n'
  }

  report += `**Distribución por categorías:**\n${byCategory}\n\n`

  if (withoutCompare.length > 0 && withoutCompare.length <= 10) {
    report += `💡 **Sugerencia:** Agrega precios de comparación a estos productos para mostrar descuentos:\n`
    withoutCompare.forEach((p) => { report += `  - ${p.name}\n` })
  }

  return report
}

function generateOrderInsightsFallback(ctx: StoreContext): string {
  const s = ctx.orderStats
  let report = `## 🛒 Insights de Pedidos — ${ctx.storeName}\n\n`
  report += `**Estadísticas (últimos 30 días):**\n`
  report += `  - Total de pedidos: ${s.total}\n`
  report += `  - Ingresos totales: S/ ${s.totalRevenue.toFixed(2)}\n`
  report += `  - Valor promedio: S/ ${s.avgOrderValue.toFixed(2)}\n`
  report += `  - Pendientes: ${s.pending} | Entregados: ${s.delivered} | Cancelados: ${s.cancelled}\n\n`

  if (ctx.orders.length > 0) {
    // Top products by sales
    const productSales = new Map<string, { qty: number; rev: number }>()
    for (const o of ctx.orders) {
      for (const i of o.items) {
        const e = productSales.get(i.productName)
        if (e) { e.qty += i.quantity; e.rev += i.price * i.quantity }
        else { productSales.set(i.productName, { qty: i.quantity, rev: i.price * i.quantity }) }
      }
    }
    const top = [...productSales.entries()].sort((a, b) => b[1].rev - a[1].rev).slice(0, 5)

    if (top.length > 0) {
      report += `🏆 **Top 5 productos más vendidos:**\n`
      top.forEach(([name, d], i) => { report += `  ${i + 1}. ${name} — ${d.qty} uds, S/ ${d.rev.toFixed(2)}\n` })
      report += '\n'
    }

    const delivered = ctx.orders.filter((o) => o.status === 'delivered')
    if (delivered.length > 0) {
      report += `📦 **Últimos pedidos entregados:**\n`
      delivered.slice(0, 5).forEach((o) => {
        report += `  - #${o.orderNumber.slice(-6)} | ${o.customerName} | S/ ${o.total.toFixed(2)}\n`
      })
    }
  } else {
    report += '📭 No hay pedidos en los últimos 30 días. ¡Anima a tus clientes con promociones!'
  }

  return report
}

function generateRestockFallback(ctx: StoreContext): string {
  // Calculate demand
  const demand = new Map<string, number>()
  for (const o of ctx.orders) {
    for (const i of o.items) {
      demand.set(i.productName, (demand.get(i.productName) || 0) + i.quantity)
    }
  }

  const urgent: string[] = []
  const watch: string[] = []
  const noDemand: string[] = []

  for (const p of ctx.products) {
    const d = demand.get(p.name) || 0
    if (!p.inStock && d > 0) {
      urgent.push(`🚨 **${p.name}** — Sin stock, ${d} uds vendidas en 30d → Sugerido: ${Math.max(d * 2, 5)} uds`)
    } else if (p.inStock && d > 3) {
      watch.push(`⚠️ **${p.name}** — En stock, alta demanda (${d} uds/30d) → Vigilar nivel`)
    } else if (d === 0) {
      noDemand.push(`💡 ${p.name} — Sin ventas en 30d`)
    }
  }

  let report = `## 🔄 Sugerencias de Reabastecimiento — ${ctx.storeName}\n\n`

  if (urgent.length > 0) {
    report += `**URGENTE — Sin stock con demanda:**\n${urgent.join('\n')}\n\n`
  } else {
    report += '✅ No hay productos sin stock que tengan demanda activa.\n\n'
  }

  if (watch.length > 0) {
    report += `**A VIGILAR — Alto riesgo de agotarse:**\n${watch.join('\n')}\n\n`
  }

  if (noDemand.length > 0) {
    report += `**SIN DEMANDA (${noDemand.length} productos):**\n`
    noDemand.slice(0, 10).forEach((p) => { report += `  ${p}\n` })
    if (noDemand.length > 10) report += `  ... y ${noDemand.length - 10} más`
  }

  return report
}

// ─── Store Context (Resilient) ───────────────────────────────────────────────

interface StoreContext {
  storeName: string
  products: { name: string; price: number; comparePrice: number | null; inStock: boolean; category: string; isFeatured: boolean; isNew: boolean }[]
  orders: { orderNumber: string; customerName: string; total: number; status: string; items: { productName: string; quantity: number; price: number }[] }[]
  categories: { name: string; productCount: number }[]
  orderStats: { total: number; totalRevenue: number; pending: number; delivered: number; cancelled: number; avgOrderValue: number }
}

async function buildStoreContextSafe(storeId: string, storeName: string): Promise<StoreContext> {
  let products: StoreContext['products'] = []
  let orders: StoreContext['orders'] = []
  let categories: StoreContext['categories'] = []

  try {
    const db = await getDb()

    // Products — with null-safe category
    try {
      const raw = await db.product.findMany({
        where: { storeId },
        select: {
          name: true, price: true, comparePrice: true, inStock: true,
          category: { select: { name: true } },
          isFeatured: true, isNew: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      products = raw.map((p) => ({
        name: p.name,
        price: p.price,
        comparePrice: p.comparePrice,
        inStock: p.inStock,
        category: p.category?.name || 'Sin categoría',
        isFeatured: p.isFeatured,
        isNew: p.isNew,
      }))
    } catch (e) {
      console.warn('[AI API] Products query failed:', e)
    }

    // Orders (last 30 days) — with null-safe items
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const raw = await db.order.findMany({
        where: { storeId, createdAt: { gte: thirtyDaysAgo } },
        select: {
          orderNumber: true, customerName: true, total: true, status: true,
          items: { select: { productName: true, quantity: true, price: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      orders = raw.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        items: (o.items || []).map((i) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
      }))
    } catch (e) {
      console.warn('[AI API] Orders query failed:', e)
    }

    // Categories
    try {
      const raw = await db.category.findMany({
        where: { storeId },
        select: { name: true, _count: { select: { products: true } } },
      })
      categories = raw.map((c) => ({ name: c.name, productCount: c._count.products }))
    } catch (e) {
      console.warn('[AI API] Categories query failed:', e)
    }
  } catch (dbErr) {
    console.warn('[AI API] DB connection failed, using empty context:', dbErr)
  }

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  return {
    storeName,
    products,
    orders,
    categories,
    orderStats: {
      total: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pending: orders.filter((o) => o.status === 'pending').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      avgOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
    },
  }
}

// ─── Prompt Builders ────────────────────────────────────────────────────────

function buildPrompts(
  action: string,
  ctx: StoreContext,
  context?: Record<string, unknown>
): { systemPrompt: string; userMessage: string } {
  switch (action) {
    case 'inventory_analysis': {
      const productsStr = ctx.products.map((p) =>
        `- ${p.name} | S/ ${p.price.toFixed(2)} | Stock: ${p.inStock ? 'Sí' : 'NO'} | Cat: ${p.category}`
      ).join('\n')
      const catsStr = ctx.categories.map((c) => `- ${c.name}: ${c.productCount}`).join('\n')

      return {
        systemPrompt: `Eres un asistente experto en gestión de tiendas online. Analiza el inventario y proporciona insights en español.

TIENDA: ${ctx.storeName}
PRODUCTOS (${ctx.products.length}):
${productsStr || 'Sin productos'}
CATEGORÍAS:
${catsStr || 'Sin categorías'}

Responde con:
1. **Resumen general** del inventario
2. **Alertas de stock** (sin stock o bajo)
3. **Sugerencias de precios**
4. **Distribución por categorías**
5. **Recomendaciones accionables**

Usa emojis y listas numeradas.`,
        userMessage: 'Analiza el inventario actual y proporciona insights detallados.',
      }
    }

    case 'order_insights': {
      const ordersStr = ctx.orders.slice(0, 20).map((o) =>
        `- #${o.orderNumber.slice(-6)} | ${o.customerName} | S/ ${o.total.toFixed(2)} | ${o.status} | Items: ${o.items.map((i) => `${i.productName}(x${i.quantity})`).join(', ')}`
      ).join('\n')

      // Top products
      const sales = new Map<string, { qty: number; rev: number }>()
      for (const o of ctx.orders) for (const i of o.items) {
        const e = sales.get(i.productName)
        if (e) { e.qty += i.quantity; e.rev += i.price * i.quantity }
        else sales.set(i.productName, { qty: i.quantity, rev: i.price * i.quantity })
      }
      const top = [...sales.entries()].sort((a, b) => b[1].rev - a[1].rev).slice(0, 10)
        .map(([n, d], i) => `${i + 1}. ${n}: ${d.qty} uds, S/ ${d.rev.toFixed(2)}`).join('\n')

      const s = ctx.orderStats

      return {
        systemPrompt: `Eres un asistente experto en análisis de ventas. Analiza pedidos recientes en español.

TIENDA: ${ctx.storeName}
PEDIDOS (30d): ${s.total} | Ingresos: S/ ${s.totalRevenue.toFixed(2)} | Promedio: S/ ${s.avgOrderValue.toFixed(2)}
Pendientes: ${s.pending} | Entregados: ${s.delivered} | Cancelados: ${s.cancelled}

TOP PRODUCTOS:
${top || 'Sin datos'}

PEDIDOS RECIENTES:
${ordersStr || 'Sin pedidos'}

Responde con:
1. **Resumen de ventas**
2. **Tendencias**
3. **Top productos** con análisis
4. **Patrones de ingresos**
5. **Recomendaciones**

Usa emojis y listas.`,
        userMessage: 'Analiza los pedidos recientes y proporciona insights.',
      }
    }

    case 'restock_suggestions': {
      const demand = new Map<string, number>()
      for (const o of ctx.orders) for (const i of o.items) demand.set(i.productName, (demand.get(i.productName) || 0) + i.quantity)

      const analysis = ctx.products.map((p) => {
        const d = demand.get(p.name) || 0
        return `- ${p.name} | Stock: ${p.inStock ? 'Sí' : 'NO'} | Demanda 30d: ${d} uds | Cat: ${p.category}`
      }).join('\n')

      return {
        systemPrompt: `Eres un asistente experto en gestión de inventario. Sugiere reabastecimiento en español.

TIENDA: ${ctx.storeName}
DEMANDA VS INVENTARIO:
${analysis || 'Sin datos'}

Responde con lista priorizada:
1. **Urgentes** — sin stock con demanda
2. **A vigilar** — stock bajo con alta demanda
3. **Sugerencias de cantidad**
4. **Sin demanda** — descatalogar
5. **Resumen ejecutivo**

Usa emojis 🚨⚠️✅💡 para urgencia.`,
        userMessage: 'Sugiere qué productos reabastecer y en qué prioridad.',
      }
    }

    case 'chat': {
      const prods = ctx.products.slice(0, 30).map((p) =>
        `- ${p.name} | S/ ${p.price.toFixed(2)} | Stock: ${p.inStock ? 'Sí' : 'No'}`
      ).join('\n')
      const cats = ctx.categories.map((c) => `- ${c.name}: ${c.productCount}`).join('\n')
      const s = ctx.orderStats
      const message = (context?.message as string) || ''

      return {
        systemPrompt: `Eres un asistente inteligente de gestión de tienda online para "${ctx.storeName}". Respondes en español.

INVENTARIO (${ctx.products.length}):
${prods}

CATEGORÍAS:
${cats}

PEDIDOS (30d): ${s.total} | Ingresos: S/ ${s.totalRevenue.toFixed(2)} | Promedio: S/ ${s.avgOrderValue.toFixed(2)}

REGLAS: Respuesta en español, conciso, con emojis, datos reales de la tienda, sin inventar datos.`,
        userMessage: message,
      }
    }

    default:
      return {
        systemPrompt: 'Eres un asistente útil.',
        userMessage: 'Hola',
      }
  }
}
