'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useToast } from '@/hooks/use-toast'
import { Heart, Images, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product, Testimonial } from './storefront-types'
import { testimonialPhotos } from './storefront-types'
import { getProductImages } from './storefront-types'

// ═══ Animated Counter ═══
export function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
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

// ═══ Swipeable Product Image (Instagram-style) ═══
export function SwipeableProductImage({ product }: { product: Product }) {
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
      {/* Wishlist button with pulse animation */}
      <motion.div
        className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
        whileTap={{ scale: 1.2 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background shadow-sm`}
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
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${isWished ? 'fill-red-500 text-red-500' : ''}`}
          />
        </Button>
        {/* Pulse ring when active */}
        {isWished && (
          <motion.div
            key={product.id + '-pulse'}
            className="absolute inset-0 rounded-full border-2 border-red-500"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </motion.div>
      {/* Desktop Quick View Overlay */}
      <div className="hidden md:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-xs font-semibold"
          >
            Ver Detalles
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold h-8 w-8 p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              const url = `https://wa.me/${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '') : ''}?text=${encodeURIComponent(`¡Hola! Me interesa el producto:\n📦 ${product.name}\n💰 S/ ${product.price.toFixed(2)}`)}`
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

// ═══ Instagram-style Testimonial Carousel ═══
export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const isDragging = useRef(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => { checkScroll() }, [testimonials])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector<HTMLElement>('[data-testimonial]')?.offsetWidth || 300
    const gap = 16
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + gap) : (cardWidth + gap), behavior: 'smooth' })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll) }
  }, [])

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
    if (Math.abs(diff) > 50) scroll(diff > 0 ? 'right' : 'left')
  }

  return (
    <div className="relative group">
      {/* Desktop navigation arrows */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center transition-all duration-300 ${
          canScrollLeft ? 'opacity-100 hover:scale-110' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>
      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center transition-all duration-300 ${
          canScrollRight ? 'opacity-100 hover:scale-110' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            data-testimonial
            className="snap-start shrink-0 w-[280px] sm:w-[300px] bg-muted/50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-border hover:shadow-lg hover:border-border transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20 fill-muted-foreground/20'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {/* Quote */}
            <p className="text-foreground/80 text-sm leading-relaxed mb-4 line-clamp-4">
              &ldquo;{testimonial.content}&rdquo;
            </p>
            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                {testimonialPhotos[testimonial.name] ? (
                  <img src={testimonialPhotos[testimonial.name]} alt={testimonial.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/50 flex items-center justify-center text-white font-bold text-sm">${testimonial.name.charAt(0)}</div>` }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/50 flex items-center justify-center text-white font-bold text-sm">{testimonial.name.charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{testimonial.name}</p>
                <p className="text-muted-foreground/70 text-xs truncate">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instagram-style dots indicator */}
      <div className="flex justify-center gap-1.5 mt-5">
        {testimonials.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-foreground/15" />
        ))}
      </div>
    </div>
  )
}

// ═══ FAQ Accordion Item ═══
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm sm:text-base font-medium text-foreground pr-4">{question}</span>
        <ChevronUp className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-0' : 'rotate-180'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
