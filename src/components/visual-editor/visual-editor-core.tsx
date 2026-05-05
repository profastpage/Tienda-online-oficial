'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Monitor, Smartphone, Tablet, Plus, Trash2, GripVertical,
  Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, X,
  LayoutDashboard, Copy, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { InlineBlockRenderer, BLOCK_TYPES } from './inline-block-renderer'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface BlockData {
  id: string
  blockType: string
  sortIndex: number
  isActive: boolean
  data: Record<string, any>
}

interface StorePageData {
  id?: string
  title: string
  pageType: string
  isPublished: boolean
  layout: BlockData[]
}

const BLOCK_TYPES_FULL = [
  { type: 'hero-block', label: 'Hero Banner', icon: '🎯', description: 'Banner principal con imagen, título y botón CTA' },
  { type: 'banner-block', label: 'Banner Promo', icon: '📢', description: 'Banner promocional con imagen y texto' },
  { type: 'product-gallery-block', label: 'Galería de Productos', icon: '🛍️', description: 'Muestra productos destacados, nuevos o en oferta' },
  { type: 'text-block', label: 'Bloque de Texto', icon: '📝', description: 'Contenido de texto enriquecido' },
  { type: 'features-block', label: 'Features/Beneficios', icon: '✨', description: 'Grid de beneficios o características' },
  { type: 'testimonials-block', label: 'Testimonios', icon: '⭐', description: 'Carrusel de reseñas de clientes' },
  { type: 'faq-block', label: 'Preguntas Frecuentes', icon: '❓', description: 'Sección de FAQ con acordeón' },
  { type: 'newsletter-block', label: 'Newsletter', icon: '📧', description: 'Formulario de suscripción por email' },
  { type: 'stats-block', label: 'Estadísticas', icon: '📊', description: 'Números y métricas destacadas' },
  { type: 'cta-block', label: 'Llamada a la Acción', icon: '🚀', description: 'Bloque CTA con botones' },
  { type: 'spacer-block', label: 'Espaciador', icon: '↕️', description: 'Espacio en blanco entre secciones' },
  { type: 'divider-block', label: 'Divisor', icon: '➖', description: 'Línea divisoria entre secciones' },
]

// ═══════════════════════════════════════════════════════════
// Visual Editor Core — Inline Editing Architecture
// No iframe, no right panel. All editing happens directly on blocks.
// ═══════════════════════════════════════════════════════════

