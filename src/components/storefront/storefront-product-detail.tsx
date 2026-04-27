'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Heart, ShoppingBag, MessageCircle, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useStorefrontStore } from './storefront-store'
import { getProductImages } from './storefront-types'
import type { Product } from './storefront-types'

// Fallback image for broken product images
const IMG_FALLBACK = '/og-default.png'

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  if (e.currentTarget.src !== IMG_FALLBACK) {
    e.currentTarget.src = IMG_FALLBACK
    e.currentTarget.onerror = null // prevent infinite loop
  }
}

// ── Animation variants ──────────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  // Mobile: slide up from bottom — FAST tween for instant feel
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// Desktop: scale + fade — FAST tween
const modalDesktopVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 1, 1],
    },
  },
}

export function StorefrontProductDetail() {
  const selectedProduct = useStorefrontStore((s) => s.selectedProduct)
  const selectedSize = useStorefrontStore((s) => s.selectedSize)
  const selectedColor = useStorefrontStore((s) => s.selectedColor)
  const selectedQuantity = useStorefrontStore((s) => s.selectedQuantity)
  const addedToCart = useStorefrontStore((s) => s.addedToCart)
  const selectedImageView = useStorefrontStore((s) => s.selectedImageView)
  const storeWhatsApp = useStorefrontStore((s) => s.storeWhatsApp)

  const setSelectedProduct = useStorefrontStore((s) => s.setSelectedProduct)
  const setSelectedSize = useStorefrontStore((s) => s.setSelectedSize)
  const setSelectedColor = useStorefrontStore((s) => s.setSelectedColor)
  const setSelectedQuantity = useStorefrontStore((s) => s.setSelectedQuantity)
  const setAddedToCart = useStorefrontStore((s) => s.setAddedToCart)
  const setSelectedImageView = useStorefrontStore((s) => s.setSelectedImageView)

  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { toast } = useToast()

  const router = useRouter()
  const pathname = usePathname()
  const galleryRef = useRef<HTMLDivElement>(null)
  const productDetailTouchStart = useRef(0)
  const productDetailTouchEnd = useRef(0)
  const isNavigatingRef = useRef(false)

  // Close modal and go back (soft navigation)
  const closeProductAndGoBack = useCallback(() => {
    if (isNavigatingRef.current) return
    isNavigatingRef.current = true
    setSelectedProduct(null)
    setSelectedSize('')
    setSelectedColor('')
    setSelectedQuantity(1)
    // Use router.back() for fluid close — this triggers popstate
    // which the @modal intercepting route handles to dismiss the modal
    if (pathname.startsWith('/demo/') && pathname !== '/demo') {
      router.back()
    }
    setTimeout(() => { isNavigatingRef.current = false }, 400)
  }, [setSelectedProduct, setSelectedSize, setSelectedColor, router, pathname])

  // Lock body scroll when modal is open, restore on close
  // Uses overflow:hidden only (NO position:fixed) to avoid visual jump
  // Scroll position is preserved by the browser's native scroll restoration
  useEffect(() => {
    if (!selectedProduct) return
    // Save current scroll position
    const scrollY = window.scrollY
    // Lock scroll without position:fixed (avoids layout shift)
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      // Restore scroll position after a frame to avoid visual jump
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
      })
    }
  }, [selectedProduct])

  // Listen for browser back button to close modal
  useEffect(() => {
    if (!selectedProduct) return
    const handlePopState = () => {
      setSelectedProduct(null)
      setSelectedSize('')
      setSelectedColor('')
      setSelectedQuantity(1)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedProduct, setSelectedProduct, setSelectedSize, setSelectedColor, setSelectedQuantity])

  const scrollToGalleryImage = useCallback((index: number) => {
    setSelectedImageView(index)
    if (galleryRef.current) {
      const thumbWidth = 72
      const gap = 8
      galleryRef.current.scrollTo({ left: index * (thumbWidth + gap), behavior: 'smooth' })
    }
  }, [setSelectedImageView])

  const getWhatsAppProductUrl = useCallback((product: Product, size?: string, color?: string) => {
    let msg = `¡Hola! Me interesa el producto:\n📦 ${product.name}\n💰 S/ ${product.price.toFixed(2)}`
    if (size) msg += `\n📏 Talla: ${size}`
    if (color) msg += `\n🎨 Color: ${color}`
    const encoded = encodeURIComponent(msg)
    return `https://wa.me/${storeWhatsApp}?text=${encoded}`
  }, [storeWhatsApp])

  const handleAddToCart = useCallback((product: Product) => {
    if (!selectedSize) return
    const sizes = JSON.parse(product.sizes) as string[]
    const colors = JSON.parse(product.colors) as { name: string; hex: string }[]
    // Add the selected quantity of items
    for (let i = 0; i < selectedQuantity; i++) {
      cart.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize || sizes[0],
        color: selectedColor || colors[0]?.name || '',
      })
    }
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      setSelectedProduct(null)
      setSelectedSize('')
      setSelectedColor('')
      setSelectedQuantity(1)
      if (pathname.startsWith('/demo/') && pathname !== '/demo') {
        router.back()
      }
    }, 1500)
  }, [selectedSize, selectedColor, selectedQuantity, cart, setAddedToCart, setSelectedProduct, setSelectedSize, setSelectedColor, setSelectedQuantity, pathname, router])

  return (
    <AnimatePresence mode="wait">
      {selectedProduct && (
        // ── Outer overlay ──
        <motion.div
          key="product-modal-overlay"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          onClick={() => !addedToCart && closeProductAndGoBack()}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15 }}
        >
          {/* Dark backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
          />

          {/* ── Modal content ── */}
          <motion.div
            className="relative bg-card rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[92vh] md:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors"
              onClick={closeProductAndGoBack}
            >
              <X className="w-5 h-5 text-foreground/70" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Product Image Gallery */}
              <div className="bg-muted relative">
                {/* Main Image with Navigation + Swipe Support */}
                {(() => {
                  const imgs = getProductImages(selectedProduct)
                  const maxIdx = imgs.length - 1
                  return (
                    <div
                      className="aspect-square relative overflow-hidden group"
                      onTouchStart={(e) => { productDetailTouchStart.current = e.touches[0].clientX }}
                      onTouchMove={(e) => { productDetailTouchEnd.current = e.touches[0].clientX }}
                      onTouchEnd={() => {
                        const diff = productDetailTouchStart.current - productDetailTouchEnd.current
                        if (Math.abs(diff) > 50) {
                          if (diff > 0 && selectedImageView < maxIdx) {
                            setSelectedImageView(selectedImageView + 1)
                            scrollToGalleryImage(selectedImageView + 1)
                          } else if (diff < 0 && selectedImageView > 0) {
                            setSelectedImageView(selectedImageView - 1)
                            scrollToGalleryImage(selectedImageView - 1)
                          }
                        }
                      }}
                    >
                      <img
                        src={imgs[selectedImageView] || selectedProduct.image}
                        alt={`${selectedProduct.name} - Imagen ${selectedImageView + 1}`}
                        className="w-full h-full object-cover transition-all duration-500"
                        onError={handleImgError}
                      />
                      {/* View indicator */}
                      {imgs.length > 1 && (
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          {selectedImageView + 1} / {imgs.length}
                        </div>
                      )}
                      {/* Left Arrow */}
                      {selectedImageView > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedImageView(selectedImageView - 1); scrollToGalleryImage(selectedImageView - 1) }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-background transition-all md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>
                      )}
                      {/* Right Arrow */}
                      {selectedImageView < maxIdx && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedImageView(selectedImageView + 1); scrollToGalleryImage(selectedImageView + 1) }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-background transition-all md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 text-foreground" />
                        </button>
                      )}
                    </div>
                  )
                })()}
                {/* Thumbnail strip */}
                {(() => {
                  const imgs = getProductImages(selectedProduct)
                  if (imgs.length > 1) {
                    return (
                      <div className="flex gap-2 p-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide" ref={galleryRef}>
                        {imgs.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); scrollToGalleryImage(idx) }}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden snap-start transition-all duration-200 ${
                              selectedImageView === idx
                                ? 'ring-2 ring-primary ring-offset-2 scale-105'
                                : 'ring-1 ring-border hover:ring-ring opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Imagen ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={handleImgError}
                            />
                            {selectedImageView === idx && (
                              <div className="absolute inset-0 bg-neutral-900/20" />
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
              <div className="p-6 md:p-8 flex flex-col">
                <Badge variant="secondary" className="w-fit text-xs uppercase tracking-wider mb-2">
                  {selectedProduct.category.name}
                </Badge>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-foreground">{selectedProduct.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full shrink-0 transition-all ${wishlist.isInWishlist(selectedProduct.id) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
                    onClick={() => {
                      wishlist.toggleItem({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        image: selectedProduct.image,
                        slug: selectedProduct.slug,
                      })
                      toast({
                        title: wishlist.isInWishlist(selectedProduct.id) ? 'Agregado a favoritos' : 'Eliminado de favoritos',
                        description: selectedProduct.name,
                        duration: 800,
                      })
                    }}
                  >
                    <Heart className={`w-5 h-5 ${wishlist.isInWishlist(selectedProduct.id) ? 'fill-red-500' : ''}`} />
                  </Button>
                </div>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(selectedProduct.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30 fill-muted-foreground/30'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedProduct.rating} ({selectedProduct.reviewCount} reseñas)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    S/ {selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.comparePrice && (
                    <>
                      <span className="text-lg text-muted-foreground/70 line-through">
                        S/ {selectedProduct.comparePrice.toFixed(2)}
                      </span>
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30 text-xs">
                        -{selectedProduct.discount}%
                      </Badge>
                    </>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Size Selection */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {(JSON.parse(selectedProduct.sizes) as string[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground/70 hover:border-ring'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                {(JSON.parse(selectedProduct.colors) as { name: string; hex: string }[]).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Color {selectedColor && <span className="font-normal text-muted-foreground">· {selectedColor}</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      {(JSON.parse(selectedProduct.colors) as { name: string; hex: string }[]).map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                          className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-all ${
                            selectedColor === color.name
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'border-2 border-border'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Cantidad</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                      disabled={selectedQuantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-base font-bold text-foreground">{selectedQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedQuantity(Math.min(10, selectedQuantity + 1))}
                      disabled={selectedQuantity >= 10}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to cart + WhatsApp */}
                <div className="mt-auto pt-6">
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 h-12 rounded-xl font-semibold text-sm transition-all relative overflow-hidden ${
                        addedToCart
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white'
                      }`}
                      onClick={() => handleAddToCart(selectedProduct)}
                      disabled={!selectedSize && !addedToCart}
                    >
                      {addedToCart ? (
                        <span className="flex items-center gap-2">
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </motion.svg>
                          Agregado
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          Agregar al carrito
                        </span>
                      )}
                    </Button>
                    {/* Floating notification */}
                    <AnimatePresence>
                      {addedToCart && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg z-10"
                        >
                          Agregado al carrito ✓
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {storeWhatsApp && (
                      <Button
                        className="h-12 w-12 rounded-xl bg-green-600 hover:bg-green-700 text-white shrink-0"
                        size="icon"
                        asChild
                      >
                        <a
                          href={getWhatsAppProductUrl(
                            selectedProduct,
                            selectedSize || undefined,
                            selectedColor || undefined
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {!selectedSize && !addedToCart && (
                    <p className="text-xs text-center text-muted-foreground/70 mt-2">
                      Selecciona una talla para continuar
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
