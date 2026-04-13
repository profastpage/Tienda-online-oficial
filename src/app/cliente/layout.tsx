'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingCart,
  UserCircle,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/auth-store'
import { URL_TO_CUSTOMER_SECTION } from '@/lib/navigation'

export type CustomerSection = 'dashboard' | 'orders' | 'profile'

interface NavItem {
  id: CustomerSection
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Mi Panel', icon: LayoutDashboard, href: '/cliente/dashboard' },
  { id: 'orders', label: 'Mis Pedidos', icon: ShoppingCart, href: '/cliente/pedidos' },
  { id: 'profile', label: 'Mi Perfil', icon: UserCircle, href: '/cliente/perfil' },
]

const sectionTitles: Record<CustomerSection, string> = {
  dashboard: 'Mi Panel',
  orders: 'Mis Pedidos',
  profile: 'Mi Perfil',
}

function SidebarNav({
  items,
  activeSection,
  onNavigate,
  onLogout,
  storeName,
  userName,
  userEmail,
  userAvatar,
}: {
  items: NavItem[]
  activeSection: CustomerSection
  onNavigate: (href: string) => void
  onLogout: () => void
  storeName: string
  userName: string
  userEmail: string
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
            <h2 className="font-bold text-neutral-900 text-sm truncate">{storeName}</h2>
            <p className="text-xs text-neutral-400 truncate">Mi cuenta</p>
          </div>
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
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
            <p className="text-sm font-medium text-neutral-900 truncate">{userName}</p>
            <p className="text-xs text-neutral-400 truncate">{userEmail}</p>
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

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { user, _hydrated: hydrated, logout, hydrate } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hydrate auth store once
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Derive active section from URL
  const activeSection = (URL_TO_CUSTOMER_SECTION[pathname] || 'dashboard') as CustomerSection

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

  const storeName = user.storeName || 'Mi Tienda'
  const userName = user.name || 'Cliente'
  const userEmail = user.email || ''

  return (
    <div className="min-h-screen bg-neutral-100 flex overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200 z-30">
        <SidebarNav
          items={navItems}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          storeName={storeName}
          userName={userName}
          userEmail={userEmail}
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
            userName={userName}
            userEmail={userEmail}
            userAvatar={user.avatar}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 lg:pl-[260px]">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
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
                <span className="text-xs font-bold text-neutral-900 max-w-[80px] truncate">{storeName}</span>
              </Link>
              <div className="hidden lg:block">
                <h1 className="text-lg font-bold text-neutral-900">
                  {sectionTitles[activeSection]}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200">
                <Store className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs font-medium text-neutral-600">{storeName}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden flex-shrink-0">
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

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
