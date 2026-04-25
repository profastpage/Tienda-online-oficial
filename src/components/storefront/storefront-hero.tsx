'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ChevronRight, Flame, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStorefrontStore } from './storefront-store'
import { sc, scJson } from './storefront-types'
import type { StoreContentData } from './storefront-types'

interface StorefrontHeroProps {
  hasOffers: boolean
}

export function StorefrontHero({ hasOffers }: StorefrontHeroProps) {
  const storeName = useStorefrontStore((s) => s.storeName)
  const storeContent = useStorefrontStore((s) => s.storeContent)
  const currentHero = useStorefrontStore((s) => s.currentHero)
  const setCurrentHero = useStorefrontStore((s) => s.setCurrentHero)

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

  const dynamicHeroImages = [
    handleSc('hero', 'image1', '/images/hero/banner.png'),
    handleSc('hero', 'image2', '/images/hero/banner-2.png'),
    handleSc('hero', 'image3', '/images/hero/banner-3.png'),
  ].filter((img, i, arr) => arr.indexOf(img) === i) // deduplicate

  // Hero carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((currentHero + 1) % Math.max(dynamicHeroImages.length, 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [dynamicHeroImages.length, currentHero, setCurrentHero])

  const dynamicBrands = scJson<string[]>(storeContent, 'brands', 'items', ['KUNA', 'ÑAÑA', 'MISTURA', 'ALPACA', 'TUMI', 'INTI', 'WAYKI', 'CHAKRA'])

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-muted text-foreground hover:bg-muted">
                {handleSc('hero', 'badge', '🔥 Nueva Colección 2026')}
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                {handleSc('hero', 'title1', 'Estilo urbano')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/70 to-foreground/50">
                  {handleSc('hero', 'title2', 'sin límites')}
                </span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
                {handleSc('hero', 'subtitle', hasOffers
                  ? 'Ofertas exclusivas en streetwear. Calidad, diseño y precios increíbles en cada prenda.'
                  : 'Descubre nuestra colección premium de streetwear. Calidad, diseño y comodidad en cada prenda.')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="text-white rounded-full px-8 h-12 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--store-primary, #171717)' }}
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {handleSc('hero', 'btnText1', 'Ver Colección')}
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 text-sm font-semibold border-border hover:bg-muted"
                  onClick={() => {
                    if (hasOffers) {
                      document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {hasOffers ? (
                    <><Flame className="w-4 h-4 mr-1.5 text-orange-500" /> {handleSc('hero', 'btnText2', 'Ver Ofertas')}</>
                  ) : (
                    <><LayoutGrid className="w-4 h-4 mr-1.5" /> Ver Categorías</>
                  )}
                </Button>
              </div>
              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>{handleSc('hero', 'trustText1', '✅ Envío gratis')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>{handleSc('hero', 'trustText2', '💰 Pago contra entrega')}</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-lg">
                {/* Hero carousel with crossfade */}
                {dynamicHeroImages.length > 0 ? dynamicHeroImages.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={`${storeName} Collection ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      idx === currentHero % dynamicHeroImages.length ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-neutral-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Carousel dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {dynamicHeroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHero(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentHero ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-4 -left-4 md:left-4 bg-card rounded-xl shadow-lg p-4 border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-lg">{handleSc('hero', 'stat1Icon', '⭐')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{handleSc('hero', 'stat1Value', '4.8/5')}</p>
                    <p className="text-xs text-muted-foreground">{handleSc('hero', 'stat1Label', '+200 reseñas')}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="hidden md:block absolute -bottom-4 right-4 bg-card rounded-xl shadow-lg p-4 border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-lg">{handleSc('hero', 'stat2Icon', '🚚')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{handleSc('hero', 'stat2Value', 'Envío rápido')}</p>
                    <p className="text-xs text-muted-foreground">{handleSc('hero', 'stat2Label', '1-3 días hábiles')}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="py-6 bg-muted border-y border-border overflow-hidden">
        <div className="flex animate-marquee">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 items-center gap-12 px-6">
              {dynamicBrands.map((brand) => (
                <span key={`${setIdx}-${brand}`} className="text-2xl font-bold text-neutral-300 whitespace-nowrap tracking-wider">
                  {brand}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
