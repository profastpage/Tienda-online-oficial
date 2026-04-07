'use client'

import { motion } from 'framer-motion'
import { Heart, Search, ShoppingBag, ShoppingCart, Menu, X, ChevronRight, ChevronUp, ChevronLeft, LogIn, LogOut, Minus, Plus, Trash2, Sun, Moon, Check, Loader2, Flame, Tag, LayoutGrid, CreditCard, ShieldCheck, Clock, AlertCircle, MessageCircle, Images, Download, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import AiChat from '@/components/ai-chat'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  images?: string
  sizes: string
  colors: string
  discount: number | null
  isNew: boolean
  rating: number
  reviewCount: number
  inStock?: boolean
  category: { name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  _count: { products: number }
}

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
}

// Animated counter component
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const numericTarget = parseInt(target.replace(/\D/g, ''))

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = numericTarget / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericTarget) {
        setCount(numericTarget)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericTarget])

  const prefix = target.match(/^[^0-9]*/)?.[0] || ''
  const postfix = target.match(/[^0-9]*$/)?.[0] || suffix

  return <span>{prefix}{count}{postfix}</span>
}

// Swipeable product image component for mobile (Instagram-style)
function SwipeableProductImage({ product, onClick }: { product: Product; onClick?: () => void }) {
  const [currentView, setCurrentView] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const isDragging = useRef(false)
  const wishlist = useWishlistStore()
  const { toast } = useToast()
  const isWished = wishlist.isInWishlist(product.id)

  const views = [
    { objectPosition: 'center', label: '1/3' },
    { objectPosition: 'center 30%', label: '2/3' },
    { objectPosition: 'center 60%', label: '3/3' },
  ]

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const diff = touchStartX.current - touchEndX.current
    const minSwipe = 50
    if (Math.abs(diff) > minSwipe) {
      if (diff > 0 && currentView < views.length - 1) {
        setCurrentView((prev) => prev + 1)
      } else if (diff < 0 && currentView > 0) {
        setCurrentView((prev) => prev - 1)
      }
    }
    touchStartX.current = 0
    touchEndX.current = 0
  }

  return (
    <div
      className="relative aspect-square overflow-hidden bg-muted"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover transition-all duration-300 ease-out md:group-hover:scale-105"
        style={{ objectPosition: views[currentView].objectPosition }}
        draggable={false}
      />
      {/* Mobile swipe indicator dots - only visible on mobile */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-10">
        {views.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentView ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
      {/* Multi-image badge */}
      {product.images && (() => {
        try { return (JSON.parse(product.images) as string[]).length > 0 } catch { return false }
      })() && (
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <Badge className="bg-black/60 backdrop-blur-sm hover:bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
            <Images className="w-3 h-3 mr-1" />
            {(() => { try { return (JSON.parse(product.images || '[]') as string[]).length + 1 } catch { return 1 } })()}
          </Badge>
        </div>
      )}
      {/* Badges */}
      <div className={`absolute flex flex-col gap-1.5 ${product.images && (() => { try { return (JSON.parse(product.images) as string[]).length > 0 } catch { return false } })() ? 'top-10' : 'top-3'} left-3`}>
        {product.discount && (
          <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
            -{product.discount}%
          </Badge>
        )}
        {product.isNew && (
          <Badge className="bg-neutral-900 hover:bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
            NUEVO
          </Badge>
        )}
      </div>
      {/* Wishlist button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-all shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10`}
        onClick={(e) => {
          e.stopPropagation()
          wishlist.toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            slug: product.slug,
          })
          toast({
            title: wishlist.isInWishlist(product.id) ? 'Agregado a favoritos' : 'Eliminado de favoritos',
            description: product.name,
            duration: 800,
          })
        }}
      >
        <Heart className={`w-4 h-4 ${isWished ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>
      {/* Desktop Quick View Overlay */}
      <div className="hidden md:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            Ver Detalles
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold h-8 w-8 p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              const url = `https://wa.me/${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51933667414') : ''}?text=${encodeURIComponent(`¡Hola! Me interesa el producto:\n📦 ${product.name}\n💰 S/ ${product.price.toFixed(2)}`)}`
              window.open(url, '_blank')
            }}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const heroImages = [
  '/images/hero/banner.png',
  '/images/hero/banner-2.png',
  '/images/hero/banner-3.png',
]

const brands = ['KUNA', 'ÑAÑA', 'MISTURA', 'ALPACA', 'TUMI', 'INTI', 'WAYKI', 'CHAKRA']

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentHero, setCurrentHero] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [selectedImageView, setSelectedImageView] = useState(0)
  const [storeWhatsApp, setStoreWhatsApp] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51933667414')
  const galleryRef = useRef<HTMLDivElement>(null)
  const productDetailTouchStart = useRef(0)
  const productDetailTouchEnd = useRef(0)
  const productImages = useCallback((product: Product): string[] => {
    try {
      const extra = JSON.parse(product.images || '[]') as string[]
      if (extra.length > 0) {
        return [product.image, ...extra.filter(Boolean)]
      }
    } catch {
      // ignore parse errors
    }
    return [product.image]
  }, [])

  const totalProductImages = useCallback((product: Product): number => {
    return productImages(product).length
  }, [productImages])

  const getWhatsAppProductUrl = useCallback((product: Product, size?: string, color?: string, quantity?: number) => {
    let msg = `¡Hola! Me interesa el producto:\n📦 ${product.name}\n💰 S/ ${product.price.toFixed(2)}`
    if (size) msg += `\n📏 Talla: ${size}`
    if (color) msg += `\n🎨 Color: ${color}`
    if (quantity && quantity > 1) msg += `\n🔢 Cantidad: ${quantity}`
    const encoded = encodeURIComponent(msg)
    return `https://wa.me/${storeWhatsApp}?text=${encoded}`
  }, [storeWhatsApp])

  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  // Checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<Array<{id: string; type: string; name: string; qrCode: string; accountNumber: string; accountHolder: string; bankName: string}>>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [createdOrder, setCreatedOrder] = useState<{ id: string; orderNumber: string; status: string; total: number; items: any[] } | null>(null)
  const [mpCheckoutStatus, setMpCheckoutStatus] = useState<string | null>(null)

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Fetch data with retry logic
  useEffect(() => {
    let cancelled = false

    async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
        const [productsData, categoriesData, testimonialsData, paymentMethodsData] = await Promise.all([
          fetchWithRetry('/api/products?store=urban-store'),
          fetchWithRetry('/api/categories?store=urban-store'),
          fetchWithRetry('/api/testimonials?store=urban-store'),
          fetchWithRetry('/api/store/payment-methods?storeId=urban-store'),
        ])
        if (cancelled) return
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
        if (Array.isArray(paymentMethodsData?.methods)) {
          setPaymentMethods(paymentMethodsData.methods)
        }
      } catch (error) {
        console.error('[Storefront] Error fetching data:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchCategory = !activeCategory || p.category.slug === activeCategory
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  // Offers: products with active discount
  const offerProducts = products.filter((p) => p.discount && p.discount > 0)
  const hasOffers = offerProducts.length > 0

  // WhatsApp order message builder
  const getWhatsAppOrderUrl = useCallback(() => {
    if (cart.items.length > 0) {
      const message = cart.items.map((item, i) =>
        `${i + 1}. ${item.name} - Talla: ${item.size} - Color: ${item.color} - Qty: ${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n')
      const total = `Total: S/ ${cart.totalPrice().toFixed(2)}`
      const fullMessage = encodeURIComponent(`Hola! Quiero hacer un pedido:\n\n${message}\n\n${total}\n\nGracias!`)
      return `https://wa.me/${storeWhatsApp}?text=${fullMessage}`
    }
    const defaultMsg = encodeURIComponent('Hola! Quiero información sobre sus productos. Gracias!')
    return `https://wa.me/${storeWhatsApp}?text=${defaultMsg}`
  }, [cart.items, cart.totalPrice])

  const handleAddToCart = (product: Product) => {
    if (!selectedSize) return
    const sizes = JSON.parse(product.sizes) as string[]
    const colors = JSON.parse(product.colors) as { name: string; hex: string }[]
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize || sizes[0],
      color: selectedColor || colors[0]?.name || '',
    })
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      setSelectedProduct(null)
      setSelectedSize('')
      setSelectedColor('')
    }, 1500)
  }

  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    setSelectedSize('')
    setSelectedColor('')
    setAddedToCart(false)
    setSelectedImageView(0)
  }

  const scrollToGalleryImage = (index: number) => {
    setSelectedImageView(index)
    if (galleryRef.current) {
      const thumbWidth = 72
      const gap = 8
      galleryRef.current.scrollTo({ left: index * (thumbWidth + gap), behavior: 'smooth' })
    }
  }

  // Checkout handler
  const shippingCost = cart.totalPrice() > 199 ? 0 : 15
  const orderTotal = cart.totalPrice() + shippingCost

  const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('51')) return digits
    if (digits.length === 9) return '51' + digits
    return '51' + digits
  }

  const isMercadoPagoSelected = selectedPaymentMethod
    ? paymentMethods.find((m) => m.id === selectedPaymentMethod)?.type === 'mercadopago'
    : false

  const handleMercadoPagoCheckout = async () => {
    setCheckoutLoading(true)
    try {
      // Step 1: Create the order
      const formattedPhone = formatPhone(customerPhone)
      const checkoutResponse = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: 'd1whgpglbzf8d42et5xp',
          customerName,
          customerPhone: formattedPhone,
          customerAddress,
          items: cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          notes: orderNotes,
          paymentMethodId: selectedPaymentMethod || null,
          userId: user?.id || null,
        }),
      })
      const checkoutData = await checkoutResponse.json()
      if (!checkoutResponse.ok || !checkoutData.id) {
        throw new Error(checkoutData.message || checkoutData.error || 'Error al crear el pedido')
      }

      // Step 2: Create MercadoPago preference
      const mpResponse = await fetch('/api/payments/mercadopago/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: checkoutData.id,
          storeId: 'd1whgpglbzf8d42et5xp',
          items: cart.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customerName,
          customerEmail: user?.email || undefined,
        }),
      })
      const mpData = await mpResponse.json()
      if (!mpResponse.ok || !mpData.initPoint) {
        throw new Error(mpData.error || 'Error al crear la preferencia de pago')
      }

      // Step 3: Redirect to MercadoPago checkout
      toast({
        title: 'Redirigiendo a MercadoPago...',
        description: 'Serás redirigido para completar el pago de forma segura.',
        duration: 1000,
      })
      setCreatedOrder(checkoutData)
      cart.clearCart()
      window.location.href = mpData.initPoint
    } catch (error: any) {
      console.error('[MercadoPago Checkout] Error:', error)
      toast({ title: 'Error con MercadoPago', description: error.message || 'Intenta de nuevo.', variant: 'destructive' })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (isMercadoPagoSelected) {
      await handleMercadoPagoCheckout()
      return
    }
    setCheckoutLoading(true)
    try {
      const formattedPhone = formatPhone(customerPhone)
      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: 'd1whgpglbzf8d42et5xp',
          customerName,
          customerPhone: formattedPhone,
          customerAddress,
          items: cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          notes: orderNotes,
          paymentMethodId: selectedPaymentMethod || null,
          userId: user?.id || null,
        }),
      })
      const data = await response.json()
      if (response.ok && data.orderNumber) {
        setCreatedOrder(data)
        setCheckoutStep(3)
        cart.clearCart()
        toast({ title: 'Pedido creado exitosamente', description: `Pedido #${data.orderNumber}`, variant: 'default' })
      } else {
        throw new Error(data.message || 'Error creating order')
      }
    } catch (error: any) {
      console.error('[Checkout] Error:', error)
      toast({ title: 'Error al crear el pedido', description: error.message || 'Intenta de nuevo.', variant: 'destructive' })
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Check URL params for MercadoPago redirect on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutStatus = params.get('checkout_status')
    const paymentMethod = params.get('payment_method')
    if (checkoutStatus && paymentMethod === 'mercadopago') {
      setMpCheckoutStatus(checkoutStatus)
      // Clean URL params without reload
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const openCheckout = () => {
    cart.closeCart()
    setCheckoutStep(1)
    setCustomerName(user?.name || '')
    setCustomerPhone('')
    setCustomerAddress('')
    setOrderNotes('')
    setTermsAccepted(false)
    setSelectedPaymentMethod('')
    setCreatedOrder(null)
    setMpCheckoutStatus(null)
    setTimeout(() => setCheckoutOpen(true), 150)
  }

  const closeCheckoutAndCleanup = () => {
    setCheckoutOpen(false)
    setCreatedOrder(null)
    setCheckoutStep(1)
  }

  const shareOrderByWhatsApp = () => {
    if (!createdOrder) return
    const message = encodeURIComponent(`Hola! Acabo de realizar un pedido:

Pedido: #${createdOrder.orderNumber}
Total: S/ ${createdOrder.total.toFixed(2)}
Estado: ${createdOrder.status}

Gracias!`)
    window.open(`https://wa.me/${storeWhatsApp}?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b'
            : 'bg-background border-b border-transparent'
        }`}
      >
        {/* Top bar */}
        <div className="bg-neutral-900 text-white text-center py-2 text-sm">
          <span className="font-medium">ENVÍO GRATIS</span> en pedidos mayores a S/199 ·{' '}
          <span className="hidden sm:inline">Pago seguro contra entrega</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <a href="#" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                    URBAN STYLE
                  </h1>
                  <p className="text-[10px] text-muted-foreground/70 tracking-widest uppercase hidden sm:block">
                    Premium Streetwear
                  </p>
                </div>
              </a>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Inicio', 'Catálogo', 'Novedades', 'Nosotros'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle dark mode"
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              {user ? (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground" onClick={() => router.push(user.role === 'admin' ? '/admin' : '/cliente')}>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">{user.name.charAt(0)}</div>
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground/70 hover:text-red-500 h-8 w-8" onClick={async () => { await logout(); router.push('/login') }}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground" onClick={() => router.push('/login')}>
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Ingresar</span>
                </Button>
              )}
              <div className="hidden sm:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground/70" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-9 w-48 lg:w-64 h-9 text-sm bg-muted border-border rounded-full focus:ring-1 focus:ring-ring"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-foreground relative"
                onClick={wishlist.toggleWishlist}
              >
                <Heart className={`w-5 h-5 ${wishlist.totalItems() > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlist.totalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
                    {wishlist.totalItems()}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-foreground relative"
                onClick={cart.toggleCart}
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.totalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-neutral-900 text-white text-[10px]">
                    {cart.totalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="px-4 py-3">
              <div className="flex items-center relative mb-3">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground/70" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-9 h-9 text-sm bg-muted border-border rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
                <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>
              {/* Install App - only show if PWA installable */}
              {(window as any).__canInstallPwa && (
                <button
                  onClick={async () => {
                    const prompt = (window as any).__deferredPrompt
                    if (prompt) {
                      prompt.prompt()
                      const result = await prompt.userChoice
                      if (result.outcome === 'accepted') {
                        toast({ title: 'App instalada', description: 'La app se instaló correctamente', duration: 1000 })
                      }
                      (window as any).__deferredPrompt = null
                      (window as any).__canInstallPwa = false
                    }
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar App</span>
                </button>
              )}
              <nav className="space-y-1">
                {['Inicio', 'Catálogo', 'Novedades', 'Nosotros'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* MercadoPago Checkout Status Banner */}
        {mpCheckoutStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] p-3"
          >
            <div className={`max-w-lg mx-auto rounded-xl p-4 shadow-lg border flex items-start gap-3 ${
              mpCheckoutStatus === 'success'
                ? 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800'
                : mpCheckoutStatus === 'pending'
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800'
            }`}>
              {mpCheckoutStatus === 'success' ? (
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              ) : mpCheckoutStatus === 'pending' ? (
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">
                  {mpCheckoutStatus === 'success' && '¡Pago aprobado! Tu pedido está confirmado.'}
                  {mpCheckoutStatus === 'pending' && 'Tu pago está siendo procesado.'}
                  {mpCheckoutStatus === 'failure' && 'El pago fue rechazado.'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {mpCheckoutStatus === 'success' && 'Te notificaremos cuando tu pedido sea despachado.'}
                  {mpCheckoutStatus === 'pending' && 'Te notificaremos cuando se confirme el pago.'}
                  {mpCheckoutStatus === 'failure' && 'Intenta con otro método de pago o comunícate con nosotros.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setMpCheckoutStatus(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-muted text-foreground hover:bg-muted">
                  Nueva Colección 2026
                </Badge>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  Estilo urbano
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/70 to-foreground/50">
                    sin límites
                  </span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
                  {hasOffers
                    ? 'Ofertas exclusivas en streetwear. Calidad, diseño y precios increíbles en cada prenda.'
                    : 'Descubre nuestra colección premium de streetwear. Calidad, diseño y comodidad en cada prenda.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-8 h-12 text-sm font-semibold"
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Ver Colección
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 h-12 text-sm font-semibold border-border hover:bg-muted"
                    onClick={() => {
                      if (hasOffers) {
                        document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                      } else {
                        document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    {hasOffers ? (
                      <><Flame className="w-4 h-4 mr-1.5 text-orange-500" /> Ver Ofertas</>
                    ) : (
                      <><LayoutGrid className="w-4 h-4 mr-1.5" /> Ver Categorías</>
                    )}
                  </Button>
                </div>
                {/* Trust indicators */}
                <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span>Envío gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span>Pago contra entrega</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-lg">
                  {/* Hero carousel with crossfade */}
                  {heroImages.map((img, idx) => (
                    <img
                      key={img}
                      src={img}
                      alt={`Urban Style Collection ${idx + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        idx === currentHero ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Carousel dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHero(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentHero ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
                {/* Floating stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 md:left-4 bg-card rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-lg">⭐</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">4.8/5</p>
                      <p className="text-xs text-muted-foreground">+200 reseñas</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="hidden md:block absolute -bottom-4 right-4 bg-card rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-lg">🚚</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Envío rápido</p>
                      <p className="text-xs text-muted-foreground">1-3 días hábiles</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Brand Marquee */}
        <section className="py-6 bg-muted border-y border-border overflow-hidden">
          <div className="flex animate-marquee">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex shrink-0 items-center gap-12 px-6">
                {brands.map((brand) => (
                  <span key={`${setIdx}-${brand}`} className="text-2xl font-bold text-neutral-300 whitespace-nowrap tracking-wider">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Ofertas Section - Instagram Stories Style */}
        {hasOffers && (
          <section id="ofertas" className="py-12 bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/20 dark:to-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-end sm:items-center justify-between mb-6 gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                      Ofertas
                    </h2>
                    <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      {offerProducts.length} productos
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Los mejores precios en productos seleccionados
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-medium shrink-0"
                  onClick={() => {
                    setActiveCategory(null)
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Ver todo
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>

              {/* Horizontal Scrollable Carousel - Instagram Stories Style */}
              <div className="relative">
                {/* Mobile: full horizontal scroll, Desktop: grid */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0">
                  {offerProducts.map((product, index) => {
                    const savings = product.comparePrice
                      ? (product.comparePrice - product.price).toFixed(2)
                      : ((product.price * (product.discount || 0)) / 100).toFixed(2)
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="group snap-start shrink-0 w-[260px] md:w-auto"
                      >
                        <div
                          className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-border h-full flex flex-col"
                          onClick={() => openProduct(product)}
                        >
                          {/* Product Image with swipe hint */}
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            {/* Discount Badge - large and prominent */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg shadow-red-500/30">
                                -{product.discount}%
                              </Badge>
                            </div>
                            {/* Wishlist button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-all shadow-sm opacity-100 z-10`}
                              onClick={(e) => {
                                e.stopPropagation()
                                wishlist.toggleItem({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
                                  slug: product.slug,
                                })
                                toast({
                                  title: wishlist.isInWishlist(product.id) ? 'Agregado a favoritos' : 'Eliminado de favoritos',
                                  description: product.name,
                                  duration: 800,
                                })
                              }}
                            >
                              <Heart className={`w-4 h-4 ${wishlist.isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            {/* Savings tag */}
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center justify-between">
                                <span className="text-white/80 text-[11px]">Ahorras</span>
                                <span className="text-white font-bold text-sm">S/ {savings}</span>
                              </div>
                            </div>
                          </div>
                          {/* Product Info */}
                          <div className="p-4 flex flex-col flex-1">
                            <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                              {product.category.name}
                            </p>
                            <h3 className="mt-1 font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-foreground/70 transition-colors">
                              {product.name}
                            </h3>
                            <div className="mt-auto pt-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  S/ {product.price.toFixed(2)}
                                </span>
                                {product.comparePrice && (
                                  <span className="text-sm text-muted-foreground/70 line-through">
                                    S/ {product.comparePrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                {(JSON.parse(product.colors) as { name: string; hex: string }[]).slice(0, 4).map((color, i) => (
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
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section id="categories" className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Explora por Categoría
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Encuentra exactamente lo que buscas
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
                      ? 'ring-2 ring-neutral-900 ring-offset-2'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-white/70 text-sm">{cat._count.products} productos</p>
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

        {/* Products Section */}
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
                  const isWished = wishlist.isInWishlist(product.id)
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

        {/* Promo Banner - Dynamic: Offers or Categories */}
        {hasOffers ? (
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8 md:p-12 lg:p-16">
                  <Badge className="mb-4 bg-white/10 text-white hover:bg-white/10 border-white/20 text-xs tracking-wider uppercase">
                    🔥 Ofertas Activas
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Hasta {Math.max(...offerProducts.map(p => p.discount || 0))}% de descuento
                  </h2>
                  <p className="mt-4 text-white/80 text-lg">
                    {offerProducts.length} productos en oferta. ¡No te pierdas estas oportunidades!
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full px-8 h-12 font-semibold"
                    onClick={() => document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Flame className="w-4 h-4 mr-1.5" />
                    Ver Todas las Ofertas
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                <div className="hidden md:block h-full min-h-[300px] relative">
                  <div className="absolute inset-0 bg-black/20" />
                  {offerProducts[0] && (
                    <img
                      src={offerProducts[0].image}
                      alt="Productos en oferta"
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        ) : (
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-neutral-900 rounded-3xl overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8 md:p-12 lg:p-16">
                  <Badge className="mb-4 bg-white/10 text-white hover:bg-white/10 border-white/20 text-xs tracking-wider uppercase">
                    Nueva Colección
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Descubre las categorías de nuestra tienda
                  </h2>
                  <p className="mt-4 text-muted-foreground/70 text-lg">
                    Encuentra todo lo que necesitas. Explora nuestras categorías y encuentra tu estilo perfecto.
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full px-8 h-12 font-semibold"
                    onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <LayoutGrid className="w-4 h-4 mr-1.5" />
                    Ver Categorías
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                <div className="hidden md:block h-full min-h-[300px]">
                  <img
                    src="/images/products/hoodie-gray.png"
                    alt="Nuestra Colección"
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        )}

        {/* Features */}
        <section className="py-16 bg-muted border-t border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: '🚚', title: 'Envío Gratis', desc: 'En pedidos +S/199' },
                { icon: '💬', title: 'WhatsApp', desc: 'Pedidos directos' },
                { icon: '💰', title: '0% Comisión', desc: 'Sin cargos extra' },
                { icon: '🔄', title: 'Devolución', desc: '30 días garantía' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Lo que dicen nuestros clientes
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Reseñas verificadas de compradores reales
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-muted rounded-2xl p-6 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30 fill-muted-foreground/30'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/50 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-muted-foreground/70 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recibe ofertas exclusivas</h2>
            <p className="mt-2 text-muted-foreground">Suscríbete y obtén un 10% de descuento en tu primera compra</p>
            <div className="mt-6 flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="tu@email.com"
                className="h-12 rounded-xl"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-6 h-12 font-semibold whitespace-nowrap">
                Suscribirme
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground/70">Sin spam. Puedes darte de baja cuando quieras.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-neutral-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '+120', label: 'Negocios activos' },
                { value: '24/7', label: 'Siempre vendiendo' },
                { value: '0%', label: 'Comisión por venta' },
                { value: '+2K', label: 'Clientes felices' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-4xl md:text-5xl font-bold">
                    <AnimatedCounter target={stat.value} />
                  </p>
                  <p className="text-muted-foreground/70 mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-muted to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                ¿Listo para encontrar tu estilo?
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                Únete a cientos de clientes que ya confiaron en nosotros. Tu próxima prenda favorita te está esperando.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-8 h-12 font-semibold"
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Catálogo Completo
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 font-semibold border-border hover:bg-muted"
                  onClick={() => {
                    if (hasOffers) {
                      document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {hasOffers ? (
                    <><Flame className="w-4 h-4 mr-1.5 text-orange-500" /> Ver Ofertas</>
                  ) : (
                    <><LayoutGrid className="w-4 h-4 mr-1.5" /> Ver Categorías</>
                  )}
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground/70">
                Envío gratis desde S/199 · Pago contra entrega · Garantía de 30 días
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-neutral-900 dark:text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">URBAN STYLE</span>
              </div>
              <p className="text-muted-foreground/70 text-sm leading-relaxed mb-4">
                Tu tienda de streetwear de confianza. Moda urbana premium con pedidos fáciles por WhatsApp.
              </p>
              <div className="flex gap-3">
                {['facebook', 'instagram', 'tiktok'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs text-muted-foreground/70 capitalize">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-bold text-sm mb-4 tracking-wider uppercase text-neutral-400">Tienda</h3>
              <ul className="space-y-2.5">
                {['Polos', 'Hoodies', 'Pantalones', 'Zapatos', 'Novedades'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground/70 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-4 tracking-wider uppercase text-neutral-400">Ayuda</h3>
              <ul className="space-y-2.5">
                {['FAQ', 'Guía de tallas', 'Devoluciones', 'Contacto', 'Términos'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground/70 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-4 tracking-wider uppercase text-neutral-400">Contacto</h3>
              <div className="space-y-3 text-sm text-muted-foreground/70">
                <p className="flex items-center gap-2">
                  <span>📍</span> Lima, Perú
                </p>
                <p className="flex items-center gap-2">
                  <span>📞</span> +51 933 667 414
                </p>
                <p className="flex items-center gap-2">
                  <span>💬</span> WhatsApp 24/7
                </p>
                <p className="flex items-center gap-2">
                  <span>🕐</span> Lun-Sáb: 9am-8pm
                </p>
              </div>
              {/* Payment methods */}
              <div className="mt-4">
                <h4 className="text-xs text-muted-foreground mb-2">Métodos de pago</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => {
                      const typeColors: Record<string, string> = {
                        yape: 'bg-purple-100 text-purple-700',
                        plin: 'bg-teal-100 text-teal-700',
                        efectivo: 'bg-green-100 text-green-700',
                        transferencia: 'bg-blue-100 text-blue-700',
                        tarjeta: 'bg-orange-100 text-orange-700',
                        niubiz: 'bg-red-100 text-red-700',
                        mercadopago: 'bg-sky-100 text-sky-700',
                        otro: 'bg-neutral-100 text-neutral-700',
                      }
                      const colorClass = typeColors[method.type] || 'bg-neutral-100 text-neutral-700'
                      return (
                        <span key={method.id} className={`text-[10px] px-2 py-1 rounded font-medium ${colorClass}`}>
                          {method.name}
                        </span>
                      )
                    })
                  ) : (
                    ['Efectivo', 'Yape', 'Plin', 'Transferencia'].map((method) => (
                      <span key={method} className="text-[10px] bg-muted text-muted-foreground/70 px-2 py-1 rounded">
                        {method}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-neutral-800" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 Urban Style. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Términos y condiciones</a>
              <a href="#" className="hover:text-white transition-colors">Política de privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-4 z-40 flex flex-col items-center gap-3">
        {/* Test Notification Bell */}
        <button
          onClick={async () => {
            if (!('Notification' in window)) {
              toast({ title: 'Notificaciones no soportadas', variant: 'destructive', duration: 1000 })
              return
            }
            if (Notification.permission === 'default') {
              const perm = await Notification.requestPermission()
              if (perm !== 'granted') return
            }
            if (Notification.permission === 'granted') {
              // Send different test notifications randomly
              const notifications = [
                { title: '🛍️ Nueva oferta', body: '20% de descuento en toda la tienda. Solo por hoy.' },
                { title: '📦 Tu pedido está en camino', body: 'El pedido #12345 fue enviado. Llega mañana.' },
                { title: '⭐ Nuevo producto', body: 'Acabamos de agregar productos que te pueden interesar.' },
                { title: '💰 Precio especial', body: 'Los productos en tu lista de deseos tienen descuento.' },
                { title: '🎉 ¡Bienvenido!', body: 'Gracias por instalar nuestra app. Disfruta una experiencia mejor.' },
                { title: '🚚 Envío gratis', body: 'Pedidos mayores a S/199 tienen envío gratis esta semana.' },
              ]
              const notif = notifications[Math.floor(Math.random() * notifications.length)]
              new Notification(notif.title, {
                body: notif.body,
                icon: '/icon.svg',
                badge: '/icon.svg',
                tag: 'test-notification',
              })
              toast({ title: 'Notificación enviada', description: notif.title, duration: 1000 })
            }
          }}
          className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
          title="Probar notificación"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Back to Top Button */}
        {scrollY > 400 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg transition-colors border border-primary-foreground/10"
            aria-label="Volver arriba"
          >
            <ChevronUp className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        )}

        {/* WhatsApp Floating Button */}
        <motion.a
          href={getWhatsAppOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-colors"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Contactar por WhatsApp"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {cart.totalItems() > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-neutral-900 text-white text-[10px]">
              {cart.totalItems()}
            </Badge>
          )}
        </motion.a>
      </div>

      {/* Shopping Cart Sheet */}
      <Sheet open={cart.isOpen} onOpenChange={(open) => !open && cart.closeCart()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Tu Carrito ({cart.totalItems()})
            </SheetTitle>
          </SheetHeader>

          {cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Tu carrito está vacío</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Explora nuestro catálogo y encuentra tu estilo</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={cart.closeCart}
              >
                Seguir comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">Talla: {item.size} · Color: {item.color}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border rounded-full">
                            <button
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => cart.updateQuantity(item.id, item.size, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => cart.updateQuantity(item.id, item.size, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-sm">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 mt-1"
                        onClick={() => cart.removeItem(item.id, item.size)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter className="border-t pt-4 flex-col gap-3">
                <div className="w-full flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold">S/ {cart.totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground/70 w-full text-left">
                  {cart.totalPrice() > 199 ? '🎉 Envío gratis en tu pedido' : `Envío S/15 · Gratis en pedidos +S/199`}
                </p>
                <Button
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm"
                  onClick={openCheckout}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Finalizar Compra · S/ {orderTotal.toFixed(2)}
                </Button>
                <Button
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
                  onClick={() => {
                    cart.closeCart()
                    if (hasOffers) {
                      document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {hasOffers ? (
                    <><Flame className="w-5 h-5 mr-2" /> Ver Ofertas</>
                  ) : (
                    <><LayoutGrid className="w-5 h-5 mr-2" /> Ver Categorías</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold text-sm"
                  onClick={cart.clearCart}
                >
                  Vaciar carrito
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Wishlist Sheet */}
      <Sheet open={wishlist.isOpen} onOpenChange={(open) => !open && wishlist.closeWishlist()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              Mi Lista de Deseos ({wishlist.totalItems()})
            </SheetTitle>
          </SheetHeader>

          {wishlist.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Tu lista está vacía</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Guarda tus productos favoritos aquí</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={wishlist.closeWishlist}
              >
                Explorar productos
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
                <div className="space-y-4">
                  {wishlist.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {/* Product image - clickable to view */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                        onClick={() => {
                          const prod = products.find((p) => p.id === item.id)
                          if (prod) { openProduct(prod); wishlist.closeWishlist() }
                        }}
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                        <p className="text-sm font-bold text-foreground mt-0.5">S/ {item.price.toFixed(2)}</p>
                      </div>
                      {/* Action icons - minimal row */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                          onClick={() => {
                            cart.addItem({ id: item.id, name: item.name, price: item.price, image: item.image, size: '', color: '' })
                            toast({ title: 'Agregado al carrito', description: item.name, duration: 800 })
                          }}
                          title="Agregar al carrito"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-green-50 text-neutral-500 hover:text-green-600 transition-colors"
                          onClick={() => {
                            const waMsg = encodeURIComponent(`¡Hola! Me interesa:\n📦 ${item.name}\n💰 S/ ${item.price.toFixed(2)}`)
                            window.open(`https://wa.me/${storeWhatsApp}?text=${waMsg}`, '_blank')
                          }}
                          title="Pedir por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => wishlist.removeItem(item.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter className="border-t pt-3">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-red-500"
                  onClick={() => wishlist.clearWishlist()}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Limpiar lista
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !addedToCart && setSelectedProduct(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors"
              onClick={() => {
                setSelectedProduct(null)
                setSelectedSize('')
                setSelectedColor('')
              }}
            >
              <X className="w-5 h-5 text-foreground/70" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Product Image Gallery */}
              <div className="bg-muted relative">
                {/* Main Image with Navigation + Swipe Support */}
                {(() => {
                  const imgs = productImages(selectedProduct)
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
                  const imgs = productImages(selectedProduct)
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
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
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

                {/* Add to cart + WhatsApp */}
                <div className="mt-auto pt-6">
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 h-12 rounded-xl font-semibold text-sm transition-all ${
                        addedToCart
                          ? 'bg-green-600 text-white'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      }`}
                      onClick={() => handleAddToCart(selectedProduct)}
                      disabled={!selectedSize && !addedToCart}
                    >
                      {addedToCart ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Agregado
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          Agregar al carrito
                        </span>
                      )}
                    </Button>
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
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={(open) => { if (!open) closeCheckoutAndCleanup() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {checkoutStep === 1 && 'Datos de Contacto'}
              {checkoutStep === 2 && 'Resumen del Pedido'}
              {checkoutStep === 3 && '¡Pedido Confirmado!'}
            </DialogTitle>
            <DialogDescription>
              {checkoutStep === 1 && 'Completa tus datos para finalizar la compra'}
              {checkoutStep === 2 && 'Revisa tu pedido antes de confirmar'}
              {checkoutStep === 3 && 'Tu pedido ha sido creado exitosamente'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1 - Contact Info */}
          {checkoutStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre completo <span className="text-red-500">*</span></Label>
                <Input
                  id="customerName"
                  placeholder="Tu nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Teléfono <span className="text-red-500">*</span></Label>
                <Input
                  id="customerPhone"
                  placeholder="51 999 999 999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  type="tel"
                />
                <p className="text-xs text-muted-foreground/70">Formato: 51 999 999 999</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Dirección de envío</Label>
                <Input
                  id="customerAddress"
                  placeholder="Tu dirección (opcional)"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderNotes">Notas del pedido</Label>
                <Textarea
                  id="orderNotes"
                  placeholder="Instrucciones especiales, horario de entrega, etc."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={closeCheckoutAndCleanup}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => setCheckoutStep(2)}
                  disabled={!customerName.trim() || !customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 9}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 2 - Order Summary */}
          {checkoutStep === 2 && (
            <div className="space-y-4 py-2">
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-start">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Talla: {item.size} · Color: {item.color}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold">S/ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">S/ {cart.totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {shippingCost === 0 ? 'GRATIS' : `S/ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">S/ {orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method selection */}
              {paymentMethods.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Método de Pago</Label>
                  <div className="grid gap-2">
                    {paymentMethods.map((method) => {
                      const isSelected = selectedPaymentMethod === method.id
                      const typeColors: Record<string, string> = {
                        yape: 'border-purple-300 bg-purple-50',
                        plin: 'border-teal-300 bg-teal-50',
                        efectivo: 'border-green-300 bg-green-50',
                        transferencia: 'border-blue-300 bg-blue-50',
                        tarjeta: 'border-orange-300 bg-orange-50',
                        niubiz: 'border-red-300 bg-red-50',
                        mercadopago: 'border-sky-300 bg-sky-50',
                        otro: 'border-neutral-300 bg-neutral-50',
                      }
                      const selectedColor = typeColors[method.type] || 'border-amber-300 bg-amber-50'
                      const typeEmojis: Record<string, string> = {
                        yape: '💜', plin: '💚', efectivo: '💵', transferencia: '🏦',
                        tarjeta: '💳', niubiz: '🔴', mercadopago: '💙', otro: '💰',
                      }
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected ? selectedColor + ' ring-2 ring-offset-1 ring-amber-400' : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <span className="text-lg">{typeEmojis[method.type] || '💰'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{method.name}</p>
                            {method.accountNumber && (
                              <p className="text-xs text-muted-foreground truncate">{method.accountNumber}</p>
                            )}
                            {method.accountHolder && (
                              <p className="text-xs text-muted-foreground truncate">{method.accountHolder}</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {/* Show QR code if selected method has one */}
                  {selectedPaymentMethod && paymentMethods.find(m => m.id === selectedPaymentMethod)?.qrCode && (
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl">
                      <p className="text-xs font-medium text-muted-foreground">Escanea el QR para pagar</p>
                      <img
                        src={paymentMethods.find(m => m.id === selectedPaymentMethod)!.qrCode}
                        alt="QR de pago"
                        className="w-40 h-40 object-contain rounded-lg"
                      />
                      <p className="text-sm font-bold text-foreground">
                        {paymentMethods.find(m => m.id === selectedPaymentMethod)!.accountNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-snug">
                    Acepto los{' '}
                    <span className="text-amber-500 hover:underline cursor-pointer">términos y condiciones</span>
                  </Label>
                </div>
              </div>

              <DialogFooter className="pt-2 flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setCheckoutStep(1)}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Atrás
                </Button>
                {isMercadoPagoSelected ? (
                  <Button
                    className="rounded-xl bg-[#009ee3] hover:bg-[#0086c1] text-white font-semibold"
                    onClick={handleCheckout}
                    disabled={!termsAccepted || checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirigiendo...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar con MercadoPago · S/ {orderTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleCheckout}
                    disabled={!termsAccepted || checkoutLoading || (paymentMethods.length > 0 && !selectedPaymentMethod)}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Confirmar Pedido · S/ {orderTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}

          {/* Step 3 - Success */}
          {checkoutStep === 3 && createdOrder && (
            <div className="flex flex-col items-center text-center py-6 space-y-5">
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={3} />
                </motion.div>
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  ¡Pedido Confirmado!
                </h3>
                <p className="text-muted-foreground">
                  Tu pedido ha sido creado exitosamente
                </p>
              </div>

              <div className="bg-muted rounded-xl px-6 py-4 border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Número de pedido</p>
                <p className="text-2xl font-bold text-foreground mt-1">#{createdOrder.orderNumber}</p>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground">Total pagado</p>
                <p className="text-xl font-bold text-amber-500">S/ {createdOrder.total.toFixed(2)}</p>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Te contactaremos por WhatsApp para confirmar
              </p>

              <div className="w-full space-y-2 pt-2">
                <Button
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={shareOrderByWhatsApp}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Compartir por WhatsApp
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl font-semibold"
                    onClick={() => { closeCheckoutAndCleanup(); router.push('/cliente') }}
                  >
                    Ver mis pedidos
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full rounded-xl font-semibold text-muted-foreground"
                  onClick={closeCheckoutAndCleanup}
                >
                  Seguir comprando
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AiChat />
    </div>
  )
}
