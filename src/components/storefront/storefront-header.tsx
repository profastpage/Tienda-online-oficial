'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, ShoppingBag, Menu, X, LogIn, LogOut, Sun, Moon, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useStorefrontStore } from './storefront-store'
import { sc } from './storefront-types'

interface StorefrontHeaderProps {
  installPwa: () => void
}

const NAV_LINKS: Record<string, string> = {
  'Inicio': '',
  'Catálogo': '#products',
  'Novedades': '#ofertas',
  'Nosotros': '#categories',
}

export function StorefrontHeader({ installPwa }: StorefrontHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const router = useRouter()
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { user, logout } = useAuthStore()

  const storeName = useStorefrontStore((s) => s.storeName)
  const storeLogo = useStorefrontStore((s) => s.storeLogo)
  const storeDescription = useStorefrontStore((s) => s.storeDescription)
  const storeContent = useStorefrontStore((s) => s.storeContent)
  const searchQuery = useStorefrontStore((s) => s.searchQuery)
  const setSearchQuery = useStorefrontStore((s) => s.setSearchQuery)
  const mobileMenuOpen = useStorefrontStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useStorefrontStore((s) => s.setMobileMenuOpen)
  const scrollY = useStorefrontStore((s) => s.scrollY)
  const canInstallPwa = useStorefrontStore((s) => s.canInstallPwa)

  // Hydration guard — prevents SSR/client mismatch for theme-dependent UI
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.querySelector(target)
      if (el) {
        const offset = 88
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }, [setMobileMenuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b'
          : 'bg-background border-b border-transparent'
      }`}
    >
      {/* Top bar */}
      <div className="text-white text-center py-1.5 text-xs font-medium" style={{ backgroundColor: 'var(--store-primary, #171717)' }}>
        {handleSc('announcement', 'text', 'ENVÍO GRATIS en pedidos mayores a S/199')}
        {handleSc('announcement', 'subtext', '') && (
          <> · <span className="hidden sm:inline">{handleSc('announcement', 'subtext', 'Pago seguro contra entrega')}</span></>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo — with dark mode glow effect */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <a
              href="#"
              className="flex items-center gap-2 min-w-0"
              style={{
                filter: isDark
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 20px rgba(255,255,255,0.15))'
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
              }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--store-primary, #171717)' }}>
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none truncate">
                  {storeName || 'Mi Tienda'}
                </h1>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground/70 tracking-widest uppercase hidden sm:block truncate">
                  {storeDescription ? (storeDescription.length > 30 ? storeDescription.slice(0, 30) + '...' : storeDescription) : 'Tienda Online'}
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {Object.entries(NAV_LINKS).map(([item, target]) => (
              <a
                key={item}
                href={target || '#'}
                onClick={(e) => handleNavClick(e, target)}
                className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--store-primary, #171717)' }} />
              </a>
            ))}
          </nav>

          {/* Actions — desktop only. Mobile: all moved to Bottom Nav + Drawer */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div key="moon" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="sun" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            {user ? (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground" onClick={() => router.push(user.role === 'admin' ? '/admin' : '/cliente')}>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold">{user.name.charAt(0)}</div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground/70 hover:text-red-500 h-7 w-7" onClick={async () => { await logout(); router.push('/login') }}>
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground" onClick={() => router.push('/login')}>
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Ingresar</span>
              </Button>
            )}
            <div className="flex items-center relative">
              <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground/70" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8 w-44 lg:w-56 h-8 text-sm bg-muted border-border rounded-full focus:ring-1 focus:ring-ring"
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
              <Heart className={`w-4 h-4 ${wishlist.totalItems() > 0 ? 'fill-red-500 text-red-500' : ''}`} />
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
              <ShoppingBag className="w-4 h-4" />
              {cart.totalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-neutral-900 text-white text-[10px]">
                  {cart.totalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Drawer) */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t bg-background"
        >
          <div className="px-4 py-3">
            {/* Search bar */}
            <div className="flex items-center relative mb-3">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground/70" />
              <Input
                placeholder="Buscar productos..."
                className="pl-9 h-10 text-sm bg-muted border-border rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setMobileMenuOpen(false)
                  }
                }}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 w-5 h-5 flex items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* ── Dark Mode Toggle Switch ── */}
            <div className="flex items-center justify-between px-3 py-2.5 mb-2">
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm font-medium text-foreground/80">
                  Aspecto: {isDark ? 'Oscuro' : 'Claro'}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Cambiar modo oscuro"
                onClick={toggleTheme}
                className={`
                  relative w-[52px] h-[28px] rounded-full shrink-0
                  transition-colors duration-500 ease
                  border
                  ${isDark
                    ? 'bg-indigo-600 border-indigo-500'
                    : 'bg-amber-100 border-amber-200'
                  }
                `}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`
                    absolute top-[3px] w-[20px] h-[20px] rounded-full
                    flex items-center justify-center
                    shadow-md
                    transition-colors duration-500 ease
                    ${isDark
                      ? 'left-[27px] bg-white text-indigo-600'
                      : 'left-[3px] bg-amber-400 text-white'
                    }
                  `}
                >
                  {isDark ? (
                    <Moon className="w-3 h-3" />
                  ) : (
                    <Sun className="w-3 h-3" />
                  )}
                </motion.div>
              </button>
            </div>

            <Separator className="mb-2 opacity-50" />

            {/* Install App */}
            <button
              onClick={installPwa}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Instalar App</span>
              {canInstallPwa && (
                <Badge className="ml-auto bg-green-500 hover:bg-green-500 text-white text-[9px] px-1.5 py-0 rounded-full font-bold">NEW</Badge>
              )}
            </button>
            <nav className="space-y-1">
              {Object.entries(NAV_LINKS).map(([item, target]) => (
                <a
                  key={item}
                  href={target || '#'}
                  onClick={(e) => handleNavClick(e, target)}
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
  )
}
