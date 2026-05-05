'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Monitor, Smartphone, Tablet, Save, Plus, Trash2, GripVertical,
  Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, X, ChevronDown,
  Settings2, LayoutDashboard, Type, Image, Star, ShoppingBag,
  Sparkles, HelpCircle, Mail, BarChart3, ArrowRight, Move,
  Pencil, Copy, MousePointerClick
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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

const BLOCK_TYPES = [
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
// Visual Editor Core Component
// ═══════════════════════════════════════════════════════════

export default function VisualEditorCore({ storeSlug, user }: { storeSlug: string; user: any }) {
  const { toast } = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // State
  const [pageData, setPageData] = useState<StorePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [showPreview, setShowPreview] = useState(true)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const token = user?.token || ''

  // Device dimensions
  const deviceDimensions = {
    mobile: { width: 390, height: 844, label: 'Mobile' },
    tablet: { width: 768, height: 1024, label: 'Tablet' },
    desktop: { width: '100%', height: '100%', label: 'Desktop' },
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
          // Create default page
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
      }
    } catch (err) {
      console.error('[VisualEditor] Fetch error:', err)
      toast({ title: 'Error al cargar la página', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [storeSlug, token, toast])

  useEffect(() => { fetchPageData() }, [fetchPageData])

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
    toast({ title: `Bloque "${BLOCK_TYPES.find(b => b.type === type)?.label}" agregado` })
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

  function updateBlockData(id: string, field: string, value: any) {
    if (!pageData) return
    setPageData(prev => prev ? {
      ...prev,
      layout: prev.layout.map(b => b.id === id ? {
        ...b,
        data: { ...b.data, [field]: value },
      } : b),
    } : null)
  }

  // ═══ SEND UPDATE TO IFRAME ═══

  useEffect(() => {
    if (iframeRef.current && pageData) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'PAYLOAD_UPDATE',
        blocks: pageData.layout,
        storeSlug,
      }, '*')
    }
  }, [pageData, storeSlug])

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
        // Update existing
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
        // Create new
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

  const selectedBlock = pageData?.layout.find(b => b.id === selectedBlockId)

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

          {/* Preview Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-neutral-400 hover:text-white"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
            {showPreview ? 'Ocultar Panel' : 'Mostrar Panel'}
          </Button>

          {/* Publish Toggle */}
          <div className="flex items-center gap-1.5">
            <Switch
              checked={pageData?.isPublished}
              onCheckedChange={(checked) => setPageData(prev => prev ? { ...prev, isPublished: checked } : null)}
              className="data-[state=checked]:bg-green-600"
            />
            <span className="text-[10px] text-neutral-400">{pageData?.isPublished ? 'Publicado' : 'Borrador'}</span>
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
              <Eye className="w-3.5 h-3.5" /> Ver Tienda
            </Button>
          </a>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT PANEL: Block List ─── */}
        <div className={`w-72 border-r border-neutral-800 bg-neutral-900/50 flex flex-col shrink-0 transition-all duration-300 ${showPreview ? 'w-72' : 'w-0 overflow-hidden opacity-0'}`}>
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Bloques ({pageData?.layout.length || 0})</span>
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
                  {BLOCK_TYPES.map(block => (
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
                const blockDef = BLOCK_TYPES.find(b => b.type === block.blockType)
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
                    onClick={() => setSelectedBlockId(block.id)}
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
                      <p className="text-[10px] text-neutral-500 truncate">
                        {getBlockPreviewText(block)}
                      </p>
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
        </div>

        {/* ─── CENTER: Live Preview ─── */}
        <div className="flex-1 bg-neutral-950 flex items-center justify-center p-4 overflow-auto">
          <div
            className="bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-300"
            style={{
              width: previewDevice === 'desktop' ? '100%' : deviceDimensions[previewDevice].width,
              height: previewDevice === 'desktop' ? '100%' : deviceDimensions[previewDevice].height,
              maxWidth: previewDevice === 'desktop' ? '100%' : undefined,
            }}
          >
            <iframe
              ref={iframeRef}
              src={`/${storeSlug}?visual-editor=true`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Vista previa de la tienda"
            />
          </div>
        </div>

        {/* ─── RIGHT PANEL: Block Editor ─── */}
        <AnimatePresence>
          {selectedBlock && showPreview && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-80 border-l border-neutral-800 bg-neutral-900/50 flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{BLOCK_TYPES.find(b => b.type === selectedBlock.blockType)?.icon}</span>
                  <span className="text-xs font-semibold text-neutral-300">{BLOCK_TYPES.find(b => b.type === selectedBlock.blockType)?.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => duplicateBlock(selectedBlock.id)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors" title="Duplicar">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeBlock(selectedBlock.id)} className="p-1.5 rounded-lg hover:bg-red-600/20 text-neutral-500 hover:text-red-400 transition-colors" title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setSelectedBlockId(null)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {renderBlockEditor(selectedBlock, updateBlockData)}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Block Editor Fields Renderer
// ═══════════════════════════════════════════════════════════

function renderBlockEditor(block: BlockData, updateField: (id: string, field: string, value: any) => void) {
  const d = block.data

  switch (block.blockType) {
    case 'hero-block':
      return (
        <>
          <FieldGroup label="Badge/Tag">
            <Input value={d.badge || ''} onChange={e => updateField(block.id, 'badge', e.target.value)} placeholder="Nueva Colección" className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Título Principal">
            <Textarea value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} placeholder="Título..." className="bg-neutral-800 border-neutral-700 text-white min-h-[80px]" />
          </FieldGroup>
          <FieldGroup label="Subtítulo">
            <Textarea value={d.subtitle || ''} onChange={e => updateField(block.id, 'subtitle', e.target.value)} placeholder="Subtítulo..." className="bg-neutral-800 border-neutral-700 text-white min-h-[60px]" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Texto del Botón">
              <Input value={d.ctaText || ''} onChange={e => updateField(block.id, 'ctaText', e.target.value)} placeholder="Comprar Ahora" className="bg-neutral-800 border-neutral-700 text-white" />
            </FieldGroup>
            <FieldGroup label="Enlace del Botón">
              <Input value={d.ctaLink || ''} onChange={e => updateField(block.id, 'ctaLink', e.target.value)} placeholder="#products" className="bg-neutral-800 border-neutral-700 text-white" />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Color del Texto">
              <Select value={d.textColor || 'white'} onValueChange={v => updateField(block.id, 'textColor', v)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">Blanco</SelectItem>
                  <SelectItem value="black">Negro</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Alineación">
              <Select value={d.alignment || 'center'} onValueChange={v => updateField(block.id, 'alignment', v)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup label={`Overlay: ${d.overlayOpacity || 30}%`}>
            <input type="range" min="0" max="100" value={d.overlayOpacity || 30} onChange={e => updateField(block.id, 'overlayOpacity', parseInt(e.target.value))} className="w-full accent-blue-600" />
          </FieldGroup>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-neutral-400">Altura Completa</Label>
            <Switch checked={d.fullHeight || false} onCheckedChange={v => updateField(block.id, 'fullHeight', v)} />
          </div>
        </>
      )

    case 'banner-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Descripción">
            <Textarea value={d.description || ''} onChange={e => updateField(block.id, 'description', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white min-h-[60px]" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Texto del Botón">
              <Input value={d.ctaText || ''} onChange={e => updateField(block.id, 'ctaText', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
            </FieldGroup>
            <FieldGroup label="Variante">
              <Select value={d.variant || 'primary'} onValueChange={v => updateField(block.id, 'variant', v)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Principal</SelectItem>
                  <SelectItem value="offer">Oferta</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-neutral-400">Mostrar en Mobile</Label>
            <Switch checked={d.showOnMobile !== false} onCheckedChange={v => updateField(block.id, 'showOnMobile', v)} />
          </div>
        </>
      )

    case 'product-gallery-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Subtítulo">
            <Input value={d.subtitle || ''} onChange={e => updateField(block.id, 'subtitle', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Fuente de Productos">
            <Select value={d.productSource || 'featured'} onValueChange={v => updateField(block.id, 'productSource', v)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="new">Nuevos</SelectItem>
                <SelectItem value="on-sale">En Oferta</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="category">Categoría</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          {d.productSource === 'category' && (
            <FieldGroup label="Slug de Categoría">
              <Input value={d.categorySlug || ''} onChange={e => updateField(block.id, 'categorySlug', e.target.value)} placeholder="camisetas" className="bg-neutral-800 border-neutral-700 text-white" />
            </FieldGroup>
          )}
          <FieldGroup label="Layout">
            <Select value={d.layout || 'grid'} onValueChange={v => updateField(block.id, 'layout', v)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Cuadrícula</SelectItem>
                <SelectItem value="carousel">Carrusel</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label={`Máximo de Productos: ${d.maxProducts || 8}`}>
            <input type="range" min="1" max="24" value={d.maxProducts || 8} onChange={e => updateField(block.id, 'maxProducts', parseInt(e.target.value))} className="w-full accent-blue-600" />
          </FieldGroup>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-neutral-400">Mostrar Botón "Ver Todo"</Label>
            <Switch checked={d.showButton !== false} onCheckedChange={v => updateField(block.id, 'showButton', v)} />
          </div>
        </>
      )

    case 'features-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <Label className="text-xs text-neutral-400 mb-2 block">Features</Label>
          {(d.features || []).map((feat: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-800 space-y-2 mb-2">
              <div className="flex gap-2">
                <Input value={feat.icon || ''} onChange={e => {
                  const newFeatures = [...(d.features || [])]
                  newFeatures[i] = { ...newFeatures[i], icon: e.target.value }
                  updateField(block.id, 'features', newFeatures)
                }} placeholder="✨" className="w-16 bg-neutral-800 border-neutral-700 text-white" />
                <Input value={feat.title || ''} onChange={e => {
                  const newFeatures = [...(d.features || [])]
                  newFeatures[i] = { ...newFeatures[i], title: e.target.value }
                  updateField(block.id, 'features', newFeatures)
                }} placeholder="Título" className="flex-1 bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <Input value={feat.description || ''} onChange={e => {
                const newFeatures = [...(d.features || [])]
                newFeatures[i] = { ...newFeatures[i], description: e.target.value }
                updateField(block.id, 'features', newFeatures)
              }} placeholder="Descripción" className="bg-neutral-800 border-neutral-700 text-white" />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newFeatures = [...(d.features || []), { icon: '✨', title: '', description: '' }]
              updateField(block.id, 'features', newFeatures)
            }}
            className="w-full border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Agregar Feature
          </Button>
        </>
      )

    case 'spacer-block':
      return (
        <FieldGroup label="Altura">
          <Select value={d.height || 'md'} onValueChange={v => updateField(block.id, 'height', v)}>
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Pequeño</SelectItem>
              <SelectItem value="md">Mediano</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      )

    case 'cta-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Subtítulo">
            <Textarea value={d.subtitle || ''} onChange={e => updateField(block.id, 'subtitle', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white min-h-[60px]" />
          </FieldGroup>
          <FieldGroup label="Variante">
            <Select value={d.variant || 'gradient'} onValueChange={v => updateField(block.id, 'variant', v)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gradient">Gradiente</SelectItem>
                <SelectItem value="solid">Sólido</SelectItem>
                <SelectItem value="minimal">Mínimo</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Texto Inferior">
            <Input value={d.footer || ''} onChange={e => updateField(block.id, 'footer', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
        </>
      )

    case 'newsletter-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Subtítulo">
            <Input value={d.subtitle || ''} onChange={e => updateField(block.id, 'subtitle', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Placeholder">
              <Input value={d.placeholder || ''} onChange={e => updateField(block.id, 'placeholder', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
            </FieldGroup>
            <FieldGroup label="Texto Botón">
              <Input value={d.buttonText || ''} onChange={e => updateField(block.id, 'buttonText', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
            </FieldGroup>
          </div>
          <FieldGroup label="Disclaimer">
            <Input value={d.disclaimer || ''} onChange={e => updateField(block.id, 'disclaimer', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
        </>
      )

    case 'stats-block':
      return (
        <>
          <Label className="text-xs text-neutral-400 mb-2 block">Estadísticas</Label>
          {(d.items || []).map((item: any, i: number) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <Input value={item.value || ''} onChange={e => {
                const newItems = [...(d.items || [])]
                newItems[i] = { ...newItems[i], value: e.target.value }
                updateField(block.id, 'items', newItems)
              }} placeholder="Valor" className="bg-neutral-800 border-neutral-700 text-white" />
              <Input value={item.label || ''} onChange={e => {
                const newItems = [...(d.items || [])]
                newItems[i] = { ...newItems[i], label: e.target.value }
                updateField(block.id, 'items', newItems)
              }} placeholder="Etiqueta" className="bg-neutral-800 border-neutral-700 text-white" />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newItems = [...(d.items || []), { value: '', label: '' }]
              updateField(block.id, 'items', newItems)
            }}
            className="w-full border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Agregar Estadística
          </Button>
        </>
      )

    case 'faq-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Fuente">
            <Select value={d.source || 'dynamic'} onValueChange={v => updateField(block.id, 'source', v)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dynamic">Dinámico (de la tienda)</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </>
      )

    case 'testimonials-block':
      return (
        <>
          <FieldGroup label="Título">
            <Input value={d.title || ''} onChange={e => updateField(block.id, 'title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
          </FieldGroup>
          <FieldGroup label="Fuente">
            <Select value={d.source || 'dynamic'} onValueChange={v => updateField(block.id, 'source', v)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dynamic">Dinámico (de la tienda)</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Layout">
            <Select value={d.layout || 'carousel'} onValueChange={v => updateField(block.id, 'layout', v)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="carousel">Carrusel</SelectItem>
                <SelectItem value="grid">Cuadrícula</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </>
      )

    default:
      return (
        <div className="text-center text-neutral-500 text-sm py-8">
          <p>Editor no disponible para este tipo de bloque.</p>
          <p className="text-xs mt-1">Tipo: {block.blockType}</p>
        </div>
      )
  }
}

// ═══ HELPER COMPONENTS ═══

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-neutral-400">{label}</Label>
      {children}
    </div>
  )
}

function getBlockPreviewText(block: BlockData): string {
  const d = block.data
  switch (block.blockType) {
    case 'hero-block': return d.title || 'Sin título'
    case 'banner-block': return d.title || 'Sin título'
    case 'product-gallery-block': return `${d.title || 'Productos'} · ${d.productSource || 'destacados'}`
    case 'text-block': return 'Contenido de texto'
    case 'features-block': return `${(d.features || []).length} features`
    case 'testimonials-block': return d.title || 'Testimonios'
    case 'faq-block': return d.title || 'Preguntas frecuentes'
    case 'newsletter-block': return d.title || 'Newsletter'
    case 'stats-block': return `${(d.items || []).length} estadísticas`
    case 'cta-block': return d.title || 'CTA'
    case 'spacer-block': return `Espaciador (${d.height || 'md'})`
    case 'divider-block': return 'Divisor'
    default: return block.blockType
  }
}
