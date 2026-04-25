'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, LayoutGrid, ShoppingBag, Heart, MoreHorizontal } from 'lucide-react'
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
  const setMobileMenuOpen = useStorefrontStore((s) => s.setMobileMenuOpen)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)

  const cartCount = cart.totalItems()
  const wishCount = wishlist.totalItems()

  // Active tab tracking
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const categoriesEl = document.getElementById('categories-section')
      if (categoriesEl) {
        const catTop = categoriesEl.getBoundingClientRect().top
        if (catTop < 300) {
          setActiveTab('categories')
        } else {
          setActiveTab('home')
        }
      }
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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [setActiveCategory])

  const openCart = useCallback(() => {
    triggerHaptic(15)
    setActiveTab('cart')
    cart.toggleCart()
  }, [cart])

  const openFavorites = useCallback(() => {
    triggerHaptic(15)
    setActiveTab('favorites')
    wishlist.toggleWishlist()
  }, [wishlist])

  const openMore = useCallback(() => {
    triggerHaptic(10)
    setActiveTab('more')
    setMobileMenuOpen(true)
  }, [setMobileMenuOpen])

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
      id: 'cart',
      label: 'Carrito',
      icon: ShoppingBag,
      action: openCart,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      action: openFavorites,
      badge: wishCount > 0 ? wishCount : null,
    },
    {
      id: 'more',
      label: 'Más',
      icon: MoreHorizontal,
      action: openMore,
      badge: null as number | null,
    },
  ]

  // Hide when mobile drawer is open
  if (mobileMenuOpen) return null

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50 md:hidden
        transition-transform duration-300 ease-out
        ${scrollY > 60 ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      {/* iOS-style Glassmorphism container */}
      <div
        className="
          bg-white/70 dark:bg-black/70
          backdrop-blur-md
          border-t border-gray-200/50 dark:border-gray-800/50
          shadow-[0_-1px_20px_rgba(0,0,0,0.06)]
          dark:shadow-[0_-1px_20px_rgba(0,0,0,0.3)]
        "
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around px-0.5 pt-1.5 pb-1 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const hasBadge = tab.badge !== null && tab.badge > 0

            return (
              <motion.button
                key={tab.id}
                onClick={tab.action}
                whileTap={{ scale: 0.88 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
                className="
                  relative flex flex-col items-center justify-center gap-0.5
                  flex-1 py-1 px-1
                  transition-colors duration-200
                "
              >
                <div className="relative">
                    <Icon
                      className={`
                        w-[21px] h-[21px] transition-colors duration-200
                        ${isActive
                          ? tab.id === 'favorites'
                            ? 'text-red-500'
                            : 'text-foreground'
                          : 'text-gray-400 dark:text-gray-500'
                        }
                        ${hasBadge && tab.id === 'favorites'
                          ? 'text-red-500'
                          : ''
                        }
                        ${hasBadge && tab.id === 'cart'
                          ? 'text-foreground'
                          : ''
                        }
                      `}
                      strokeWidth={isActive || hasBadge ? 2.2 : 1.7}
                    />

                  {/* Badge counter */}
                  {hasBadge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="
                        absolute -top-1.5 -right-2.5
                        min-w-[16px] h-[16px] px-1
                        flex items-center justify-center
                        rounded-full text-[9px] font-bold
                        text-white
                      "
                      style={{
                        backgroundColor:
                          tab.id === 'favorites'
                            ? '#ef4444'
                            : 'var(--store-primary, #171717)',
                      }}
                    >
                      {tab.badge! > 99 ? '99+' : tab.badge}
                    </motion.span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[10px] leading-none font-medium transition-colors duration-200
                    ${isActive
                      ? tab.id === 'favorites'
                        ? 'text-red-500'
                        : 'text-foreground'
                      : 'text-gray-400 dark:text-gray-500'
                    }
                    ${hasBadge && tab.id === 'favorites'
                      ? 'text-red-500'
                      : ''
                    }
                    ${hasBadge && tab.id === 'cart'
                      ? 'text-foreground'
                      : ''
                    }
                  `}
                >
                  {tab.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-foreground"
                    style={{
                      backgroundColor: tab.id === 'favorites' ? '#ef4444' : 'var(--store-primary, #171717)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
