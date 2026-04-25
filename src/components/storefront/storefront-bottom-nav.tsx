'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, LayoutGrid, Heart, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useStorefrontStore } from './storefront-store'

// Haptic feedback — safe fallback for desktop
function triggerHaptic(pattern: number | number[] = 10) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {
    // Silently ignore on unsupported browsers
  }
}

export function StorefrontBottomNav() {
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const scrollY = useStorefrontStore((s) => s.scrollY)
  const mobileMenuOpen = useStorefrontStore((s) => s.mobileMenuOpen)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)

  const cartCount = cart.totalItems()
  const wishCount = wishlist.totalItems()

  // Active tab tracking based on scroll position
  const [activeTab, setActiveTab] = useState('home')
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      // Auto-detect which section the user is viewing
      const categoriesEl = document.getElementById('categories-section')
      const productsEl = document.getElementById('products')
      if (categoriesEl && productsEl) {
        const catTop = categoriesEl.getBoundingClientRect().top
        const prodTop = productsEl.getBoundingClientRect().top
        if (prodTop < 300) {
          // We're in products — but no specific tab for that, keep last
        } else if (catTop < 300) {
          setActiveTab('categories')
        } else {
          setActiveTab('home')
        }
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    triggerHaptic(10)
    setActiveTab('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToCategories = useCallback(() => {
    triggerHaptic(10)
    setActiveTab('categories')
    setActiveCategory(null)
    const el = document.getElementById('categories-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [setActiveCategory])

  const openFavorites = useCallback(() => {
    triggerHaptic(15)
    setActiveTab('favorites')
    wishlist.toggleWishlist()
  }, [wishlist])

  const openCart = useCallback(() => {
    triggerHaptic(15)
    setActiveTab('cart')
    cart.toggleCart()
  }, [cart])

  const tabs = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      action: scrollToTop,
      badge: null as number | null,
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: LayoutGrid,
      action: scrollToCategories,
      badge: null as number | null,
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      action: openFavorites,
      badge: wishCount > 0 ? wishCount : null,
    },
    {
      id: 'cart',
      label: 'Carrito',
      icon: ShoppingBag,
      action: openCart,
      badge: cartCount > 0 ? cartCount : null,
    },
  ]

  if (mobileMenuOpen) return null

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50 md:hidden
        transition-transform duration-300 ease-out
        ${scrollY > 100 ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      {/* Glassmorphism container */}
      <div
        className="
          bg-background/80 backdrop-blur-xl border-t
          shadow-[0_-4px_30px_rgba(0,0,0,0.08)]
          dark:shadow-[0_-4px_30px_rgba(0,0,0,0.3)]
        "
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around px-1 pt-1.5 pb-2 relative">
          {/* Animated active indicator bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="absolute top-0 h-[2.5px] rounded-full bg-foreground"
              initial={{ width: 0, x: '50%', left: '50%', opacity: 0 }}
              animate={{
                width: 32,
                opacity: 1,
                left: `${(tabs.findIndex((t) => t.id === activeTab) / (tabs.length - 1)) * 100}%`,
                x: '-50%',
              }}
              exit={{ opacity: 0, width: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                duration: 0.3,
              }}
              style={{ backgroundColor: 'var(--store-primary, #171717)' }}
            />
          </AnimatePresence>

          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const hasActiveState =
              (tab.id === 'favorites' && wishCount > 0) ||
              (tab.id === 'cart' && cartCount > 0)

            return (
              <motion.button
                key={tab.id}
                onClick={tab.action}
                whileTap={{ scale: 0.82 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                }}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  min-w-[60px] py-1 px-2 rounded-xl
                  transition-colors duration-200
                `}
              >
                <div className="relative">
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    transition={{
                      type: 'spring',
                      stiffness: 600,
                      damping: 20,
                    }}
                  >
                    <Icon
                      className={`
                        w-[22px] h-[22px] transition-colors duration-200
                        ${isActive || hasActiveState
                          ? 'text-foreground'
                          : 'text-muted-foreground/60'
                        }
                        ${tab.id === 'favorites' && wishCount > 0
                          ? 'text-red-500'
                          : ''
                        }
                      `}
                      strokeWidth={isActive || hasActiveState ? 2.2 : 1.8}
                    />
                  </motion.div>
                  {/* Badge counter */}
                  {tab.badge !== null && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="
                        absolute -top-1.5 -right-2.5
                        min-w-[16px] h-[16px] px-1
                        flex items-center justify-center
                        rounded-full text-[9px] font-bold
                        text-white shadow-sm
                      "
                      style={{
                        backgroundColor:
                          tab.id === 'favorites'
                            ? '#ef4444'
                            : 'var(--store-primary, #171717)',
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.span>
                  )}
                </div>
                <span
                  className={`
                    text-[10px] leading-none font-medium transition-colors duration-200
                    ${isActive || hasActiveState
                      ? 'text-foreground'
                      : 'text-muted-foreground/50'
                    }
                    ${tab.id === 'favorites' && wishCount > 0
                      ? 'text-red-500'
                      : ''
                    }
                  `}
                >
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
