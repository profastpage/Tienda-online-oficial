'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Storefront from '@/components/storefront'
import { useStorefrontStore } from '@/components/storefront/storefront-store'
import { getProductBySlug } from '@/lib/server-product-data'

// ── Skeleton que se muestra mientras carga el Storefront ────────
function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[88px] bg-background/80 backdrop-blur-sm border-b border-border/50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

// ── Componente principal ────────────────────────────────────────
export default function DemoProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  // ── Lectura directa del Zustand store (import estático, no dinámico) ──
  const products = useStorefrontStore((s) => s.products)
  const openProduct = useStorefrontStore((s) => s.openProduct)
  const selectedProduct = useStorefrontStore((s) => s.selectedProduct)
  const setSelectedProduct = useStorefrontStore((s) => s.setSelectedProduct)

  // ── Estado local para manejar la carga inicial ──
  const [isReady, setIsReady] = useState(false)

  // ── Validar slug y abrir producto después del mount ──
  useEffect(() => {
    if (!slug) {
      setIsReady(true)
      return
    }

    // 1. Validar que el slug exista en los datos
    const meta = getProductBySlug(slug)
    if (!meta) {
      // Slug inválido → redirigir a /demo sin crash
      setIsReady(true)
      return
    }

    // 2. Buscar el producto completo del store (tiene sizes, colors, etc.)
    const fullProduct = products.find(
      (p) => p.slug === slug || p.slug === meta.slug
    )

    if (fullProduct) {
      // Solo abrir si no es el mismo producto ya seleccionado
      if (!selectedProduct || selectedProduct.slug !== fullProduct.slug) {
        openProduct(fullProduct)
      }
    }

    // 3. Marcar como listo para renderizar
    setIsReady(true)
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

  // ── Antes de estar listo: mostrar skeleton ──
  if (!isReady) {
    return <StorefrontSkeleton />
  }

  // ── Renderizar la tienda completa (el modal del producto se abre vía useEffect) ──
  return <Storefront />
}
