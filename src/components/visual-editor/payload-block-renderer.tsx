'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Flame, LayoutGrid, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AnimatedCounter, TestimonialCarousel, FaqItem } from '@/components/storefront/storefront-utils'
import type { Product } from '@/components/storefront/storefront-types'

// ═══════════════════════════════════════════════════════════
// Block Renderer - Renders Payload CMS blocks in the storefront
// Supports all block types from the visual editor
// ═══════════════════════════════════════════════════════════

interface BlockRendererProps {
  blocks: Array<{
    id: string
    blockType: string
    isActive: boolean
    data: Record<string, any>
  }>
  storeName?: string
  products?: Product[]
  testimonials?: any[]
  storeContent?: Record<string, Record<string, string>>
  storePrimaryColor?: string
  storeAccentColor?: string
}

export function PayloadBlockRenderer({
  blocks,
  storeName = '',
  products = [],
  testimonials = [],
  storeContent = {},
  storePrimaryColor = '#171717',
  storeAccentColor = '#171717',
}: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.filter(b => b.isActive).map((block, index) => (
        <BlockWrapper key={block.id} block={block} index={index}>
          <BlockContent
            block={block}
            storeName={storeName}
            products={products}
            testimonials={testimonials}
            storeContent={storeContent}
            storePrimaryColor={storePrimaryColor}
            storeAccentColor={storeAccentColor}
          />
        </BlockWrapper>
      ))}
    </>
  )
}

// Wrapper with animation + editor overlay support
function BlockWrapper({ block, index, children }: { block: any; index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-block-id={block.id}
      data-block-type={block.blockType}
      className="relative group/block"
    >
      {children}
    </motion.div>
  )
}

