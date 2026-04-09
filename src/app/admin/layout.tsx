'use client'

import { useState, useEffect } from 'react'
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
  Crown,
  Bot,
  BookOpen,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/auth-store'
import { ADMIN_SECTION_URLS, URL_TO_ADMIN_SECTION } from '@/lib/navigation'
import { AdminGuidePopup } from '@/components/admin/admin-guide-popup'
import { Card } from '@/components/ui/card'
import { UpdateNotifier } from '@/components/update-notifier'

export type AdminSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'plan' | 'ai'

interface NavItem {
  id: AdminSection
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'products', label: 'Productos', icon: Package, href: '/admin/productos' },
  { id: 'categories', label: 'Categorías', icon: FolderOpen, href: '/admin/categorias' },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart, href: '/admin/pedidos' },
  { id: 'settings', label: 'Configuración', icon: Settings, href: '/admin/configuracion' },
  { id: 'plan', label: 'Mi Plan', icon: Crown, href: '/admin/mi-plan' },
  { id: 'ai', label: 'Asistente IA', icon: Bot, href: '/admin/asistente-ia' },
]

const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
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
  userName,
  userRole,
}: {
  items: NavItem[]
  activeSection: AdminSection
  onNavigate: (href: string) => void
  onLogout: () => void
  storeName: string
  userName: string
  userRole: string
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
            <h2 className="font-bold text-neutral-900 text-sm truncate">{storeName}</h2>
            <p className="text-xs text-neutral-400 truncate">Panel de administración</p>
          </div>
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

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
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User info & logout */}
      <div className="mt-auto border-t border-neutral-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-neutral-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">{userName}</p>
            <p className="text-xs text-neutral-400 capitalize">{userRole}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-neutral-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg h-9 text-xs font-medium"
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [guideDismissed, setGuideDismissed] = useState(false)

  // Hydrate auth store once
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Show guide popup for first-time users
  useEffect(() => {
    if (hydrated && user) {
      const dismissed = localStorage.getItem('admin-guide-dismissed')
      if (!dismissed) {
        // Use requestAnimationFrame to avoid synchronous setState in effect
        requestAnimationFrame(() => setShowGuide(true))
      }
    }
  }, [hydrated, user])

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!user && hydrated) {
    router.push('/login')
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Detect super admin impersonation mode
  const isSuperAdminMode = user.role === 'super-admin'

  const storeName = user.storeName || 'Mi Tienda'
  const userName = user.name || 'Admin'

  return (
    <div className="min-h-screen bg-neutral-100 flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200 z-30">
        <SidebarNav
          items={navItems}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          storeName={storeName}
          userName={userName}
          userRole={user.role}
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
            userName={userName}
            userRole={user.role}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 min-w-0 lg:pl-[260px] overflow-x-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setMobileOpen(true)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">
                  {sectionTitles[activeSection]}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200">
                <Store className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs font-medium text-neutral-600">{storeName}</span>
                {isSuperAdminMode && (
                  <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">SUPER</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content — only this part swaps on navigation */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Guide welcome dialog */}
      {showGuide && !guideDismissed && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setGuideDismissed(true); setShowGuide(false); localStorage.setItem('admin-guide-dismissed', '1') }} />
          <Card className="relative z-10 w-full max-w-sm shadow-2xl text-center p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-neutral-500 mb-5">¿Deseas ver una mini guía de cómo usar el panel de administración?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setGuideDismissed(true); setShowGuide(false); localStorage.setItem('admin-guide-dismissed', '1') }} className="flex-1 text-sm">No, gracias</Button>
              <Button onClick={() => setGuideDismissed(true)} className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-sm">Ver guía</Button>
            </div>
          </Card>
        </div>
      )}
      <AdminGuidePopup open={guideDismissed && showGuide} onClose={() => { setShowGuide(false); localStorage.setItem('admin-guide-dismissed', '1') }} />
      <UpdateNotifier />
    </div>
  )
}
