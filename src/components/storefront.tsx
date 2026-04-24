'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Clock, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { useStorefrontStore } from '@/components/storefront/storefront-store'

// Sub-components
import { StorefrontHeader } from '@/components/storefront/storefront-header'
import { StorefrontHero } from '@/components/storefront/storefront-hero'
import { StorefrontOffers } from '@/components/storefront/storefront-offers'
import { StorefrontCategories } from '@/components/storefront/storefront-categories'
import { StorefrontProducts } from '@/components/storefront/storefront-products'
import { StorefrontContentSections } from '@/components/storefront/storefront-content-sections'
import { StorefrontFooter } from '@/components/storefront/storefront-footer'
import { StorefrontProductDetail } from '@/components/storefront/storefront-product-detail'
import { StorefrontCart } from '@/components/storefront/storefront-cart'
import { StorefrontCheckout } from '@/components/storefront/storefront-checkout'
import { StorefrontFab } from '@/components/storefront/storefront-whatsapp'

interface StorefrontProps {
  storeSlug?: string
}

export default function Storefront({ storeSlug: initialSlug }: StorefrontProps = {}) {
  const effectiveSlug = initialSlug || 'urban-style'
  const store = useStorefrontStore()
  const cart = useCartStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  // ── Derived data ────────────────────────────────────────────
  const filteredProducts = useMemo(() =>
    store.products.filter((p) => {
      const matchCategory = !store.activeCategory || p.category.slug === store.activeCategory
      const matchSearch = !store.searchQuery || p.name.toLowerCase().includes(store.searchQuery.toLowerCase())
      return matchCategory && matchSearch
    }),
    [store.products, store.activeCategory, store.searchQuery]
  )

  const offerProducts = useMemo(() =>
    store.products.filter((p) => p.discount && p.discount > 0),
    [store.products]
  )

  const hasOffers = offerProducts.length > 0
  const shippingCost = cart.totalPrice() > 199 ? 0 : 15
  const orderTotal = cart.totalPrice() + shippingCost

  // ── PWA install listener ─────────────────────────────────────
  useEffect(() => {
    const handleInstallAvailable = () => store.setCanInstallPwa(true)
    const handleInstalled = () => store.setCanInstallPwa(false)
    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-installed', handleInstalled)
    if ((window as any).__canInstallPwa) {
      queueMicrotask(() => store.setCanInstallPwa(true))
    }
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
      window.removeEventListener('pwa-installed', handleInstalled)
    }
  }, [store.setCanInstallPwa])

  const installPwa = async () => {
    const prompt = (window as any).__deferredPrompt
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') {
        store.setCanInstallPwa(false)
        toast({ title: 'App instalada', description: 'La app se instaló correctamente', duration: 1000 })
      }
      ;(window as any).__deferredPrompt = null
    } else {
      store.setShowInstallDialog(true)
    }
  }

  // ── Scroll listener ─────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => store.setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [store.setScrollY])

  // ── MercadoPago URL check on mount ──────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutStatus = params.get('checkout_status')
    const paymentMethod = params.get('payment_method')
    if (checkoutStatus && paymentMethod === 'mercadopago') {
      store.setMpCheckoutStatus(checkoutStatus)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [store.setMpCheckoutStatus])

  // ── Fetch data with retry logic ──────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
      const separator = url.includes('?') ? '&' : '?'
      const bustUrl = `${url}${separator}_cb=${Date.now()}`
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(bustUrl, { cache: 'no-store' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const contentType = res.headers.get('content-type') || ''
          if (!contentType.includes('application/json')) {
            throw new Error(`Response is not JSON: ${contentType}`)
          }
          const data = await res.json()
          return data
        } catch (err) {
          console.warn(`[Storefront] Fetch ${url} attempt ${i + 1}/${retries} failed:`, err)
          if (i < retries - 1) await new Promise(r => setTimeout(r, delay * (i + 1)))
          else throw err
        }
      }
    }

    async function fetchData() {
      try {
        const [storeInfoData, storeContentData, productsData, categoriesData, testimonialsData, paymentMethodsData] = await Promise.all([
          fetchWithRetry(`/api/store/info?slug=${effectiveSlug}`).catch(() => null),
          fetchWithRetry(`/api/store-content?store=${effectiveSlug}`).catch(() => ({})),
          fetchWithRetry(`/api/products?store=${effectiveSlug}`),
          fetchWithRetry(`/api/categories?store=${effectiveSlug}`),
          fetchWithRetry(`/api/testimonials?store=${effectiveSlug}`),
          fetchWithRetry(`/api/store/payment-methods?storeId=${user?.storeId || 'kmpw0h5ig4o518kg4zsm5huo3'}`),
        ])
        if (cancelled) return
        // Load store content (hero, features, stats, etc.)
        if (storeContentData && typeof storeContentData === 'object' && !storeContentData.error) {
          store.setStoreContent(storeContentData)
        }
        // Load store info into state
        if (storeInfoData && !storeInfoData.error) {
          store.setStoreInfo(storeInfoData)
          store.setStoreName(storeInfoData.name || '')
          store.setStoreLogo(storeInfoData.logo || '')
          store.setStoreDescription(storeInfoData.description || '')
          if (storeInfoData.whatsappNumber) {
            const digits = storeInfoData.whatsappNumber.replace(/[^0-9]/g, '')
            if (digits) store.setStoreWhatsApp(digits)
          }
        } else {
          store.setStoreName('Mi Tienda')
        }
        store.setProducts(Array.isArray(productsData) ? productsData : [])
        store.setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        store.setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
        if (Array.isArray(paymentMethodsData?.methods)) {
          store.setPaymentMethods(paymentMethodsData.methods)
        }
      } catch (error) {
        console.error('[Storefront] Error fetching data:', error)
        store.setProducts([])
        store.setCategories([])
        store.setTestimonials([])
      } finally {
        if (!cancelled) store.setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [effectiveSlug, user?.storeId, store])

  // ── Checkout open handler ───────────────────────────────────
  const openCheckout = useCallback(() => {
    cart.closeCart()
    store.setCheckoutStep(1)
    store.setCustomerName(user?.name || '')
    store.setCustomerPhone('')
    store.setCustomerAddress('')
    store.setOrderNotes('')
    store.setTermsAccepted(false)
    store.setSelectedPaymentMethod('')
    store.setCreatedOrder(null)
    store.setMpCheckoutStatus(null)
    setTimeout(() => store.setCheckoutOpen(true), 150)
  }, [cart, store, user?.name])

  // ── WhatsApp order URL builder ──────────────────────────────
  const getWhatsAppOrderUrl = useCallback(() => {
    if (cart.items.length > 0) {
      const items = cart.items.map((item, i) =>
        `  ${i + 1}️⃣ *${item.name}*\n  📏 Talla: ${item.size} · 🎨 Color: ${item.color}\n  📦 Cantidad: ${item.quantity}\n  💰 S/ ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n\n')
      const shipping = cart.totalPrice() > 199 ? '✅ Envío gratis' : '🚚 Envío: S/ 15.00'
      const total = cart.totalPrice() > 199 ? cart.totalPrice() : cart.totalPrice() + 15
      const fullMessage = encodeURIComponent(
        `🛒 *PEDIDO - ${store.storeName || 'Mi Tienda'}*\n` +
        `━━━━━━━━━━━━━━━━━\n\n` +
        `${items}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `${shipping}\n` +
        `💳 *TOTAL: S/ ${total.toFixed(2)}*\n\n` +
        `¡Gracias por tu compra! 🙌`
      )
      return `https://wa.me/${store.storeWhatsApp}?text=${fullMessage}`
    }
    const defaultMsg = encodeURIComponent('Hola! 👋 Quiero información sobre sus productos. Gracias!')
    return `https://wa.me/${store.storeWhatsApp}?text=${defaultMsg}`
  }, [cart.items, cart.totalPrice, store.storeName, store.storeWhatsApp])

  return (
    <div className="min-h-screen flex flex-col bg-background" style={store.storeInfo?.fontFamily && store.storeInfo.fontFamily !== 'system-ui' ? { fontFamily: `${store.storeInfo.fontFamily}, sans-serif` } : undefined}>
      {/* Inject CSS custom properties for store theming */}
      {store.storeInfo && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --store-primary: ${store.storeInfo.primaryColor || '#171717'};
            --store-secondary: ${store.storeInfo.secondaryColor || '#fafafa'};
            --store-accent: ${store.storeInfo.accentColor || '#171717'};
            --store-font: ${store.storeInfo.fontFamily || 'system-ui'};
          }
        ` }} />
      )}

      {/* Header */}
      <StorefrontHeader installPwa={installPwa} />

      <main className="flex-1 pt-[88px] md:pt-[96px]">
        {/* MercadoPago Checkout Status Banner */}
        {store.mpCheckoutStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] p-3"
          >
            <div className={`max-w-lg mx-auto rounded-xl p-4 shadow-lg border flex items-start gap-3 ${
              store.mpCheckoutStatus === 'success'
                ? 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800'
                : store.mpCheckoutStatus === 'pending'
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800'
            }`}>
              {store.mpCheckoutStatus === 'success' ? (
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              ) : store.mpCheckoutStatus === 'pending' ? (
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">
                  {store.mpCheckoutStatus === 'success' && '¡Pago aprobado! Tu pedido está confirmado.'}
                  {store.mpCheckoutStatus === 'pending' && 'Tu pago está siendo procesado.'}
                  {store.mpCheckoutStatus === 'failure' && 'El pago fue rechazado.'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {store.mpCheckoutStatus === 'success' && 'Te notificaremos cuando tu pedido sea despachado.'}
                  {store.mpCheckoutStatus === 'pending' && 'Te notificaremos cuando se confirme el pago.'}
                  {store.mpCheckoutStatus === 'failure' && 'Intenta con otro método de pago o comunícate con nosotros.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => store.setMpCheckoutStatus(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Hero Section + Brand Marquee */}
        <StorefrontHero hasOffers={hasOffers} />

        {/* Offers Section */}
        {hasOffers && <StorefrontOffers offerProducts={offerProducts} />}

        {/* Categories */}
        <StorefrontCategories />

        {/* Products */}
        <StorefrontProducts filteredProducts={filteredProducts} loading={store.loading} />

        {/* Promo Banner, Features, Testimonials, FAQ, Newsletter, Stats, CTA */}
        <StorefrontContentSections offerProducts={offerProducts} hasOffers={hasOffers} />
      </main>

      {/* Footer */}
      <StorefrontFooter />

      {/* Product Detail */}
      <StorefrontProductDetail />

      {/* Cart + Wishlist */}
      <StorefrontCart openCheckout={openCheckout} hasOffers={hasOffers} getWhatsAppOrderUrl={getWhatsAppOrderUrl} orderTotal={orderTotal} />

      {/* Checkout */}
      <StorefrontCheckout />

      {/* FAB Menu + Install Dialog */}
      <StorefrontFab getWhatsAppOrderUrl={getWhatsAppOrderUrl} />
    </div>
  )
}
