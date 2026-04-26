'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useStorefrontStore } from '@/components/storefront/storefront-store'

// ── Importar Storefront con SSR deshabilitado para evitar crash ──
// Esto garantiza que el componente client-side no intente renderizar
// en el servidor (donde Zustand, localStorage, etc. no existen)
const Storefront = dynamic(() => import('@/components/storefront'), {
  ssr: false,
  loading: () => <StorefrontSkeleton />,
})

// ── Skeleton profesional que se muestra mientras carga ──────────
function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-[88px] bg-background/80 backdrop-blur-sm border-b border-border/50" />

      {/* Hero skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-10 w-64 bg-muted rounded-xl mb-8 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/50">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-14 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-full bg-muted rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Props del Client Component ──────────────────────────────────
interface ProductPageClientProps {
  slug: string
  productName: string
}

// ═══════════════════════════════════════════════════════════════════
// CLIENT COMPONENT — Renderiza Storefront y abre el modal del producto
// ═══════════════════════════════════════════════════════════════════
//
// - Recibe slug validado desde el Server Component (nunca es null aquí)
// - Usa Zustand store para encontrar el producto completo con sizes, colors
// - Llama openProduct() en useEffect para mostrar el modal
// - Maneja browser back button (popstate) para cerrar el modal
// - Usa dynamic({ ssr: false }) para evitar renderizado en servidor
//

export default function ProductPageClient({ slug, productName }: ProductPageClientProps) {
  const router = useRouter()

  // ── Zustand store (solo client-side gracias a dynamic ssr: false) ──
  const products = useStorefrontStore((s) => s.products)
  const openProduct = useStorefrontStore((s) => s.openProduct)
  const selectedProduct = useStorefrontStore((s) => s.selectedProduct)
  const setSelectedProduct = useStorefrontStore((s) => s.setSelectedProduct)

  // ── Estado de montaje para evitar hydration mismatch ──
  const [hasMounted, setHasMounted] = useState(false)

  // ── Abrir producto después del primer mount ──
  useEffect(() => {
    if (!slug || !products?.length) {
      setHasMounted(true)
      return
    }

    // Buscar el producto completo del store (tiene sizes, colors, images, etc.)
    const fullProduct = products.find((p) => {
      if (!p?.slug) return false
      return p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase()
    })

    if (fullProduct) {
      // Solo abrir si no es el mismo producto ya seleccionado
      if (!selectedProduct || selectedProduct?.slug !== fullProduct?.slug) {
        openProduct(fullProduct)
      }
    }

    setHasMounted(true)
  }, [slug, products, openProduct, selectedProduct])

  // ── Browser back → cerrar modal y volver a /demo ──
  useEffect(() => {
    if (!selectedProduct) return

    const handlePopState = () => {
      setSelectedProduct(null)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedProduct, setSelectedProduct])

  // ── Mientras carga, mostrar skeleton ──
  if (!hasMounted) {
    return <StorefrontSkeleton />
  }

  // ── Renderizar la tienda completa ──
  // El modal del producto se abre vía useEffect arriba
  return <Storefront />
}