// Individual block content renderer
function BlockContent({ block, storeName, products, testimonials, storeContent, storePrimaryColor, storeAccentColor }: {
  block: any
  storeName: string
  products: Product[]
  testimonials: any[]
  storeContent: Record<string, Record<string, string>>
  storePrimaryColor: string
  storeAccentColor: string
}) {
  const d = block.data

  switch (block.blockType) {
    case 'hero-block':
      return (
        <section className={`relative ${d.fullHeight ? 'min-h-screen' : 'min-h-[500px]'} flex items-center`}>
          {d.backgroundImage && typeof d.backgroundImage === 'object' && d.backgroundImage.url && (
            <img src={d.backgroundImage.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (d.overlayOpacity || 30) / 100 }}
          />
          <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-${d.textColor || 'white'}`}
            style={{ textAlign: d.alignment || 'center' }}
          >
            {d.badge && (
              <Badge className="mb-4 bg-white/10 text-white hover:bg-white/10 border-white/20 text-xs tracking-wider uppercase">
                {d.badge}
              </Badge>
            )}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              {d.title}
            </h1>
            {d.subtitle && (
              <p className="text-lg md:text-xl opacity-80 max-w-2xl mb-8" style={{ marginLeft: d.alignment === 'center' ? 'auto' : undefined, marginRight: d.alignment === 'center' ? 'auto' : undefined }}>
                {d.subtitle}
              </p>
            )}
            {d.ctaText && (
              <Button
                size="lg"
                className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-full px-8 h-12 font-semibold text-base"
                onClick={() => {
                  const target = document.querySelector(d.ctaLink || '#products')
                  target?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {d.ctaText}
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            )}
          </div>
        </section>
      )

    case 'banner-block':
      return (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className={`relative rounded-3xl overflow-hidden text-white ${
                d.variant === 'offer'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600'
                  : d.variant === 'minimal'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'bg-gradient-to-br from-neutral-900 to-neutral-700'
              }`}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8 md:p-12">
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">{d.title}</h2>
                  {d.description && <p className="mt-3 opacity-80 text-lg">{d.description}</p>}
                  {d.ctaText && (
                    <Button size="lg" className="mt-6 bg-white hover:bg-neutral-100 rounded-full px-6 h-11 font-semibold"
                      style={{ color: d.variant === 'minimal' ? '#171717' : undefined }}
                      onClick={() => {
                        const target = document.querySelector(d.ctaLink || '#')
                        target?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      {d.ctaText} <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  )}
                </div>
                {d.image && typeof d.image === 'object' && d.image.url && (
                  <div className="hidden md:block h-full min-h-[300px]">
                    <img src={d.image.url} alt="" className="w-full h-full object-cover opacity-70" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )

    case 'product-gallery-block':
      return <ProductGalleryRenderer d={d} products={products} storePrimaryColor={storePrimaryColor} />

    case 'features-block':
      return <FeaturesRenderer d={d} />

    case 'testimonials-block':
      return <TestimonialsRenderer d={d} testimonials={testimonials} storeContent={storeContent} />

    case 'faq-block':
      return <FAQRenderer d={d} storeContent={storeContent} />

    case 'newsletter-block':
      return <NewsletterRenderer d={d} storePrimaryColor={storePrimaryColor} />

    case 'stats-block':
      return <StatsRenderer d={d} storePrimaryColor={storePrimaryColor} />

    case 'cta-block':
      return <CTARenderer d={d} storeAccentColor={storeAccentColor} />

    case 'text-block':
      return (
        <section className={`py-12 ${d.backgroundColor === 'muted' ? 'bg-muted' : d.backgroundColor === 'primary' ? 'text-white' : 'bg-background'}`}
          style={{ textAlign: d.alignment || 'left' }}
        >
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${d.maxWidth === '3xl' ? 'max-w-3xl' : d.maxWidth === '2xl' ? 'max-w-2xl' : d.maxWidth === 'xl' ? 'max-w-xl' : ''}`}>
            <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: typeof d.content === 'string' ? d.content : '' }} />
          </div>
        </section>
      )

    case 'spacer-block':
      return (
        <div className={d.height === 'sm' ? 'py-8' : d.height === 'lg' ? 'py-24' : 'py-16'} />
      )

    case 'divider-block':
      return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${d.margin === 'small' ? 'my-4' : d.margin === 'large' ? 'my-12' : 'my-8'}`}>
          <hr className={`border-neutral-200 dark:border-neutral-800 ${d.variant === 'dashed' ? 'border-dashed' : d.variant === 'dotted' ? 'border-dotted' : ''}`} />
        </div>
      )

    default:
      return null
  }
}

// ═══ BLOCK SUB-RENDERERS ═══

function ProductGalleryRenderer({ d, products, storePrimaryColor }: { d: any; products: Product[]; storePrimaryColor: string }) {
  let filteredProducts = products
  if (d.productSource === 'featured') filteredProducts = products.filter(p => p.isFeatured)
  else if (d.productSource === 'new') filteredProducts = products.filter(p => p.isNew)
  else if (d.productSource === 'on-sale') filteredProducts = products.filter(p => p.discount && p.discount > 0)

  const displayProducts = filteredProducts.slice(0, d.maxProducts || 8)

  return (
    <section id="products" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{d.title || 'Productos Destacados'}</h2>
          {d.subtitle && <p className="mt-3 text-muted-foreground text-lg">{d.subtitle}</p>}
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, index) => (
            <motion.a
              key={product.id}
              href={`#product-${product.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold">S/{product.price.toFixed(2)}</span>
                {product.discount && product.discount > 0 && (
                  <span className="text-xs text-red-500 line-through">S/{(product.price / (1 - product.discount / 100)).toFixed(2)}</span>
                )}
              </div>
            </motion.a>
          ))}
        </div>
        {d.showButton !== false && displayProducts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full px-8 h-11">
              {d.buttonText || 'Ver Todo'} <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturesRenderer({ d }: { d: any }) {
  const features = d.features || [
    { icon: '🚚', title: 'Envío Gratis', description: 'En pedidos +S/199' },
    { icon: '💬', title: 'WhatsApp', description: 'Pedidos directos' },
    { icon: '💰', title: '0% Comisión', description: 'Sin cargos extra' },
    { icon: '🔄', title: 'Devolución', description: '30 días garantía' },
  ]

  return (
    <section className="py-16 bg-muted border-t border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && <h2 className="text-2xl font-bold text-center mb-8">{d.title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feat: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl mb-3">{feat.icon}</div>
              <h3 className="font-bold text-foreground text-sm">{feat.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsRenderer({ d, testimonials, storeContent }: { d: any; testimonials: any[]; storeContent: Record<string, Record<string, string>> }) {
  if (d.source === 'dynamic') {
    return (
      <section className="py-16 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{d.title || 'Lo que dicen nuestros clientes'}</h2>
            {d.subtitle && <p className="mt-3 text-muted-foreground text-lg">{d.subtitle}</p>}
          </motion.div>
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-10">{d.title || 'Testimonios'}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(d.items || []).map((t: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl bg-muted border">
              <div className="flex text-yellow-400 mb-3">{'★'.repeat(t.rating || 5)}</div>
              <p className="text-sm text-foreground mb-4">"{t.content}"</p>
              <p className="font-semibold text-sm">{t.name}</p>
              {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQRenderer({ d, storeContent }: { d: any; storeContent: Record<string, Record<string, string>> }) {
  let faqItems = d.source === 'dynamic'
    ? (() => {
        try { return JSON.parse(storeContent?.faq?.items || '[]') }
        catch { return [] }
      })()
    : (d.items || [])

  if (faqItems.length === 0) {
    faqItems = [
      { q: '¿Cuánto tarda el envío?', a: '1-3 días hábiles a Lima, 3-7 a provincias.' },
      { q: '¿Métodos de pago?', a: 'Contra entrega, transferencia, Yape/Plin, tarjeta.' },
    ]
  }

  return (
    <section className="py-16 bg-muted/50 border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{d.title || 'Preguntas Frecuentes'}</h2>
        <div className="space-y-3">
          {faqItems.map((item: any, index: number) => (
            <FaqItem key={index} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterRenderer({ d, storePrimaryColor }: { d: any; storePrimaryColor: string }) {
  return (
    <section className={`py-16 ${d.backgroundColor === 'muted' ? 'bg-muted' : d.backgroundColor === 'primary' ? 'text-white' : 'bg-background'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{d.title || 'Recibe ofertas exclusivas'}</h2>
        {d.subtitle && <p className="mt-2 text-muted-foreground">{d.subtitle}</p>}
        <div className="mt-6 flex gap-2 max-w-md mx-auto">
          <Input placeholder={d.placeholder || 'tu@email.com'} className="h-12 rounded-xl" />
          <Button className="text-white rounded-xl px-6 h-12 font-semibold whitespace-nowrap" style={{ backgroundColor: storePrimaryColor }}>
            {d.buttonText || 'Suscribirme'}
          </Button>
        </div>
        {d.disclaimer && <p className="mt-3 text-xs text-muted-foreground/70">{d.disclaimer}</p>}
      </div>
    </section>
  )
}

function StatsRenderer({ d, storePrimaryColor }: { d: any; storePrimaryColor: string }) {
  const items = d.items || [
    { value: '+120', label: 'Negocios' },
    { value: '24/7', label: 'Siempre activo' },
    { value: '0%', label: 'Comisión' },
    { value: '+2K', label: 'Clientes' },
  ]

  return (
    <section className="py-16 text-white" style={{ backgroundColor: storePrimaryColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-bold"><AnimatedCounter target={item.value} /></p>
              <p className="text-white/70 mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTARenderer({ d, storeAccentColor }: { d: any; storeAccentColor: string }) {
  return (
    <section className={`py-20 ${d.variant === 'gradient' ? 'bg-gradient-to-br from-muted to-background' : d.variant === 'solid' ? 'bg-neutral-100' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{d.title || '¿Listo?'}</h2>
        {d.subtitle && <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{d.subtitle}</p>}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {d.primaryButton?.text && (
            <Button size="lg" className="text-white rounded-full px-8 h-12 font-semibold" style={{ backgroundColor: storeAccentColor }}>
              {d.primaryButton.text} <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          )}
          {d.secondaryButton?.text && (
            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 font-semibold">
              {d.secondaryButton.text}
            </Button>
          )}
        </div>
        {d.footer && <p className="mt-6 text-sm text-muted-foreground/70">{d.footer}</p>}
      </div>
    </section>
  )
}