export default function VisualEditorCore({ storeSlug, user }: { storeSlug: string; user: any }) {
  const { toast } = useToast()

  // State
  const [pageData, setPageData] = useState<StorePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const token = user?.token || ''
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Device dimensions
  const deviceDimensions = {
    mobile: { width: 390, height: 844 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: '100%' as string | number, height: '100%' as string | number },
  }

  // ═══ FETCH PAGE DATA ═══

  const fetchPageData = useCallback(async () => {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/payload?path=/api/store-pages&where[storeSlug][equals]=${storeSlug}&where[pageType][equals]=home&limit=1`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.docs && data.docs.length > 0) {
          const page = data.docs[0]
          const layout = (page.layout || []).map((block: any, index: number) => ({
            id: block.id || `block-${index}`,
            blockType: block.blockType,
            sortIndex: index,
            isActive: true,
            data: block,
          }))
          setPageData({
            id: page.id,
            title: page.title,
            pageType: page.pageType,
            isPublished: page.isPublished,
            layout,
          })
        } else {
          // No page found — create default layout
          setPageData({
            title: 'Página Principal',
            pageType: 'home',
            isPublished: true,
            layout: [
              createDefaultBlock('hero-block', 0),
              createDefaultBlock('product-gallery-block', 1),
              createDefaultBlock('features-block', 2),
              createDefaultBlock('spacer-block', 3),
            ],
          })
        }
      } else {
        // API returned non-OK status (500, 503, etc.)
        // Show editor with default blocks anyway so user can still design
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
        console.warn('[VisualEditor] API error:', res.status, errorData.error)
        setPageData({
          title: 'Página Principal',
          pageType: 'home',
          isPublished: true,
          layout: [
            createDefaultBlock('hero-block', 0),
            createDefaultBlock('product-gallery-block', 1),
            createDefaultBlock('features-block', 2),
            createDefaultBlock('spacer-block', 3),
          ],
        })
        toast({
          title: 'Modo offline',
          description: 'No se pudo conectar a la base de datos. Puedes editar y guardar más tarde.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('[VisualEditor] Fetch error:', err)
      // Even on network error, show the editor with default blocks
      setPageData({
        title: 'Página Principal',
        pageType: 'home',
        isPublished: true,
        layout: [
          createDefaultBlock('hero-block', 0),
          createDefaultBlock('product-gallery-block', 1),
          createDefaultBlock('features-block', 2),
          createDefaultBlock('spacer-block', 3),
        ],
      })
      toast({ title: 'Error de conexión', description: 'El editor funciona en modo offline. Puedes diseñar y guardar cuando se restaure la conexión.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [storeSlug, token, toast])

  useEffect(() => { fetchPageData() }, [fetchPageData])

  // ═══ SCROLL TO BLOCK ═══

  useEffect(() => {
    if (!selectedBlockId) return
    const el = document.getElementById(`inline-block-${selectedBlockId}`)
    if (el && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const scrollOffset = elRect.top - containerRect.top + container.scrollTop - 60
      container.scrollTo({ top: scrollOffset, behavior: 'smooth' })
    }
  }, [selectedBlockId])

  // ═══ BLOCK OPERATIONS ═══

  function createDefaultBlock(type: string, index: number): BlockData {
    const defaults: Record<string, Record<string, any>> = {
      'hero-block': { blockType: 'hero-block', badge: 'Nueva Colección', title: 'Bienvenido a nuestra Tienda', subtitle: 'Descubre los mejores productos', ctaText: 'Comprar Ahora', ctaLink: '#products', textColor: 'white', alignment: 'center', fullHeight: true, overlayOpacity: 30 },
      'banner-block': { blockType: 'banner-block', title: 'Oferta Especial', description: 'Hasta 50% de descuento en productos seleccionados', variant: 'primary', showOnMobile: true },
      'product-gallery-block': { blockType: 'product-gallery-block', title: 'Productos Destacados', productSource: 'featured', maxProducts: 8, layout: 'grid', showButton: true, buttonText: 'Ver Todo' },
      'text-block': { blockType: 'text-block', content: '', alignment: 'left', backgroundColor: 'transparent' },
      'features-block': { blockType: 'features-block', title: '¿Por qué elegirnos?', features: [{ icon: '🚚', title: 'Envío Gratis', description: 'En pedidos +S/199' }, { icon: '💬', title: 'WhatsApp', description: 'Pedidos directos' }, { icon: '💰', title: '0% Comisión', description: 'Sin cargos extra' }, { icon: '🔄', title: 'Devolución', description: '30 días garantía' }] },
      'testimonials-block': { blockType: 'testimonials-block', title: 'Lo que dicen nuestros clientes', source: 'dynamic', layout: 'carousel' },
      'faq-block': { blockType: 'faq-block', title: 'Preguntas Frecuentes', source: 'dynamic' },
      'newsletter-block': { blockType: 'newsletter-block', title: 'Recibe ofertas exclusivas', subtitle: 'Suscríbete y obtén un 10% de descuento', placeholder: 'tu@email.com', buttonText: 'Suscribirme', disclaimer: 'Sin spam. Puedes darte de baja cuando quieras.' },
      'stats-block': { blockType: 'stats-block', items: [{ value: '+120', label: 'Negocios activos' }, { value: '24/7', label: 'Siempre vendiendo' }, { value: '0%', label: 'Comisión' }, { value: '+2K', label: 'Clientes felices' }], backgroundColor: 'primary' },
      'cta-block': { blockType: 'cta-block', title: '¿Listo para encontrar tu estilo?', subtitle: 'Únete a cientos de clientes que ya confiaron en nosotros.', variant: 'gradient' },
      'spacer-block': { blockType: 'spacer-block', height: 'md' },
      'divider-block': { blockType: 'divider-block', variant: 'solid', margin: 'normal' },
    }
    return {
      id: `new-${Date.now()}-${index}`,
      blockType: type,
      sortIndex: index,
      isActive: true,
      data: defaults[type] || { blockType: type },
    }
  }

  function addBlock(type: string) {
    if (!pageData) return
    const newBlock = createDefaultBlock(type, pageData.layout.length)
    setPageData(prev => prev ? {
      ...prev,
      layout: [...prev.layout, newBlock],
    } : null)
    setSelectedBlockId(newBlock.id)
    setShowAddBlock(false)
    toast({ title: `Bloque "${BLOCK_TYPES_FULL.find(b => b.type === type)?.label}" agregado` })
  }

  function removeBlock(id: string) {
    if (!pageData) return
    setPageData(prev => prev ? {
      ...prev,
      layout: prev.layout.filter(b => b.id !== id),
    } : null)
    if (selectedBlockId === id) setSelectedBlockId(null)
    toast({ title: 'Bloque eliminado' })
  }

  function duplicateBlock(id: string) {
    if (!pageData) return
    const block = pageData.layout.find(b => b.id === id)
    if (!block) return
    const newBlock = { ...block, id: `dup-${Date.now()}`, data: { ...block.data } }
    const idx = pageData.layout.findIndex(b => b.id === id)
    const newLayout = [...pageData.layout]
    newLayout.splice(idx + 1, 0, newBlock)
    setPageData(prev => prev ? { ...prev, layout: newLayout } : null)
    setSelectedBlockId(newBlock.id)
    toast({ title: 'Bloque duplicado' })
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    if (!pageData) return
    const newLayout = [...pageData.layout]
    const [moved] = newLayout.splice(fromIndex, 1)
    newLayout.splice(toIndex, 0, moved)
    setPageData(prev => prev ? { ...prev, layout: newLayout } : null)
  }

  function toggleBlockVisibility(id: string) {
    if (!pageData) return
    setPageData(prev => prev ? {
      ...prev,
      layout: prev.layout.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b),
    } : null)
  }

  function updateBlockField(id: string, field: string, value: any) {
    if (!pageData) return
    setPageData(prev => prev ? {
      ...prev,
      layout: prev.layout.map(b => b.id === id ? {
        ...b,
        data: { ...b.data, [field]: value },
      } : b),
    } : null)
  }

  // ═══ SAVE PAGE ═══

  const savePage = async () => {
    if (!pageData) return
    setSaving(true)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const layoutPayload = pageData.layout.map((block, index) => ({
        ...block.data,
        blockType: block.blockType,
        sortIndex: index,
      }))

      if (pageData.id) {
        const res = await fetch(`/api/payload?path=/api/store-pages/${pageData.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ layout: layoutPayload }),
        })
        if (res.ok) {
          toast({ title: 'Página guardada', description: 'Los cambios se guardaron correctamente' })
        } else {
          toast({ title: 'Error al guardar', variant: 'destructive' })
        }
      } else {
        const res = await fetch('/api/payload?path=/api/store-pages', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: pageData.title,
            storeSlug,
            storeId: user?.storeId || '',
            pageType: 'home',
            isPublished: pageData.isPublished,
            layout: layoutPayload,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setPageData(prev => prev ? { ...prev, id: data.doc.id } : null)
          toast({ title: 'Página creada', description: 'La página se guardó correctamente' })
        } else {
          toast({ title: 'Error al crear', variant: 'destructive' })
        }
      }
    } catch {
      toast({ title: 'Error de conexion', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ═══ BLOCK PREVIEW TEXT ═══

  function getBlockPreviewText(block: BlockData): string {
    const d = block.data
    switch (block.blockType) {
      case 'hero-block': return d.title || 'Sin título'
      case 'banner-block': return d.title || 'Sin título'
      case 'product-gallery-block': return d.title || 'Productos'
      case 'text-block': return (d.content || '').substring(0, 30) || 'Sin contenido'
      case 'features-block': return d.title || 'Features'
      case 'testimonials-block': return d.title || 'Testimonios'
      case 'faq-block': return d.title || 'FAQ'
      case 'newsletter-block': return d.title || 'Newsletter'
      case 'stats-block': return `${(d.items || []).length} estadísticas`
      case 'cta-block': return d.title || 'CTA'
      case 'spacer-block': return `Espacio: ${d.height || 'md'}`
      case 'divider-block': return `Divisor: ${d.variant || 'solid'}`
      default: return block.blockType
    }
  }

  // ═══ RENDER ═══

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-neutral-400">Cargando editor visual...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* ═══ TOP BAR ═══ */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 shrink-0 bg-neutral-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">Editor Visual</span>
            <Badge variant="outline" className="text-[10px] bg-neutral-800 border-neutral-700 text-neutral-400">{storeSlug}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Device Toggle */}
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5">
            {[
              { key: 'mobile' as const, icon: Smartphone, label: 'Móvil' },
              { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
              { key: 'desktop' as const, icon: Monitor, label: 'Escritorio' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setPreviewDevice(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  previewDevice === key ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6 bg-neutral-800 mx-1" />

          {/* Publish Toggle */}
          <div className="flex items-center gap-1.5">
            <Switch
              checked={pageData?.isPublished}
              onCheckedChange={(checked) => setPageData(prev => prev ? { ...prev, isPublished: checked } : null)}
              className="data-[state=checked]:bg-green-600"
            />
            <span className="text-[10px] text-neutral-400 hidden sm:inline">{pageData?.isPublished ? 'Publicado' : 'Borrador'}</span>
          </div>

          <Separator orientation="vertical" className="h-6 bg-neutral-800 mx-1" />

          {/* Save Button */}
          <Button
            size="sm"
            onClick={savePage}
            disabled={saving}
            className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>

          {/* View Live */}
          <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800">
              <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ver Tienda</span>
            </Button>
          </a>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT PANEL: Block List (collapsible) ─── */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 272, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-neutral-800 bg-neutral-900/50 flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Bloques ({pageData?.layout.length || 0})
                </span>
                <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 px-2">
                      <Plus className="w-3 h-3" /> Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-neutral-900 border-neutral-800 max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Agregar Bloque</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {BLOCK_TYPES_FULL.map(block => (
                        <button
                          key={block.type}
                          onClick={() => addBlock(block.type)}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-800 hover:border-blue-600 hover:bg-blue-600/5 transition-all text-left group"
                        >
                          <span className="text-2xl shrink-0">{block.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-blue-400">{block.label}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{block.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Block List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {pageData?.layout.map((block, index) => {
                    const blockDef = BLOCK_TYPES_FULL.find(b => b.type === block.blockType)
                    const isSelected = selectedBlockId === block.id
                    return (
                      <motion.div
                        key={block.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: block.isActive ? 1 : 0.4, y: 0 }}
                        className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-600/20 border border-blue-600/40' : 'border border-transparent hover:bg-neutral-800/60'
                        } ${!block.isActive ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedBlockId(isSelected ? null : block.id)}
                        onDragStart={() => {}}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
                        onDrop={() => { if (dragOverIndex !== null && dragOverIndex !== index) moveBlock(index, dragOverIndex); setDragOverIndex(null) }}
                      >
                        <div className="cursor-grab text-neutral-600 hover:text-neutral-400">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-lg shrink-0">{blockDef?.icon || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-200 truncate">{blockDef?.label || block.blockType}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{getBlockPreviewText(block)}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); toggleBlockVisibility(block.id) }} className="p-1 rounded hover:bg-neutral-700 text-neutral-500">
                            {block.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }} className="p-1 rounded hover:bg-neutral-700 text-neutral-500">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }} className="p-1 rounded hover:bg-red-600/20 text-neutral-500 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {dragOverIndex === index && <div className="absolute left-0 top-0 w-0.5 h-full bg-blue-500 rounded" />}
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CENTER: Direct Inline Block Rendering ─── */}
        <div className="flex-1 bg-neutral-950 flex flex-col overflow-hidden relative">
          {/* Toggle panel button */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="absolute top-3 left-3 z-20 w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-lg"
            title={showLeftPanel ? 'Ocultar panel' : 'Mostrar panel'}
          >
            {showLeftPanel ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          {/* Click on empty area to deselect */}
          <div
            className="flex-1 flex items-start justify-center p-4 pt-12 overflow-auto"
            ref={scrollContainerRef}
            onClick={() => setSelectedBlockId(null)}
          >
            <div
              className="bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-300 flex-shrink-0"
              style={{
                width: previewDevice === 'desktop' ? '100%' : (deviceDimensions[previewDevice].width as number),
                height: previewDevice === 'desktop' ? '100%' : (deviceDimensions[previewDevice].height as number),
                maxWidth: previewDevice === 'desktop' ? '100%' : undefined,
              }}
              onClick={(e) => {
                // Only deselect if clicking the viewport background itself
                if (e.target === e.currentTarget) {
                  setSelectedBlockId(null)
                }
              }}
            >
              {pageData?.layout && pageData.layout.length > 0 ? (
                <InlineBlockRenderer
                  blocks={pageData.layout}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onUpdateBlockField={updateBlockField}
                  onMoveBlock={moveBlock}
                  onRemoveBlock={removeBlock}
                  onDuplicateBlock={duplicateBlock}
                  onToggleVisibility={toggleBlockVisibility}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  <p className="text-sm">No hay bloques. Agrega uno desde el panel izquierdo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NO RIGHT PANEL — all editing is inline */}
      </div>
    </div>
  )
}
