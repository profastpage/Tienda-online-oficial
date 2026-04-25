'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Flame, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useStorefrontStore } from './storefront-store'
import { sc, scJson } from './storefront-types'
import { AnimatedCounter, TestimonialCarousel, FaqItem } from './storefront-utils'
import type { Product } from './storefront-types'

interface StorefrontContentSectionsProps {
  offerProducts: Product[]
  hasOffers: boolean
}

export function StorefrontContentSections({ offerProducts, hasOffers }: StorefrontContentSectionsProps) {
  const storeContent = useStorefrontStore((s) => s.storeContent)
  const storeName = useStorefrontStore((s) => s.storeName)
  const testimonials = useStorefrontStore((s) => s.testimonials)
  const newsletterEmail = useStorefrontStore((s) => s.newsletterEmail)
  const setNewsletterEmail = useStorefrontStore((s) => s.setNewsletterEmail)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

  const dynamicFeatures = scJson<Array<{icon: string; title: string; desc: string}>>(storeContent, 'features', 'items', [
    { icon: '🚚', title: 'Envío Gratis', desc: 'En pedidos +S/199' },
    { icon: '💬', title: 'WhatsApp', desc: 'Pedidos directos' },
    { icon: '💰', title: '0% Comisión', desc: 'Sin cargos extra' },
    { icon: '🔄', title: 'Devolución', desc: '30 días garantía' },
  ])
  const dynamicStats = scJson<Array<{value: string; label: string}>>(storeContent, 'stats', 'items', [
    { value: '+120', label: 'Negocios activos' },
    { value: '24/7', label: 'Siempre vendiendo' },
    { value: '0%', label: 'Comisión por venta' },
    { value: '+2K', label: 'Clientes felices' },
  ])
  const dynamicAboutFeatures = scJson<Array<{icon: string; text: string}>>(storeContent, 'about', 'features', [
    { icon: '✨', text: 'Calidad premium en cada producto' },
    { icon: '🧵', text: 'Materiales cuidadosamente seleccionados' },
    { icon: '🎨', text: 'Diseños exclusivos y originales' },
    { icon: '🚚', text: 'Envío a todo el país' },
  ])

  return (
    <>
      {/* Promo Banner - Dynamic: Offers or Categories */}
      {hasOffers ? (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8 md:p-12 lg:p-16">
                <Badge className="mb-4 bg-white/10 text-white hover:bg-white/10 border-white/20 text-xs tracking-wider uppercase">
                  🔥 Ofertas Activas
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Hasta {Math.max(...offerProducts.map(p => p.discount || 0))}% de descuento
                </h2>
                <p className="mt-4 text-white/80 text-lg">
                  {offerProducts.length} productos en oferta. ¡No te pierdas estas oportunidades!
                </p>
                <Button
                  size="lg"
                  className="mt-6 bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full px-8 h-12 font-semibold"
                  onClick={() => document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Flame className="w-4 h-4 mr-1.5" />
                  Ver Todas las Ofertas
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
              <div className="hidden md:block h-full min-h-[300px] relative">
                <div className="absolute inset-0 bg-black/20" />
                {offerProducts[0] && (
                  <img
                    src={offerProducts[0].image}
                    alt="Productos en oferta"
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      ) : (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden text-white"
            style={{ backgroundColor: 'var(--store-primary, #171717)' }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8 md:p-12 lg:p-16">
                <Badge className="mb-4 bg-white/10 text-white hover:bg-white/10 border-white/20 text-xs tracking-wider uppercase">
                  {handleSc('about', 'badge', 'Nuestra Historia')}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {handleSc('about', 'title', storeName || 'Mi Tienda')}
                </h2>
                <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                  {handleSc('about', 'description', 'Somos una marca que nace de la pasión por ofrecer lo mejor a nuestros clientes. Cada producto es cuidadosamente seleccionado para garantizar la mejor calidad y experiencia de compra.')}
                </p>
                <div className="mt-6 space-y-2.5">
                  {dynamicAboutFeatures.map((feat) => (
                    <p key={feat.text} className="text-neutral-400 text-sm">{feat.icon} {feat.text}</p>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="mt-8 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full px-8 h-12 font-semibold"
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {handleSc('about', 'btnText', 'Ver Catálogo')}
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
              {(handleSc('about', 'image', '')) && (
              <div className="hidden md:block h-full min-h-[400px]">
                <img
                  src={handleSc('about', 'image', '')}
                  alt={handleSc('about', 'title', storeName || 'Mi Tienda')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-neutral-900/30 pointer-events-none hidden md:block" />
              </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Features */}
      <section className="py-16 bg-muted border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {dynamicFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Instagram Carousel Style */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {handleSc('testimonials', 'title', 'Lo que dicen nuestros clientes')}
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              {handleSc('testimonials', 'subtitle', 'Reseñas verificadas de compradores reales')}
            </p>
          </motion.div>
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {handleSc('faq', 'title', 'Preguntas Frecuentes')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {handleSc('faq', 'subtitle', 'Todo lo que necesitas saber sobre tu compra')}
            </p>
          </motion.div>
          <div className="space-y-3">
            {scJson<Array<{q: string; a: string}>>(storeContent, 'faq', 'items', [
              { q: '¿Cuánto tarda el envío?', a: 'El envío es de 1 a 3 días hábiles a Lima y 3 a 7 días a provincias. Envío gratis en pedidos mayores a S/199.' },
              { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos pago contra entrega, transferencia bancaria, y Yape/Plin. También puedes pagar con tarjeta a través de MercadoPago.' },
              { q: '¿Puedo devolver mi pedido?', a: 'Sí, tienes 30 días para devolver tu producto si no estás satisfecho. El producto debe estar en su estado original.' },
              { q: '¿Cómo hago mi pedido?', a: 'Puedes hacer tu pedido directamente por WhatsApp o a través de nuestra tienda online. Te guiaremos en cada paso.' },
              { q: '¿Las tallas son estándar?', a: 'Sí, nuestras tallas siguen la tabla de medidas peruanas estándar. Revisa nuestra guía de tallas para más detalles.' },
            ]).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <FaqItem question={item.q} answer={item.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{handleSc('newsletter', 'title', 'Recibe ofertas exclusivas')}</h2>
          <p className="mt-2 text-muted-foreground">{handleSc('newsletter', 'subtitle', 'Suscríbete y obtén un 10% de descuento en tu primera compra')}</p>
          <div className="mt-6 flex gap-2 max-w-md mx-auto">
            <Input
              placeholder={handleSc('newsletter', 'placeholder', 'tu@email.com')}
              className="h-12 rounded-xl"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <Button className="text-white rounded-xl px-6 h-12 font-semibold whitespace-nowrap" style={{ backgroundColor: 'var(--store-primary, #171717)' }}>
              {handleSc('newsletter', 'btnText', 'Suscribirme')}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/70">{handleSc('newsletter', 'footer', 'Sin spam. Puedes darte de baja cuando quieras.')}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 text-white" style={{ backgroundColor: 'var(--store-primary, #171717)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {dynamicStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-bold">
                  <AnimatedCounter target={stat.value} />
                </p>
                <p className="text-muted-foreground/70 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-muted to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {handleSc('cta', 'title', '¿Listo para encontrar tu estilo?')}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              {handleSc('cta', 'subtitle', 'Únete a cientos de clientes que ya confiaron en nosotros. Tu próxima prenda favorita te está esperando.')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="text-white rounded-full px-8 h-12 font-semibold"
                style={{ backgroundColor: 'var(--store-accent, #171717)' }}
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {handleSc('cta', 'btnText', 'Ver Catálogo Completo')}
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 font-semibold border-border hover:bg-muted"
                onClick={() => {
                  if (hasOffers) {
                    document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {hasOffers ? (
                  <><Flame className="w-4 h-4 mr-1.5 text-orange-500" /> Ver Ofertas</>
                ) : (
                  <><LayoutGrid className="w-4 h-4 mr-1.5" /> Ver Categorías</>
                )}
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground/70">
              {handleSc('cta', 'footer', 'Envío gratis desde S/199 · Pago contra entrega · Garantía de 30 días')}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
