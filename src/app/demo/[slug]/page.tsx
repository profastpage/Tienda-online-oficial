'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// ── Import the server-safe product data (works in both server & client) ──
import { getProductBySlug } from '@/lib/server-product-data'

// ── Dynamic import with SSR disabled to prevent hydration crashes ──
// The Storefront component uses heavy client-side deps (zustand, framer-motion, etc.)
const Storefront = dynamic(() => import('@/components/storefront'), { ssr: false })

// ── Loading skeleton shown while Storefront hydrates ──
function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-[88px] bg-background/80 backdrop-blur-sm border-b border-border/50" />
      {/* Content skeleton */}
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

// ── Product not found component ──
function ProductNotFound({ slug }: { slug: string }) {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          El producto <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">/{slug}</span> no existe o fue removido de la tienda.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/demo')}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-sm transition-colors"
          >
            Ir a la tienda
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-border hover:bg-muted rounded-xl font-medium text-sm transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page component ──────────────────────────────────────────
export default function DemoProductPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const slug = params.slug as string

  // Local state to track if product is valid (safe for initial render)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  // Safe server-safe lookup (no zustand, no client deps)
  const product = useMemo(() => {
    if (!slug) return null
    return getProductBySlug(slug)
  }, [slug])

  // Validate slug and open product after mount
  useEffect(() => {
    setHasMounted(true)

    if (!product) {
      setIsValid(false)
      return
    }

    setIsValid(true)

    // Dynamically import the zustand store ONLY on the client after mount
    // to avoid hydration issues
    import('@/components/storefront/storefront-store').then(({ useStorefrontStore }) => {
      const store = useStorefrontStore.getState()
      // Only open if not already showing this product
      if (!store.selectedProduct || store.selectedProduct.slug !== slug) {
        // Find the full product data from the store (has sizes, colors, etc.)
        const fullProduct = store.products.find((p) => p.slug === slug)
        if (fullProduct) {
          useStorefrontStore.getState().openProduct(fullProduct)
        }
      }
    }).catch(() => {
      // If store import fails, the Storefront component will handle it
    })
  }, [slug, product])

  // Listen for browser back to close modal
  useEffect(() => {
    if (!hasMounted) return
    const handlePopState = () => {
      import('@/components/storefront/storefront-store').then(({ useStorefrontStore }) => {
        useStorefrontStore.getState().setSelectedProduct(null)
      }).catch(() => {})
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasMounted])

  // ── Before mount: show skeleton (prevents flash of wrong content) ──
  if (!hasMounted) {
    return <StorefrontSkeleton />
  }

  // ── Product not found ──
  if (!isValid || !product) {
    return <ProductNotFound slug={slug} />
  }

  // ── Valid product: render Storefront (modal will auto-open via useEffect) ──
  return <Storefront />
}
