'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  ExternalLink,
  Crown,
  Bot,
  Shield,
  HelpCircle,
  ShoppingBag,
  Eye,
  Palette,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
// useTheme imported via ThemeToggle if needed
import { useAuthStore } from '@/stores/auth-store'
import { ADMIN_SECTION_URLS, URL_TO_ADMIN_SECTION } from '@/lib/navigation'
import { AdminGuidePopup } from '@/components/admin/admin-guide-popup'
import { UpdateNotifier } from '@/components/update-notifier'

export type AdminSection = 'dashboard' | 'content' | 'products' | 'categories' | 'orders' | 'settings' | 'plan' | 'ai'

interface NavItem {
  id: AdminSection
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'content', label: 'Contenido Tienda', icon: Palette, href: '/admin/contenido' },
  { id: 'products', label: 'Productos', icon: Package, href: '/admin/productos' },
  { id: 'categories', label: 'Categorías', icon: FolderOpen, href: '/admin/categorias' },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart, href: '/admin/pedidos' },
  { id: 'settings', label: 'Configuración', icon: Settings, href: '/admin/configuracion' },
  { id: 'plan', label: 'Mi Plan', icon: Crown, href: '/admin/mi-plan' },
  { id: 'ai', label: 'Asistente IA', icon: Bot, href: '/admin/asistente-ia' },
]

// Note: "Editor Visual" link is added dynamically below the nav items using storeSlug

const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
  content: 'Contenido de la Tienda',
  products: 'Productos',
  categories: 'Categorías',
  orders: 'Pedidos',
  settings: 'Configuración',
  plan: 'Mi Plan',
  ai: 'Asistente IA',
}

