'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Storefront from '@/components/storefront'
import { useStorefrontStore } from '@/components/storefront/storefront-store'
import { localProducts } from '@/components/storefront/storefront-local-data'

export default function DemoProductPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const slug = params.slug as string

  const openProduct = useStorefrontStore((s) => s.openProduct)
  const setSelectedProduct = useStorefrontStore((s) => s.setSelectedProduct)
  const selectedProduct = useStorefrontStore((s) => s.selectedProduct)

  // Find product from local data by slug
  const product = useMemo(() => {
    if (!slug) return null
    return localProducts.find((p) => p.slug === slug) || null
  }, [slug])

  // Auto-open product detail when arriving via direct URL or navigation
  useEffect(() => {
    if (product && (!selectedProduct || selectedProduct.slug !== slug)) {
      openProduct(product)
    }
  }, [slug, product, openProduct, selectedProduct])

  // Handle browser back/forward — sync modal state
  useEffect(() => {
    if (!slug && selectedProduct) {
      setSelectedProduct(null)
    }
  }, [slug, selectedProduct, setSelectedProduct])

  return <Storefront />
}
