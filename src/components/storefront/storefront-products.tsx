'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStorefrontStore } from './storefront-store'
import { SwipeableProductImage } from './storefront-utils'
import type { Product } from './storefront-types'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'name-asc', label: 'Nombre: A-Z' },
] as const
function SkeletonProductCard() {
  return (
    <div
      className="
        bg-card rounded-2xl overflow-hidden
        shadow-[4px_4px_12px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.6)]
        dark:shadow-[4px_4px_12px_rgba(0,0,0,0.25),-2px_-2px_8px_rgba(255,255,255,0.03)]
        border border-border/50
      "
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ backgroundSize: '200% 100%', animationDuration: '1.8s' }} />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded-full w-16 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDuration: '1.8s' }} />
        <div className="h-4 bg-muted rounded-full w-full animate-shimmer" style={{ backgroundSize: '200% 100%', animationDuration: '2s' }} />
        <div className="h-3 bg-muted rounded-full w-20 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDuration: '2.2s' }} />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-5 bg-muted rounded-full w-20 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDuration: '2.4s' }} />
          <div className="h-5 bg-muted rounded-full w-14 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDuration: '2.6s' }} />
        </div>
      </div>
    </div>
  )
}

// ═══ Fade-in Up wrapper for products ═══
function AnimatedProductCard({
  product,
  index,
}: {
  product: Product
  index: number
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.03, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <div
        className="
          bg-card rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col
          border border-border/50
          transition-all duration-500 ease-out
          /* Soft UI shadows — neumorphism inspired */
          shadow-[4px_4px_12px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.6)]
          dark:shadow-[4px_4px_12px_rgba(0,0,0,0.25),-2px_-2px_8px_rgba(255,255,255,0.03)]
          hover:shadow-[8px_8px_24px_rgba(0,0,0,0.08),-4px_-4px_16px_rgba(255,255,255,0.7)]
          dark:hover:shadow-[8px_8px_24px_rgba(0,0,0,0.35),-4px_-4px_16px_rgba(255,255,255,0.04)]
          hover:-translate-y-1
        "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image with zoom effect */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Shimmer while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" style={{ backgroundSize: '200% 100%', animationDuration: '1.8s' }} />
          )}

          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`
              w-full h-full object-cover
              transition-transform duration-700 ease-out
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            draggable={false}
          />

          {/* SwipeableProductImage overlays — shown on top */}
          <SwipeableProductImage product={product} />
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
            {product.category.name}
          </p>
          <h3 className="mt-1 font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
            {product.name}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground/30 fill-muted-foreground/30'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground/70">({product.reviewCount})</span>
          </div>
          {/* Price */}
          <div className="mt-auto pt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                S/ {product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground/70 line-through">
                  S/ {product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Colors */}
            <div className="flex items-center gap-1.5 mt-2">
              {(JSON.parse(product.colors) as { name: string; hex: string }[]).map((color, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-border/50 transition-transform duration-200 hover:scale-125"
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
    </motion.div>
  )
}

// ═══ Main Component ═══
interface StorefrontProductsProps {
  filteredProducts: Product[]
  loading: boolean
}

export function StorefrontProducts({ filteredProducts, loading }: StorefrontProductsProps) {
  const pathname = usePathname()
  const categories = useStorefrontStore((s) => s.categories)
  const activeCategory = useStorefrontStore((s) => s.activeCategory)
  const searchQuery = useStorefrontStore((s) => s.searchQuery)
  const sortOption = useStorefrontStore((s) => s.sortOption)
  const openProduct = useStorefrontStore((s) => s.openProduct)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)
  const setSearchQuery = useStorefrontStore((s) => s.setSearchQuery)
  const setSortOption = useStorefrontStore((s) => s.setSortOption)
  const [sortOpen, setSortOpen] = useState(false)

  const currentSort = SORT_OPTIONS.find(o => o.value === sortOption)

  // Optimistic instant modal open — bypasses intercepted route delay
  const handleProductClick = useCallback((product: Product) => {
    openProduct(product)
  }, [openProduct])

  return (
    <section id="products" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {activeCategory
                ? categories.find((c) => c.slug === activeCategory)?.name || 'Productos'
                : 'Productos Destacados'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {loading ? 'Cargando...' : `${filteredProducts.length} productos encontrados`}
            </p>
          </div>
          {activeCategory && (
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setActiveCategory(null)}
            >
              Ver todos los productos
            </Button>
          )}
          {/* Sort Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium rounded-full"
              onClick={() => setSortOpen(!sortOpen)}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {currentSort?.label || 'Ordenar'}
              <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </Button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-popover border rounded-xl shadow-lg py-1 min-w-[200px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortOption(opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        sortOption === opt.value
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'hover:bg-accent/50 text-foreground/70'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/demo/${product.slug}`}
                scroll={false}
                prefetch={true}
                onClick={() => handleProductClick(product)}
              >
                <AnimatedProductCard
                  product={product}
                  index={index}
                />
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-muted-foreground text-lg font-medium">
              {activeCategory || searchQuery
                ? 'No se encontraron productos con ese filtro'
                : 'No se encontraron productos'}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {activeCategory || searchQuery
                ? 'Intenta con otra categoría o término de búsqueda'
                : 'Intenta recargar la página'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              {(activeCategory || searchQuery) && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setActiveCategory(null)
                    setSearchQuery('')
                  }}
                >
                  Ver todos los productos
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