function SidebarNav({
  items,
  activeSection,
  onNavigate,
  onLogout,
  storeName,
  storeSlug,
  userName,
  userRole,
  userAvatar,
}: {
  items: NavItem[]
  activeSection: AdminSection
  onNavigate: (href: string) => void
  onLogout: () => void
  storeName: string
  storeSlug?: string
  userName: string
  userRole: string
  userAvatar?: string
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Store brand */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">{storeName}</h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">Panel de administración</p>
          </div>
        </div>
      </div>

      <Separator className="mx-4 w-auto dark:bg-neutral-800" />

      {/* Navigation - using Link for prefetch */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {items.map((item) => {
            const isActive = activeSection === item.id
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={true}
                onClick={() => onNavigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Ver Mi Tienda - Official Store Button */}
        {storeSlug && (
          <div className="px-3 mt-4 space-y-2">
            {/* Editor Visual - NEW Payload CMS 3.0 */}
            <a
              href={`/${storeSlug}/visual-editor`}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="flex-1 text-left">Editor Visual</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <p className="text-[10px] text-blue-500 px-1">Editor visual inline (Payload CMS)</p>
            {/* Ver Mi Tienda */}
            <a
              href={`/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md"
            >
              <Eye className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="flex-1 text-left">Ver Mi Tienda</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <p className="text-[10px] text-neutral-400 mt-0 px-1">tienda-online-oficial.vercel.app/{storeSlug}</p>
          </div>
        )}
      </ScrollArea>

      {/* User info & logout */}
      <div className="mt-auto border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 ${userAvatar ? 'hidden' : ''}`}>
            <span className="text-xs font-bold text-neutral-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{userName}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 capitalize">{userRole}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-neutral-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:border-red-800 dark:text-neutral-400 rounded-lg h-9 text-xs font-medium"
          onClick={onLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, _hydrated: hydrated, logout, hydrate, setUser } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  // theme toggle handled by ThemeToggle component
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showGuideManual, setShowGuideManual] = useState(false)
  const refreshDone = useRef(false)

  // Hydrate auth store once
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Refresh user data from DB ONCE after hydration (ensures avatar, name, etc. are up-to-date)
  useEffect(() => {
    if (!hydrated || !user || refreshDone.current) return
    const token = useAuthStore.getState().token
    if (!token) return
    refreshDone.current = true
    async function refreshUser() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const freshData = await res.json()
          const currentUser = useAuthStore.getState().user
          if (!currentUser) return
          // Only update if data actually changed (prevents unnecessary re-renders)
          const needsUpdate =
            (freshData.avatar && freshData.avatar !== currentUser.avatar) ||
            (freshData.name && freshData.name !== currentUser.name) ||
            (freshData.phone !== undefined && freshData.phone !== currentUser.phone) ||
            (freshData.address !== undefined && freshData.address !== currentUser.address) ||
            (freshData.storeName && freshData.storeName !== currentUser.storeName)
          if (needsUpdate) {
            useAuthStore.getState().setUser({
              ...currentUser,
              id: freshData.id || currentUser.id,
              name: freshData.name || currentUser.name,
              phone: freshData.phone ?? currentUser.phone,
              address: freshData.address ?? currentUser.address,
              avatar: freshData.avatar || currentUser.avatar,
              storeName: freshData.storeName || currentUser.storeName,
              storeSlug: freshData.storeSlug || currentUser.storeSlug,
            }, freshData.token || token)
          }
        }
      } catch {
        // Silent fail - use cached data
      }
    }
    refreshUser()
  }, [hydrated, user])

  // Guide popup only shows via manual trigger (help button)
  // Auto-popup removed to avoid interrupting users

  // Derive active section from URL (no Zustand view store needed)
  const activeSection = (URL_TO_ADMIN_SECTION[pathname] || 'dashboard') as AdminSection

  const handleNavigate = (href: string) => {
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    router.push('/login')
  }

  // Redirect to login if no user after hydration
  if (!user && !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="w-8 h-8 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!user && hydrated) {
    router.push('/login')
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="w-8 h-8 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Detect super admin impersonation mode
  const isSuperAdminMode = user.role === 'super-admin'

  const storeName = user.storeName || 'Mi Tienda'
  const storeSlug = user.storeSlug || 'urban-style'
  const userName = user.name || 'Admin'

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-30">
        <SidebarNav
          items={navItems}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          storeName={storeName}
          storeSlug={storeSlug}
          userName={userName}
          userRole={user.role}
          userAvatar={user.avatar}
        />
      </aside>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <SidebarNav
            items={navItems}
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            storeName={storeName}
            storeSlug={storeSlug}
            userName={userName}
            userRole={user.role}
            userAvatar={user.avatar}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 min-w-0 lg:pl-[260px] overflow-x-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setMobileOpen(true)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              {/* Mobile store brand icon */}
              <Link href="/" className="lg:hidden flex items-center gap-1.5">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 max-w-[80px] truncate">{storeName}</span>
              </Link>
              <div className="hidden lg:block">
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {sectionTitles[activeSection]}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Ver Mi Tienda - Header Button */}
              <a
                href={`/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 transition-colors text-xs font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Mi Tienda</span>
              </a>
              {isSuperAdminMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => {
                    // Restore original super admin session from localStorage
                    const originalUser = localStorage.getItem('super-admin-original-user')
                    const originalToken = localStorage.getItem('super-admin-original-token')
                    if (originalUser && originalToken) {
                      const parsedUser = JSON.parse(originalUser)
                      setUser(parsedUser, originalToken)
                    }
                    router.push('/super-admin')
                  }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Volver a Super Admin</span>
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <Store className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{storeName}</span>
                {isSuperAdminMode && (
                  <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">SUPER</span>
                )}
              </div>
              {/* Help icon - opens guide */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                onClick={() => setShowGuideManual(true)}
                title="Ayuda"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </Button>
              {/* Theme toggle */}
              <ThemeToggle />
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content — only this part swaps on navigation */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden dark:bg-neutral-900">
          {children}
        </main>
      </div>

      <AdminGuidePopup open={showGuideManual} onClose={() => { setShowGuideManual(false) }} />
      <UpdateNotifier />
    </div>
  )
}
