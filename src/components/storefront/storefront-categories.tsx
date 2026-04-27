'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStorefrontStore } from './storefront-store'
import { sc } from './storefront-types'

export function StorefrontCategories() {
  const storeContent = useStorefrontStore((s) => s.storeContent)
  const categories = useStorefrontStore((s) => s.categories)
  const activeCategory = useStorefrontStore((s) => s.activeCategory)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

  return (
    <section id="categories" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {handleSc('categories', 'title', 'Explora por Categoría')}
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            {handleSc('categories', 'subtitle', 'Encuentra exactamente lo que buscas')}
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
              className={`group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer transition-all duration-300 ${
                activeCategory === cat.slug
                  ? 'ring-2 ring-neutral-900 dark:ring-neutral-100 ring-offset-2 dark:ring-offset-neutral-900'
                  : 'hover:shadow-lg'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                <p className="text-white/70 text-sm">{cat._count?.products ?? 0} productos</p>
              </div>
              {activeCategory === cat.slug && (
                <div className="absolute top-3 right-3 bg-neutral-900 text-white rounded-full p-1.5">
                  <X className="w-3 h-3" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
