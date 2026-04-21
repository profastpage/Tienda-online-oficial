import { getDb } from '@/lib/db'
import { requireStoreOwner } from '@/lib/api-auth'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// ── Spanish status labels ──────────────────────────────────────────────
const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

// ── CSV generation ─────────────────────────────────────────────────────
function generateCSV(orders: any[]): string {
  const headers = [
    'N° Pedido',
    'Cliente',
    'Teléfono',
    'Dirección',
    'Estado',
    'Total (S/)',
    'Productos',
    'Fecha',
  ]

  const rows = orders.map((order) => {
    const items =
      order.items
        ?.map((i: any) => `${i.productName} x${i.quantity}`)
        .join('; ') || ''
    return [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.customerAddress,
      statusLabel[order.status] || order.status,
      order.total.toFixed(2),
      items,
      new Date(order.createdAt).toLocaleDateString('es-PE'),
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

// ── PDF generation ─────────────────────────────────────────────────────
async function generatePDF(orders: any[], storeName: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const pageWidth = 595.28 // A4 width in points
  const margin = 40
  const usableWidth = pageWidth - margin * 2

  // Colors
  const colorPrimary = rgb(0.12, 0.12, 0.12) // dark gray
  const colorAccent = rgb(0.18, 0.18, 0.18) // near-black
  const colorMuted = rgb(0.45, 0.45, 0.45) // medium gray
  const colorBorder = rgb(0.85, 0.85, 0.85) // light gray
  const colorHeaderBg = rgb(0.06, 0.06, 0.06) // dark header background
  const colorHeaderText = rgb(1, 1, 1) // white header text
  const colorAltRow = rgb(0.97, 0.97, 0.97) // alternating row

  // ── Helper: add a new page and return page + y position ──
  let currentPage = pdfDoc.addPage([pageWidth, 841.89]) // A4
  let currentY = 841.89 - margin

  function ensureSpace(needed: number): void {
    if (currentY - needed < margin + 20) {
      currentPage = pdfDoc.addPage([pageWidth, 841.89])
      currentY = 841.89 - margin
      // Page number footer
      const pageCount = pdfDoc.getPageCount()
      currentPage.drawText(`Página ${pageCount}`, {
        x: pageWidth / 2 - 20,
        y: 25,
        size: 8,
        font: fontItalic,
        color: colorMuted,
      })
    }
  }

  // ── Header: Store name ──
  ensureSpace(80)
  currentY -= 10

  // Store name
  currentPage.drawText(storeName || 'Mi Tienda', {
    x: margin,
    y: currentY,
    size: 22,
    font: fontBold,
    color: colorPrimary,
  })
  currentY -= 28

  // Decorative line
  currentPage.drawRectangle({
    x: margin,
    y: currentY,
    width: 60,
    height: 3,
    color: colorAccent,
  })
  currentY -= 22

  // Subtitle with date
  const exportDate = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  currentPage.drawText(`Reporte de Pedidos — ${exportDate}`, {
    x: margin,
    y: currentY,
    size: 11,
    font: fontRegular,
    color: colorMuted,
  })
  currentY -= 30

  // ── Summary stats ──
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0)

  // Summary box
  ensureSpace(60)
  const summaryBoxHeight = 45
  currentPage.drawRectangle({
    x: margin,
    y: currentY - summaryBoxHeight,
    width: usableWidth,
    height: summaryBoxHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: colorBorder,
    borderWidth: 1,
    borderRadius: 4,
  })

  currentPage.drawText(`${totalOrders} pedido${totalOrders !== 1 ? 's' : ''}`, {
    x: margin + 14,
    y: currentY - 20,
    size: 12,
    font: fontBold,
    color: colorPrimary,
  })

  const revenueText = `Total: S/ ${totalRevenue.toFixed(2)}`
  const revenueTextWidth = fontBold.widthOfTextAtSize(revenueText, 12)
  currentPage.drawText(revenueText, {
    x: pageWidth - margin - 14 - revenueTextWidth,
    y: currentY - 20,
    size: 12,
    font: fontBold,
    color: colorAccent,
  })

  currentPage.drawText(`Generado el ${exportDate}`, {
    x: margin + 14,
    y: currentY - 38,
    size: 8,
    font: fontItalic,
    color: colorMuted,
  })

  currentY -= summaryBoxHeight + 25

  // ── Table ──
  const colWidths = [65, 95, 75, 85, 65, 60, 120, 70] // adjusted to fit ~635pt
  const tableHeaders = [
    'Pedido',
    'Cliente',
    'Teléfono',
    'Dirección',
    'Estado',
    'Total',
    'Productos',
    'Fecha',
  ]

  const headerHeight = 24
  const rowHeight = 22

  // Table header
  ensureSpace(headerHeight)
  currentPage.drawRectangle({
    x: margin,
    y: currentY - headerHeight,
    width: usableWidth,
    height: headerHeight,
    color: colorHeaderBg,
    borderRadius: 3,
  })

  let colX = margin
  tableHeaders.forEach((header, i) => {
    currentPage.drawText(header, {
      x: colX + 5,
      y: currentY - headerHeight + 7,
      size: 7.5,
      font: fontBold,
      color: colorHeaderText,
    })
    colX += colWidths[i]
  })
  currentY -= headerHeight

  // Table rows
  for (let rowIdx = 0; rowIdx < orders.length; rowIdx++) {
    const order = orders[rowIdx]
    const isAlt = rowIdx % 2 === 1

    ensureSpace(rowHeight + 5)

    // Alternating row background
    if (isAlt) {
      currentPage.drawRectangle({
        x: margin,
        y: currentY - rowHeight,
        width: usableWidth,
        height: rowHeight,
        color: colorAltRow,
      })
    }

    // Bottom border for each row
    currentPage.drawRectangle({
      x: margin,
      y: currentY - rowHeight,
      width: usableWidth,
      height: 0.5,
      color: colorBorder,
    })

    const items =
      order.items
        ?.map((i: any) => `${i.productName} x${i.quantity}`)
        .join(', ') || ''

    const rowValues = [
      order.orderNumber.slice(-8),
      truncateText(order.customerName, 13),
      truncateText(order.customerPhone || '—', 11),
      truncateText(order.customerAddress || '—', 11),
      statusLabel[order.status] || order.status,
      `S/ ${order.total.toFixed(2)}`,
      truncateText(items, 20),
      new Date(order.createdAt).toLocaleDateString('es-PE'),
    ]

    colX = margin
    rowValues.forEach((val, i) => {
      const text = String(val)
      const fontSize = 7
      const maxWidth = colWidths[i] - 8
      const truncated = fontRegular.widthOfTextAtSize(text, fontSize) > maxWidth
        ? truncateText(text, Math.floor(maxWidth / (fontRegular.widthOfTextAtSize('a', fontSize) * 0.6)))
        : text

      currentPage.drawText(truncated, {
        x: colX + 5,
        y: currentY - rowHeight + 8,
        size: fontSize,
        font: fontRegular,
        color: colorPrimary,
      })
      colX += colWidths[i]
    })

    currentY -= rowHeight
  }

  // ── Page numbers on existing pages ──
  const totalPages = pdfDoc.getPageCount()
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i)
    page.drawText(`Página ${i + 1} de ${totalPages}`, {
      x: pageWidth / 2 - 35,
      y: 25,
      size: 8,
      font: fontItalic,
      color: colorMuted,
    })
  }

  return pdfDoc.save()
}

// Truncate text to approximate character count
function truncateText(text: string, maxChars: number): string {
  if (!text) return ''
  return text.length > maxChars ? text.slice(0, maxChars - 1) + '…' : text
}

// ── Main GET handler ───────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    // Auth check — same pattern as /api/admin/orders
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)

    const storeId = searchParams.get('storeId') || auth.user.storeId
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!storeId) {
      return new Response(
        JSON.stringify({ error: 'No se encontró tienda asociada' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify store access (super-admin can access any store)
    if (auth.user.role !== 'super-admin' && storeId !== auth.user.storeId) {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build query filter
    const where: Record<string, unknown> = { storeId }
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.createdAt = {} as Record<string, unknown>
      if (dateFrom) {
        ;(where.createdAt as Record<string, unknown>).gte = new Date(dateFrom + 'T00:00:00.000Z')
      }
      if (dateTo) {
        ;(where.createdAt as Record<string, unknown>).lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    // Fetch orders with items
    let orders
    try {
      orders = await db.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })
    } catch (fetchErr) {
      console.error('[admin/orders/export] Fetch failed:', fetchErr instanceof Error ? fetchErr.message : fetchErr)
      orders = []
    }

    // Get store name for PDF header
    let storeName = 'Mi Tienda'
    try {
      const store = await db.store.findUnique({
        where: { id: storeId },
        select: { name: true },
      })
      if (store?.name) storeName = store.name
    } catch {
      // fallback to default
    }

    // ── CSV export ──
    if (format === 'csv') {
      const csv = generateCSV(orders)
      const filename = `pedidos_${storeName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // ── PDF export ──
    if (format === 'pdf') {
      const pdfBytes = await generatePDF(orders, storeName)
      const filename = `pedidos_${storeName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`

      return new Response(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Invalid format
    return new Response(
      JSON.stringify({ error: 'Formato no soportado. Usa csv o pdf.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[admin/orders/export] Unexpected error:', err instanceof Error ? err.message : err)
    return new Response(
      JSON.stringify({ error: 'Error al generar exportación', details: err instanceof Error ? err.message : 'Unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
