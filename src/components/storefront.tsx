'use client'

import { motion } from 'framer-motion'
import { Heart, Search, ShoppingBag, Menu, X, ChevronRight, ChevronUp, ChevronLeft, LogIn, LogOut, Minus, Plus, Trash2, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useViewStore } from '@/stores/view-store'
import { useTheme } from 'next-themes'
import AiChat from '@/components/ai-chat'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  sizes: string
  colors: string
  discount: number | null
  isNew: boolean
  rating: number
  reviewCount: number
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

const heroImages = [
  '/images/hero/banner.png',
  '/images/hero/banner-2.png',
  '/images/hero/banner-3.png',
]

const brands = ['NIKE', 'ADIDAS', 'PUMA', 'NEW BALANCE', 'VANS', 'CONVERSE', 'JORDAN', 'REEBOK']

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
  const galleryRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { user, logout } = useAuthStore()
  const { setView } = useViewStore()

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

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes, testimonialsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/testimonials'),
        ])
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        const testimonialsData = await testimonialsRes.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchCategory = !activeCategory || p.category.slug === activeCategory
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  // WhatsApp order message builder
  const getWhatsAppOrderUrl = useCallback(() => {
    if (cart.items.length > 0) {
      const message = cart.items.map((item, i) =>
        `${i + 1}. ${item.name} - Talla: ${item.size} - Color: ${item.color} - Qty: ${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n')
      const total = `Total: S/ ${cart.totalPrice().toFixed(2)}`
      const fullMessage = encodeURIComponent(`Hola! Quiero hacer un pedido:\n\n${message}\n\n${total}\n\nGracias!`)
      return `https://wa.me/51933667414?text=${fullMessage}`
    }
    const defaultMsg = encodeURIComponent('Hola! Quiero información sobre sus productos. Gracias!')
    return `https://wa.me/51933667414?text=${defaultMsg}`
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
                  <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground" onClick={() => setView(user.role === 'admin' ? 'admin' : 'customer')}>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">{user.name.charAt(0)}</div>
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground/70 hover:text-red-500 h-8 w-8" onClick={() => logout()}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground" onClick={() => setView('auth')}>
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
                  Descubre nuestra colección premium de streetwear. Calidad, diseño y comodidad en cada prenda.
                  Pedidos fáciles por WhatsApp.
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
                    onClick={() => window.open(getWhatsAppOrderUrl(), '_blank')}
                  >
                    Pedir por WhatsApp
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

        {/* Categories Section */}
        <section className="py-16 bg-background">
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
                        onClick={() => openProduct(product)}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
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
                            className={`absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-all shadow-sm ${
                              isWished ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              wishlist.toggleItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                slug: product.slug,
                              })
                            }}
                          >
                            <Heart className={`w-4 h-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-foreground/70'}`} />
                          </Button>
                          {/* Quick View Overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <Button
                              size="sm"
                              className="w-full bg-background text-foreground hover:bg-muted rounded-lg text-xs font-semibold"
                              onClick={(e) => {
                                e.stopPropagation()
                                openProduct(product)
                              }}
                            >
                              Ver Detalles
                            </Button>
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
                <p className="text-muted-foreground/70 text-lg">No se encontraron productos</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => {
                    setActiveCategory(null)
                    setSearchQuery('')
                  }}
                >
                  Ver todos los productos
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Promo Banner */}
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
                    Oferta Limitada
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    15% de descuento en toda la colección de Hoodies
                  </h2>
                  <p className="mt-4 text-muted-foreground/70 text-lg">
                    Usa el código <span className="text-white font-bold">URBAN15</span> en tu pedido por WhatsApp. Válido hasta agotar stock.
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 bg-white text-foreground hover:bg-muted rounded-full px-8 h-12 font-semibold"
                    onClick={() => window.open(getWhatsAppOrderUrl(), '_blank')}
                  >
                    Pedir por WhatsApp
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                <div className="hidden md:block h-full min-h-[300px]">
                  <img
                    src="/images/products/hoodie-gray.png"
                    alt="Hoodies Collection"
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

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
                  onClick={() => window.open(getWhatsAppOrderUrl(), '_blank')}
                >
                  Contáctanos por WhatsApp
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
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-foreground" />
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
                  {['Efectivo', 'Yape', 'Plin', 'Transferencia'].map((method) => (
                    <span key={method} className="text-[10px] bg-muted text-muted-foreground/70 px-2 py-1 rounded">
                      {method}
                    </span>
                  ))}
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
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* Back to Top Button */}
        {scrollY > 400 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 bg-primary/80 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Volver arriba"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </motion.button>
        )}

        {/* WhatsApp Floating Button */}
        <motion.a
          href={getWhatsAppOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-colors animate-wa-pulse"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Pedir por WhatsApp"
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
                  Envío calculado al momento del pedido
                </p>
                <Button
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
                  onClick={() => window.open(getWhatsAppOrderUrl(), '_blank')}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Pedir por WhatsApp
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
                    <div key={item.id} className="flex gap-4">
                      <div
                        className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                        onClick={() => {
                          const prod = products.find((p) => p.id === item.id)
                          if (prod) {
                            openProduct(prod)
                            wishlist.closeWishlist()
                          }
                        }}
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate cursor-pointer hover:text-foreground/70 transition-colors"
                          onClick={() => {
                            const prod = products.find((p) => p.id === item.id)
                            if (prod) {
                              openProduct(prod)
                              wishlist.closeWishlist()
                            }
                          }}
                        >
                          {item.name}
                        </h4>
                        <p className="text-sm font-bold text-foreground mt-1">S/ {item.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs h-8"
                            onClick={() => {
                              const prod = products.find((p) => p.id === item.id)
                              if (prod) {
                                openProduct(prod)
                                wishlist.closeWishlist()
                              }
                            }}
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Ver producto
                          </Button>
                        </div>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 mt-1"
                        onClick={() => wishlist.removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold text-sm"
                  onClick={() => {
                    wishlist.clearWishlist()
                  }}
                >
                  Limpiar lista
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
              {/* Instagram-style Photo Gallery */}
              <div className="bg-muted relative">
                {/* Main Image with Navigation */}
                <div className="aspect-square relative overflow-hidden group">
                  <img
                    src={selectedProduct.image}
                    alt={`${selectedProduct.name} - Vista ${selectedImageView + 1}`}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      selectedImageView === 0 ? 'object-cover' :
                      selectedImageView === 1 ? 'object-cover scale-110' :
                      selectedImageView === 2 ? 'object-center scale-125' :
                      'object-top'
                    }`}
                    style={{
                      objectFit: selectedImageView === 0 ? 'cover' :
                                  selectedImageView === 1 ? 'cover' :
                                  selectedImageView === 2 ? 'cover' : 'cover',
                      objectPosition: selectedImageView === 0 ? 'center' :
                                       selectedImageView === 1 ? 'center 30%' :
                                       selectedImageView === 2 ? 'center 20%' :
                                       'center 10%'
                    }}
                  />
                  {/* View indicator */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {selectedImageView + 1} / 4
                  </div>
                  {/* Left Arrow */}
                  {selectedImageView > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImageView(selectedImageView - 1); scrollToGalleryImage(selectedImageView - 1) }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-background transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                  )}
                  {/* Right Arrow */}
                  {selectedImageView < 3 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImageView(selectedImageView + 1); scrollToGalleryImage(selectedImageView + 1) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-background transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                  )}
                  {/* Gradient overlays for Instagram feel */}
                  {selectedImageView > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                  )}
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-2 p-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide" ref={galleryRef}>
                  {[0, 1, 2, 3].map((idx) => (
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
                        src={selectedProduct.image}
                        alt={`Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: idx === 0 ? 'center' :
                                           idx === 1 ? 'center 30%' :
                                           idx === 2 ? 'center 20%' :
                                           'center 10%'
                        }}
                      />
                      {selectedImageView === idx && (
                        <div className="absolute inset-0 bg-neutral-900/20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col">
                <Badge variant="secondary" className="w-fit text-xs uppercase tracking-wider mb-2">
                  {selectedProduct.category.name}
                </Badge>
                <h2 className="text-2xl font-bold text-foreground">{selectedProduct.name}</h2>
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

                {/* Add to cart */}
                <div className="mt-auto pt-6">
                  <Button
                    className={`w-full h-12 rounded-xl font-semibold text-sm transition-all ${
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
                        Agregado al carrito
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Agregar al carrito · S/ {selectedProduct.price.toFixed(2)}
                      </span>
                    )}
                  </Button>
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
      <AiChat />
    </div>
  )
}
