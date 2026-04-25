'use client'

import { useCallback } from 'react'
import { Home, LayoutGrid, Heart, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useStorefrontStore } from './storefront-store'

export function StorefrontBottomNav() {
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const scrollY = useStorefrontStore((s) => s.scrollY)
  const mobileMenuOpen = useStorefrontStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useStorefrontStore((s) => s.setMobileMenuOpen)
  const setActiveCategory = useStorefrontStore((s) => s.setActiveCategory)

  const cartCount = cart.totalItems()
  const wishCount = wishlist.totalItems()

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToCategories = useCallback(() => {
    setActiveCategory(null)
    const el = document.getElementById('categories-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [setActiveCategory])

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
      action: wishlist.toggleWishlist,
      badge: wishCount > 0 ? wishCount : null,
    },
    {
      id: 'cart',
      label: 'Carrito',
      icon: ShoppingBag,
      action: cart.toggleCart,
      badge: cartCount > 0 ? cartCount : null,
    },
  ]

  // Hide bottom nav when mobile menu is open or checkout is open
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
          safe-area-inset-bottom
        "
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around px-1 pt-1.5 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className="
                  relative flex flex-col items-center justify-center gap-0.5
                  min-w-[60px] py-1 px-2 rounded-xl
                  active:scale-95 transition-all duration-200
                  group
                "
              >
                <div className="relative">
                  <Icon
                    className={`
                      w-[22px] h-[22px] transition-colors duration-200
                      ${tab.id === 'favorites' && wishCount > 0
                        ? 'text-red-500'
                        : 'text-muted-foreground/70 group-active:text-foreground'
                      }
                      ${tab.id === 'cart' && cartCount > 0
                        ? 'text-foreground'
                        : 'text-muted-foreground/70 group-active:text-foreground'
                      }
                    `}
                    strokeWidth={tab.id === 'cart' && cartCount > 0 ? 2.2 : 1.8}
                  />
                  {/* Badge counter */}
                  {tab.badge !== null && (
                    <span
                      className="
                        absolute -top-1.5 -right-2.5
                        min-w-[16px] h-[16px] px-1
                        flex items-center justify-center
                        rounded-full text-[9px] font-bold
                        text-white shadow-sm
                        animate-in zoom-in duration-200
                      "
                      style={{
                        backgroundColor: tab.id === 'favorites' ? '#ef4444' : 'var(--store-primary, #171717)',
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`
                    text-[10px] leading-none font-medium transition-colors duration-200
                    ${tab.id === 'favorites' && wishCount > 0
                      ? 'text-red-500'
                      : 'text-muted-foreground/60 group-active:text-foreground'
                    }
                    ${tab.id === 'cart' && cartCount > 0
                      ? 'text-foreground'
                      : 'text-muted-foreground/60 group-active:text-foreground'
                    }
                  `}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
