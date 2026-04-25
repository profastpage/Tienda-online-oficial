'use client'

import { motion } from 'framer-motion'
import { Heart, Search, ShoppingBag, Menu, X, LogIn, LogOut, Sun, Moon, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

export function StorefrontHeader({ installPwa }: StorefrontHeaderProps) {
  const { theme, setTheme } = useTheme()
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

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

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
          {/* Logo — min-w-0 + truncate prevents overflow on mobile */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <a href="#" className="flex items-center gap-2 min-w-0">
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
            {['Inicio', 'Catálogo', 'Novedades', 'Nosotros'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--store-primary, #171717)' }} />
              </a>
            ))}
          </nav>

          {/* Actions — shrink-0 prevents icon area from being squeezed */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {user ? (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground" onClick={() => router.push(user.role === 'admin' ? '/admin' : '/cliente')}>
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
                <span className="hidden sm:inline text-xs font-medium">Ingresar</span>
              </Button>
            )}
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground/70" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8 w-44 lg:w-56 h-8 text-sm bg-muted border-border rounded-full focus:ring-1 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Heart & Cart — hidden on mobile (moved to Bottom Nav) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-foreground/70 hover:text-foreground relative"
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
              className="hidden md:flex text-foreground/70 hover:text-foreground relative"
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
            {/* Install App - always show */}
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
  )
}
