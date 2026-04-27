'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Flame, ChevronRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useToast } from '@/hooks/use-toast'
import { useStorefrontStore } from './storefront-store'
import { sc } from './storefront-types'
import type { Product } from './storefront-types'

interface StorefrontOffersProps {
  offerProducts: Product[]
}

export function StorefrontOffers({ offerProducts }: StorefrontOffersProps) {
  const storeContent = useStorefrontStore((s) => s.storeContent)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)
  const openProduct = useStorefrontStore((s) => s.openProduct)
  const wishlist = useWishlistStore()
  const { toast } = useToast()

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

  return (
    <section id="ofertas" className="py-12 bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/20 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end sm:items-center justify-between mb-6 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Ofertas
              </h2>
              <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {offerProducts.length} productos
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              {handleSc('offers', 'subtitle', 'Los mejores precios en productos seleccionados')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-medium shrink-0"
            onClick={() => {
              setActiveCategory(null)
              document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Ver todo
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </motion.div>

        {/* Horizontal Scrollable Carousel - Instagram Stories Style */}
        <div className="relative">
          {/* Mobile: full horizontal scroll, Desktop: grid */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0">
            {offerProducts.map((product, index) => {
              const savings = product.comparePrice
                ? (product.comparePrice - product.price).toFixed(2)
                : ((product.price * (product.discount || 0)) / 100).toFixed(2)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group snap-start shrink-0 w-[260px] md:w-auto"
                >
                  <Link
                    href={`/demo/${product.slug}`}
                    scroll={false}
                    prefetch={true}
                    className="block h-full"
                    onClick={() => openProduct(product)}
                  >
                    <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-border h-full flex flex-col">
                      {/* Product Image with swipe hint */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        {/* Discount Badge - large and prominent */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg shadow-red-500/30">
                            -{product.discount}%
                          </Badge>
                        </div>
                        {/* Wishlist button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-all shadow-sm opacity-100 z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            wishlist.toggleItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              slug: product.slug,
                            })
                            toast({
                              title: wishlist.isInWishlist(product.id) ? 'Agregado a favoritos' : 'Eliminado de favoritos',
                              description: product.name,
                              duration: 800,
                            })
                          }}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        {/* Savings tag */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center justify-between">
                            <span className="text-white/80 text-[11px]">Ahorras</span>
                            <span className="text-white font-bold text-sm">S/ {savings}</span>
                          </div>
                        </div>
                      </div>
                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                          {product.category.name}
                        </p>
                        <h3 className="mt-1 font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-foreground/70 transition-colors">
                          {product.name}
                        </h3>
                        <div className="mt-auto pt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              S/ {product.price.toFixed(2)}
                            </span>
                            {product.comparePrice && (
                              <span className="text-sm text-muted-foreground/70 line-through">
                                S/ {product.comparePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            {(JSON.parse(product.colors) as { name: string; hex: string }[]).slice(0, 4).map((color, i) => (
                              <span
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-border"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                            <span className="text-[11px] text-muted-foreground/70 ml-1">
                              {(JSON.parse(product.sizes) as string[]).length} tallas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
