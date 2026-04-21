'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useStorefrontStore } from './storefront-store'
import { SwipeableProductImage } from './storefront-utils'
import type { Product } from './storefront-types'

interface StorefrontProductsProps {
  filteredProducts: Product[]
  loading: boolean
}

export function StorefrontProducts({ filteredProducts, loading }: StorefrontProductsProps) {
  const categories = useStorefrontStore((s) => s.categories)
  const activeCategory = useStorefrontStore((s) => s.activeCategory)
  const searchQuery = useStorefrontStore((s) => s.searchQuery)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)
  const setSearchQuery = useStorefrontStore((s) => s.setSearchQuery)
  const openProduct = useStorefrontStore((s) => s.openProduct)

  return (
    <section id="products" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-5 bg-muted rounded w-24 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => {
              const isWished = false // wishlist check done inside SwipeableProductImage
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div
                    className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-border h-full flex flex-col"
                    onClick={() => openProduct(product)}
                  >
                    {/* Swipeable Product Image - Instagram Style */}
                    <SwipeableProductImage
                      product={product}
                      onClick={() => openProduct(product)}
                    />

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                        {product.category.name}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-foreground/70 transition-colors">
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
                </motion.div>
              )
            })}
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
