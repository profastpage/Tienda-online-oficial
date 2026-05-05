'use client'

import { useCallback } from 'react'
import {
  Plus, Settings2,
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { InlineEditableText } from './inline-editable-text'
import { InlineEditableImage } from './inline-editable-image'

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

interface InlineBlockRendererProps {
  blocks: BlockData[]
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onUpdateBlockField: (id: string, field: string, value: any) => void
  onMoveBlock: (fromIndex: number, toIndex: number) => void
  onRemoveBlock: (id: string) => void
  onDuplicateBlock: (id: string) => void
  onToggleVisibility: (id: string) => void
}

// ═══════════════════════════════════════════════════════════
// Block type definitions (shared with editor core)
// ═══════════════════════════════════════════════════════════

export const BLOCK_TYPES = [
  { type: 'hero-block', label: 'Hero Banner', icon: '🎯' },
  { type: 'banner-block', label: 'Banner Promo', icon: '📢' },
  { type: 'product-gallery-block', label: 'Galería de Productos', icon: '🛍️' },
  { type: 'text-block', label: 'Bloque de Texto', icon: '📝' },
  { type: 'features-block', label: 'Features/Beneficios', icon: '✨' },
  { type: 'testimonials-block', label: 'Testimonios', icon: '⭐' },
  { type: 'faq-block', label: 'Preguntas Frecuentes', icon: '❓' },
  { type: 'newsletter-block', label: 'Newsletter', icon: '📧' },
  { type: 'stats-block', label: 'Estadísticas', icon: '📊' },
  { type: 'cta-block', label: 'Llamada a la Acción', icon: '🚀' },
  { type: 'spacer-block', label: 'Espaciador', icon: '↕️' },
  { type: 'divider-block', label: 'Divisor', icon: '➖' },
]

// ═══════════════════════════════════════════════════════════
// Main Renderer
// ═══════════════════════════════════════════════════════════

export function InlineBlockRenderer({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlockField,
  onMoveBlock,
  onRemoveBlock,
  onDuplicateBlock,
  onToggleVisibility,
}: InlineBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, index) => (
        <BlockWrapper
          key={block.id}
          block={block}
          index={index}
          totalBlocks={blocks.length}
          isSelected={selectedBlockId === block.id}
          onSelect={onSelectBlock}
          onMoveUp={index > 0 ? () => onMoveBlock(index, index - 1) : undefined}
          onMoveDown={index < blocks.length - 1 ? () => onMoveBlock(index, index + 1) : undefined}
          onDuplicate={() => onDuplicateBlock(block.id)}
          onRemove={() => onRemoveBlock(block.id)}
          onToggleVisibility={() => onToggleVisibility(block.id)}
        >
          <BlockContent
            block={block}
            onUpdateField={(field: string, value: any) => onUpdateBlockField(block.id, field, value)}
          />
        </BlockWrapper>
      ))}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// Block Wrapper — adds selection border + floating toolbar
// ═══════════════════════════════════════════════════════════

