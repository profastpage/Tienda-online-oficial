'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/auth-store'
import { useViewStore, type AdminSection } from '@/stores/view-store'
import { ADMIN_SECTION_URLS, URL_TO_ADMIN_SECTION } from '@/lib/navigation'
import { AdminDashboard } from './admin-dashboard'
import { AdminProducts } from './admin-products'
import { AdminCategories } from './admin-categories'
import { AdminOrders } from './admin-orders'
import { AdminSettings } from './admin-settings'
import { AdminPlan } from './admin-plan'
import { AdminAi } from './admin-ai'

interface NavItem {
  id: AdminSection
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'categories', label: 'Categorías', icon: FolderOpen },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'settings', label: 'Configuración', icon: Settings },
  { id: 'plan', label: 'Mi Plan', icon: Crown },
  { id: 'ai', label: 'Asistente IA', icon: Bot },
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
  onNavigate: (section: AdminSection) => void
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

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {items.map((item) => {
            const isActive = activeSection === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
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
              </button>
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

export function AdminPanel() {
  const { user, logout } = useAuthStore()
  const { adminSection, setAdminSection } = useViewStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sync admin section from URL
  useEffect(() => {
    const section = URL_TO_ADMIN_SECTION[pathname]
    if (section && section !== adminSection) {
      setAdminSection(section as AdminSection)
    }
  }, [pathname, adminSection, setAdminSection])

  const handleNavigate = (section: AdminSection) => {
    setAdminSection(section)
    setMobileOpen(false)
    const url = ADMIN_SECTION_URLS[section]
    if (url) {
      router.push(url)
    }
  }

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    router.push('/login')
  }

  if (!user) return null

  const storeName = user.storeName || 'Mi Tienda'
  const userName = user.name || 'Admin'

  const renderSection = () => {
    switch (adminSection) {
      case 'dashboard':
        return <AdminDashboard />
      case 'products':
        return <AdminProducts />
      case 'categories':
        return <AdminCategories />
      case 'orders':
        return <AdminOrders />
      case 'settings':
        return <AdminSettings />
      case 'plan':
        return <AdminPlan />
      case 'ai':
        return <AdminAi />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200 z-30">
        <SidebarNav
          items={navItems}
          activeSection={adminSection}
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
            activeSection={adminSection}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            storeName={storeName}
            userName={userName}
            userRole={user.role}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 lg:pl-[260px]">
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
                  {sectionTitles[adminSection]}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200">
                <Store className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs font-medium text-neutral-600">{storeName}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={adminSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
