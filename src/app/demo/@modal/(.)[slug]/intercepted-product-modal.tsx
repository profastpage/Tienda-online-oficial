'use client'

import { useEffect } from 'react'
import { useStorefrontStore } from '@/components/storefront/storefront-store'

// ═══════════════════════════════════════════════════════════════════
// INTERCEPTED PRODUCT MODAL — Client Component
// ═══════════════════════════════════════════════════════════════════
//
// Este componente se monta cuando la ruta es interceptada por @modal.
// Su ÚNICA responsabilidad es activar el modal en Zustand store.
//
// Flujo:
//   1. Se monta con el slug validado del Server Component
//   2. Busca el producto completo en Zustand (sizes, colors, images)
//   3. Llama openProduct() → setea selectedProduct en Zustand
//   4. <StorefrontProductDetail> (dentro de <Storefront>) detecta
//      el cambio y renderiza el modal overlay
//
// Retorna null visualmente — el modal UI viene de StorefrontProductDetail
//

export default function InterceptedProductModal({ slug }: { slug: string }) {
  const products = useStorefrontStore((s) => s.products)
  const openProduct = useStorefrontStore((s) => s.openProduct)

  useEffect(() => {
    if (!slug || !products?.length) return

    // Buscar el producto completo del store (tiene sizes, colors, images, etc.)
    const product = products.find((p) => {
      if (!p?.slug) return false
      return p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase()
    })

    if (product) {
      openProduct(product)
    }
  }, [slug, products, openProduct])

  // El modal visual se renderiza vía <StorefrontProductDetail /> dentro de <Storefront />
  return null
}