function BlockWrapper({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onToggleVisibility,
  children,
}: {
  block: BlockData
  index: number
  totalBlocks: number
  isSelected: boolean
  onSelect: (id: string | null) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDuplicate: () => void
  onRemove: () => void
  onToggleVisibility: () => void
  children: React.ReactNode
}) {
  const blockDef = BLOCK_TYPES.find(b => b.type === block.blockType)
  const isHidden = !block.isActive

  return (
    <div
      id={`inline-block-${block.id}`}
      className={`relative group/block-wrapper transition-all duration-150 ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-0 z-10'
          : 'hover:ring-1 hover:ring-blue-300/60'
      } ${isHidden ? 'opacity-40 pointer-events-none' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(isSelected ? null : block.id)
      }}
    >
      {/* Floating toolbar at top of block */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-8 left-2 z-30 flex items-center gap-0.5 px-1.5 py-1 bg-white rounded-lg shadow-lg border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs mr-1 text-neutral-500 select-none">{blockDef?.icon}</span>
            <span className="text-[10px] font-medium text-neutral-600 mr-1 select-none whitespace-nowrap max-w-[100px] truncate">
              {blockDef?.label}
            </span>
            <div className="w-px h-4 bg-neutral-200 mx-0.5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={!onMoveUp}
                  onClick={onMoveUp}
                  className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-500 hover:text-neutral-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>Mover arriba</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={!onMoveDown}
                  onClick={onMoveDown}
                  className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-500 hover:text-neutral-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>Mover abajo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onDuplicate} className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>Duplicar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onToggleVisibility} className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800">
                  {block.isActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{block.isActive ? 'Ocultar' : 'Mostrar'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onRemove} className="p-1 rounded hover:bg-red-50 text-neutral-500 hover:text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Settings Popover — for non-inline-editable fields
// ═══════════════════════════════════════════════════════════

function SettingsPopover({
  blockId,
  fields,
  onUpdateField,
}: {
  blockId: string
  fields: Array<{
    key: string
    label: string
    type: 'select' | 'range' | 'switch'
    value: any
    options?: Array<{ label: string; value: string }>
    min?: number
    max?: number
    step?: number
  }>
  onUpdateField: (key: string, value: any) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-white border-neutral-200" side="right" align="start">
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                {field.label}
              </label>
              {field.type === 'select' && (
                <Select value={String(field.value)} onValueChange={(v) => onUpdateField(field.key, v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === 'range' && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={field.min ?? 0}
                    max={field.max ?? 100}
                    step={field.step ?? 1}
                    value={Number(field.value)}
                    onChange={(e) => onUpdateField(field.key, parseInt(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-xs text-neutral-600 w-8 text-right">{field.value}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ═══════════════════════════════════════════════════════════
// Block Content — renders each block type with inline editing
// ═══════════════════════════════════════════════════════════

function BlockContent({
  block,
  onUpdateField,
}: {
  block: BlockData
  onUpdateField: (field: string, value: any) => void
}) {
  const d = block.data

  switch (block.blockType) {
    case 'hero-block':
      return <HeroBlockContent d={d} onUpdateField={onUpdateField} />

    case 'banner-block':
      return <BannerBlockContent d={d} onUpdateField={onUpdateField} />

    case 'product-gallery-block':
      return <ProductGalleryBlockContent d={d} onUpdateField={onUpdateField} />

    case 'text-block':
      return <TextBlockContent d={d} onUpdateField={onUpdateField} />

    case 'features-block':
      return <FeaturesBlockContent d={d} onUpdateField={onUpdateField} />

    case 'testimonials-block':
      return <TestimonialsBlockContent d={d} onUpdateField={onUpdateField} />

    case 'faq-block':
      return <FAQBlockContent d={d} onUpdateField={onUpdateField} />

    case 'newsletter-block':
      return <NewsletterBlockContent d={d} onUpdateField={onUpdateField} />

    case 'stats-block':
      return <StatsBlockContent d={d} onUpdateField={onUpdateField} />

    case 'cta-block':
      return <CTABlockContent d={d} onUpdateField={onUpdateField} />

    case 'spacer-block':
      return <SpacerBlockContent d={d} onUpdateField={onUpdateField} />

    case 'divider-block':
      return <DividerBlockContent d={d} onUpdateField={onUpdateField} />

    default:
      return (
        <div className="p-8 text-center text-neutral-400">
          <p className="text-sm">Bloque no reconocido: {block.blockType}</p>
        </div>
      )
  }
}

// ═══════════════════════════════════════════════════════════
// Individual Block Content Renderers
// ═══════════════════════════════════════════════════════════

function HeroBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  return (
    <section className={`relative ${d.fullHeight ? 'min-h-screen' : 'min-h-[500px]'} flex items-center`}>
      <InlineEditableImage
        src={d.backgroundImage?.url || d.backgroundImage}
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover"
        onUpdate={(fileData) => onUpdateField('backgroundImage', { url: fileData.url, name: fileData.name })}
        onRemove={() => onUpdateField('backgroundImage', null)}
        fillMode
        stopPropagation={false}
        imgStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: (d.overlayOpacity || 30) / 100 }}
      />
      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        style={{ textAlign: d.alignment || 'center' }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          {d.badge !== undefined && (
            <InlineEditableText
              value={d.badge || ''}
              onUpdate={(v) => onUpdateField('badge', v)}
              tag="span"
              className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs tracking-wider uppercase font-medium"
              placeholder="Agregar badge..."
              stopPropagation={false}
            />
          )}
          <SettingsPopover
            blockId={d.id}
            onUpdateField={onUpdateField}
            fields={[
              { key: 'textColor', label: 'Color Texto', type: 'select', value: d.textColor || 'white', options: [{ label: 'Blanco', value: 'white' }, { label: 'Negro', value: 'black' }] },
              { key: 'alignment', label: 'Alineación', type: 'select', value: d.alignment || 'center', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }] },
              { key: 'overlayOpacity', label: 'Overlay', type: 'range', value: d.overlayOpacity || 30, min: 0, max: 100 },
            ]}
          />
        </div>
        <InlineEditableText
          value={d.title || ''}
          onUpdate={(v) => onUpdateField('title', v)}
          tag="h1"
          className={`block text-4xl md:text-6xl font-bold leading-tight mb-4 ${d.textColor === 'black' ? 'text-neutral-900' : 'text-white'}`}
          placeholder="Escribe tu título..."
          stopPropagation={false}
        />
        <InlineEditableText
          value={d.subtitle || ''}
          onUpdate={(v) => onUpdateField('subtitle', v)}
          tag="p"
          className={`block text-lg md:text-xl opacity-80 max-w-2xl mb-8 ${d.textColor === 'black' ? 'text-neutral-800' : 'text-white'}`}
          placeholder="Escribe tu subtítulo..."
          multiline
          stopPropagation={false}
        />
        {d.ctaText !== undefined && (
          <div className="inline-block">
            <InlineEditableText
              value={d.ctaText || ''}
              onUpdate={(v) => onUpdateField('ctaText', v)}
              tag="span"
              className="inline-block bg-white text-neutral-900 hover:bg-neutral-100 rounded-full px-8 h-12 font-semibold text-base flex items-center"
              placeholder="Texto del botón..."
              stopPropagation={false}
            />
          </div>
        )}
      </div>
    </section>
  )
}

function BannerBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  const bgClass = d.variant === 'offer'
    ? 'bg-gradient-to-r from-orange-600 to-red-600'
    : d.variant === 'minimal'
      ? 'bg-neutral-100 text-neutral-900'
      : 'bg-gradient-to-br from-neutral-900 to-neutral-700'

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative rounded-3xl overflow-hidden text-white ${bgClass}`}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-2 mb-2">
                <InlineEditableText
                  value={d.title || ''}
                  onUpdate={(v) => onUpdateField('title', v)}
                  tag="h2"
                  className="block text-2xl md:text-3xl font-bold leading-tight"
                  placeholder="Título del banner..."
                  stopPropagation={false}
                />
                <SettingsPopover
                  blockId={d.id}
                  onUpdateField={onUpdateField}
                  fields={[
                    { key: 'variant', label: 'Variante', type: 'select', value: d.variant || 'primary', options: [{ label: 'Principal', value: 'primary' }, { label: 'Oferta', value: 'offer' }, { label: 'Minimalista', value: 'minimal' }] },
                  ]}
                />
              </div>
              <InlineEditableText
                value={d.description || ''}
                onUpdate={(v) => onUpdateField('description', v)}
                tag="p"
                className="block mt-3 opacity-80 text-lg"
                placeholder="Descripción..."
                multiline
                stopPropagation={false}
              />
              {d.ctaText !== undefined && (
                <div className="mt-6 inline-block">
                  <InlineEditableText
                    value={d.ctaText || ''}
                    onUpdate={(v) => onUpdateField('ctaText', v)}
                    tag="span"
                    className="inline-block bg-white hover:bg-neutral-100 rounded-full px-6 h-11 font-semibold"
                    style={{ color: d.variant === 'minimal' ? '#171717' : undefined }}
                    placeholder="Texto botón..."
                    stopPropagation={false}
                  />
                </div>
              )}
            </div>
            <InlineEditableImage
              src={d.image?.url || d.image}
              alt="Banner image"
              className="hidden md:block h-full min-h-[300px] w-full object-cover opacity-70"
              onUpdate={(fileData) => onUpdateField('image', { url: fileData.url, name: fileData.name })}
              onRemove={() => onUpdateField('image', null)}
              fillMode
              stopPropagation={false}
              imgStyle={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductGalleryBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  return (
    <section id="products" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2">
            <InlineEditableText
              value={d.title || ''}
              onUpdate={(v) => onUpdateField('title', v)}
              tag="h2"
              className="block text-3xl md:text-4xl font-bold text-foreground tracking-tight"
              placeholder="Título..."
              stopPropagation={false}
            />
            <SettingsPopover
              blockId={d.id}
              onUpdateField={onUpdateField}
              fields={[
                { key: 'productSource', label: 'Fuente', type: 'select', value: d.productSource || 'featured', options: [{ label: 'Destacados', value: 'featured' }, { label: 'Nuevos', value: 'new' }, { label: 'En Oferta', value: 'on-sale' }, { label: 'Todos', value: 'all' }] },
                { key: 'maxProducts', label: 'Máx. Productos', type: 'range', value: d.maxProducts || 8, min: 1, max: 24 },
              ]}
            />
          </div>
          {d.subtitle !== undefined && (
            <InlineEditableText
              value={d.subtitle || ''}
              onUpdate={(v) => onUpdateField('subtitle', v)}
              tag="p"
              className="block mt-3 text-muted-foreground text-lg"
              placeholder="Subtítulo..."
              stopPropagation={false}
            />
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3 flex items-center justify-center">
                <span className="text-neutral-400 text-xs">Producto {i}</span>
              </div>
              <h3 className="text-sm font-medium text-foreground truncate">Producto de ejemplo</h3>
              <span className="text-sm font-bold">S/99.00</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TextBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  return (
    <section className={`py-12 ${d.backgroundColor === 'muted' ? 'bg-muted' : 'bg-background'}`} style={{ textAlign: d.alignment || 'left' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-2">
          <SettingsPopover
            blockId={d.id}
            onUpdateField={onUpdateField}
            fields={[
              { key: 'alignment', label: 'Alineación', type: 'select', value: d.alignment || 'left', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }] },
              { key: 'backgroundColor', label: 'Fondo', type: 'select', value: d.backgroundColor || 'transparent', options: [{ label: 'Transparente', value: 'transparent' }, { label: 'Gris', value: 'muted' }] },
            ]}
          />
        </div>
        <InlineEditableText
          value={d.content || ''}
          onUpdate={(v) => onUpdateField('content', v)}
          tag="div"
          className="block prose prose-neutral max-w-none min-h-[40px] text-foreground"
          placeholder="Escribe tu contenido aqui..."
          multiline
          stopPropagation={false}
        />
      </div>
    </section>
  )
}

function FeaturesBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  const features = d.features || []

  const updateFeature = useCallback(
    (index: number, field: string, value: any) => {
      const newFeatures = features.map((f: any, i: number) =>
        i === index ? { ...f, [field]: value } : f
      )
      onUpdateField('features', newFeatures)
    },
    [features, onUpdateField]
  )

  const addFeature = useCallback(() => {
    onUpdateField('features', [...features, { icon: '✨', title: '', description: '' }])
  }, [features, onUpdateField])

  const removeFeature = useCallback(
    (index: number) => {
      onUpdateField('features', features.filter((_: any, i: number) => i !== index))
    },
    [features, onUpdateField]
  )

  return (
    <section className="py-16 bg-muted border-t border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <InlineEditableText
            value={d.title || ''}
            onUpdate={(v) => onUpdateField('title', v)}
            tag="h2"
            className="block text-2xl font-bold text-center"
            placeholder="Título de features..."
            stopPropagation={false}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feat: any, index: number) => (
            <div key={index} className="text-center group/feat relative">
              <div className="flex justify-center">
                <InlineEditableText
                  value={feat.icon || ''}
                  onUpdate={(v) => updateFeature(index, 'icon', v)}
                  tag="span"
                  className="block text-3xl mb-3 cursor-text"
                  placeholder="✨"
                  stopPropagation={false}
                />
              </div>
              <InlineEditableText
                value={feat.title || ''}
                onUpdate={(v) => updateFeature(index, 'title', v)}
                tag="h3"
                className="block font-bold text-foreground text-sm"
                placeholder="Título..."
                stopPropagation={false}
              />
              <InlineEditableText
                value={feat.description || ''}
                onUpdate={(v) => updateFeature(index, 'description', v)}
                tag="p"
                className="block text-muted-foreground text-sm mt-1"
                placeholder="Descripción..."
                stopPropagation={false}
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeFeature(index) }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 text-white text-[10px] items-center justify-center hidden group-hover/feat:flex hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); addFeature() }}
            className="text-center p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-blue-400 text-neutral-400 hover:text-blue-500 transition-colors flex flex-col items-center justify-center min-h-[80px]"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-xs">Agregar</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function TestimonialsBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-10">
          <InlineEditableText
            value={d.title || ''}
            onUpdate={(v) => onUpdateField('title', v)}
            tag="h2"
            className="block text-3xl md:text-4xl font-bold tracking-tight"
            placeholder="Título..."
            stopPropagation={false}
          />
          <SettingsPopover
            blockId={d.id}
            onUpdateField={onUpdateField}
            fields={[
              { key: 'source', label: 'Fuente', type: 'select', value: d.source || 'dynamic', options: [{ label: 'Dinámico', value: 'dynamic' }, { label: 'Manual', value: 'manual' }] },
            ]}
          />
        </div>
        {d.subtitle !== undefined && (
          <InlineEditableText
            value={d.subtitle || ''}
            onUpdate={(v) => onUpdateField('subtitle', v)}
            tag="p"
            className="block mt-3 text-muted-foreground text-lg text-center"
            placeholder="Subtítulo..."
            stopPropagation={false}
          />
        )}
        <div className="text-center text-muted-foreground mt-6">
          <p className="text-sm italic">&quot;Los testimonios se muestran dinámicamente desde el contenido de la tienda.&quot;</p>
        </div>
      </div>
    </section>
  )
}

function FAQBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  return (
    <section className="py-16 bg-muted/50 border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-10">
          <InlineEditableText
            value={d.title || ''}
            onUpdate={(v) => onUpdateField('title', v)}
            tag="h2"
            className="block text-2xl md:text-3xl font-bold text-center"
            placeholder="Título..."
            stopPropagation={false}
          />
          <SettingsPopover
            blockId={d.id}
            onUpdateField={onUpdateField}
            fields={[
              { key: 'source', label: 'Fuente', type: 'select', value: d.source || 'dynamic', options: [{ label: 'Dinámico', value: 'dynamic' }, { label: 'Manual', value: 'manual' }] },
            ]}
          />
        </div>
        <div className="text-center text-muted-foreground">
          <p className="text-sm italic">&quot;Las FAQ se muestran dinámicamente desde el contenido de la tienda.&quot;</p>
        </div>
      </div>
    </section>
  )
}

function NewsletterBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <InlineEditableText
          value={d.title || ''}
          onUpdate={(v) => onUpdateField('title', v)}
          tag="h2"
          className="block text-2xl md:text-3xl font-bold"
          placeholder="Título..."
          stopPropagation={false}
        />
        <InlineEditableText
          value={d.subtitle || ''}
          onUpdate={(v) => onUpdateField('subtitle', v)}
          tag="p"
          className="block mt-2 text-muted-foreground"
          placeholder="Subtítulo..."
          stopPropagation={false}
        />
        <div className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="flex-1">
            <InlineEditableText
              value={d.placeholder || ''}
              onUpdate={(v) => onUpdateField('placeholder', v)}
              tag="span"
              className="block text-neutral-400 text-sm"
              placeholder="Placeholder..."
              stopPropagation={false}
            />
          </div>
          <InlineEditableText
            value={d.buttonText || ''}
            onUpdate={(v) => onUpdateField('buttonText', v)}
            tag="span"
            className="inline-block bg-blue-600 text-white rounded-xl px-6 h-12 font-semibold whitespace-nowrap"
            placeholder="Botón..."
            stopPropagation={false}
          />
        </div>
        {d.disclaimer !== undefined && (
          <InlineEditableText
            value={d.disclaimer || ''}
            onUpdate={(v) => onUpdateField('disclaimer', v)}
            tag="p"
            className="block mt-3 text-xs text-muted-foreground/70"
            placeholder="Disclaimer..."
            stopPropagation={false}
          />
        )}
      </div>
    </section>
  )
}

function StatsBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  const items = d.items || []

  const updateItem = useCallback(
    (index: number, field: string, value: any) => {
      const newItems = items.map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      )
      onUpdateField('items', newItems)
    },
    [items, onUpdateField]
  )

  const addItem = useCallback(() => {
    onUpdateField('items', [...items, { value: '', label: '' }])
  }, [items, onUpdateField])

  const removeItem = useCallback(
    (index: number) => {
      onUpdateField('items', items.filter((_: any, i: number) => i !== index))
    },
    [items, onUpdateField]
  )

  return (
    <section className="py-16 text-white" style={{ backgroundColor: '#171717' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((item: any, index: number) => (
            <div key={index} className="relative group/stat">
              <InlineEditableText
                value={item.value || ''}
                onUpdate={(v) => updateItem(index, 'value', v)}
                tag="p"
                className="block text-4xl md:text-5xl font-bold"
                placeholder="0"
                stopPropagation={false}
              />
              <InlineEditableText
                value={item.label || ''}
                onUpdate={(v) => updateItem(index, 'label', v)}
                tag="p"
                className="block text-white/70 mt-2"
                placeholder="Etiqueta..."
                stopPropagation={false}
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(index) }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 text-white text-[10px] items-center justify-center hidden group-hover/stat:flex hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
          {items.length < 6 && (
            <button
              onClick={(e) => { e.stopPropagation(); addItem() }}
              className="text-center p-4 rounded-xl border-2 border-dashed border-white/30 hover:border-blue-400 text-white/50 hover:text-blue-400 transition-colors flex flex-col items-center justify-center min-h-[60px]"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span className="text-xs">Agregar</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function CTABlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  const bgClass = d.variant === 'gradient'
    ? 'bg-gradient-to-br from-muted to-background'
    : d.variant === 'solid'
      ? 'bg-neutral-100'
      : 'bg-background'

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <InlineEditableText
            value={d.title || ''}
            onUpdate={(v) => onUpdateField('title', v)}
            tag="h2"
            className="block text-3xl md:text-4xl font-bold tracking-tight"
            placeholder="Título..."
            stopPropagation={false}
          />
          <SettingsPopover
            blockId={d.id}
            onUpdateField={onUpdateField}
            fields={[
              { key: 'variant', label: 'Variante', type: 'select', value: d.variant || 'gradient', options: [{ label: 'Gradiente', value: 'gradient' }, { label: 'Sólido', value: 'solid' }, { label: 'Mínimo', value: 'minimal' }] },
            ]}
          />
        </div>
        <InlineEditableText
          value={d.subtitle || ''}
          onUpdate={(v) => onUpdateField('subtitle', v)}
          tag="p"
          className="block mt-4 text-muted-foreground text-lg max-w-2xl mx-auto"
          placeholder="Subtítulo..."
          multiline
          stopPropagation={false}
        />
        {d.footer !== undefined && (
          <InlineEditableText
            value={d.footer || ''}
            onUpdate={(v) => onUpdateField('footer', v)}
            tag="p"
            className="block mt-6 text-sm text-muted-foreground/70"
            placeholder="Texto inferior..."
            stopPropagation={false}
          />
        )}
      </div>
    </section>
  )
}

function SpacerBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  const heightClass = d.height === 'sm' ? 'py-8' : d.height === 'lg' ? 'py-24' : 'py-16'

  return (
    <div className="flex items-center justify-center">
      <div className={`${heightClass} w-full relative`}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <SettingsPopover
            blockId={d.id}
            onUpdateField={onUpdateField}
            fields={[
              { key: 'height', label: 'Altura', type: 'select', value: d.height || 'md', options: [{ label: 'Pequeño', value: 'sm' }, { label: 'Mediano', value: 'md' }, { label: 'Grande', value: 'lg' }] },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

function DividerBlockContent({ d, onUpdateField }: { d: Record<string, any>; onUpdateField: (f: string, v: any) => void }) {
  const marginClass = d.margin === 'small' ? 'my-4' : d.margin === 'large' ? 'my-12' : 'my-8'
  const variantClass = d.variant === 'dashed' ? 'border-dashed' : d.variant === 'dotted' ? 'border-dotted' : ''

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${marginClass} relative flex items-center`}>
      <hr className={`border-neutral-200 dark:border-neutral-800 w-full ${variantClass}`} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <SettingsPopover
          blockId={d.id}
          onUpdateField={onUpdateField}
          fields={[
            { key: 'variant', label: 'Estilo', type: 'select', value: d.variant || 'solid', options: [{ label: 'Sólido', value: 'solid' }, { label: 'Punteado', value: 'dashed' }, { label: 'Puntos', value: 'dotted' }] },
            { key: 'margin', label: 'Margen', type: 'select', value: d.margin || 'normal', options: [{ label: 'Pequeño', value: 'small' }, { label: 'Normal', value: 'normal' }, { label: 'Grande', value: 'large' }] },
          ]}
        />
      </div>
    </div>
  )
}
