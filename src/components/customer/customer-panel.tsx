'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  UserCircle,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { useViewStore, type CustomerSection } from '@/stores/view-store'
import { CUSTOMER_SECTION_URLS, URL_TO_CUSTOMER_SECTION } from '@/lib/navigation'
import { CustomerOrders } from './customer-orders'
import { CustomerProfile } from './customer-profile'

interface NavItem {
  id: CustomerSection
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Mi Panel', icon: LayoutDashboard },
  { id: 'orders', label: 'Mis Pedidos', icon: ShoppingCart },
  { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
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
}: {
  items: NavItem[]
  activeSection: CustomerSection
  onNavigate: (section: CustomerSection) => void
  onLogout: () => void
  storeName: string
  userName: string
  userEmail: string
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

/* Dashboard overview for customers */
function CustomerDashboard() {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    async function fetchStats() {
      try {
        const res = await fetch(`/api/customer/orders?userId=${userId}`)
        if (res.ok) {
          const orders = await res.json()
          setStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter((o: { status: string }) =>
              ['pending', 'confirmed', 'preparing', 'shipped'].includes(o.status)
            ).length,
            deliveredOrders: orders.filter((o: { status: string }) => o.status === 'delivered').length,
            totalSpent: orders
              .filter((o: { status: string }) => o.status === 'delivered')
              .reduce((sum: number, o: { total: number }) => sum + o.total, 0),
          })
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  const statCards = [
    {
      label: 'Total Pedidos',
      value: stats.totalOrders,
      icon: ShoppingCart,
      bg: 'bg-neutral-50',
      iconColor: 'text-neutral-600',
    },
    {
      label: 'En Progreso',
      value: stats.pendingOrders,
      icon: Clock,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Entregados',
      value: stats.deliveredOrders,
      icon: CheckCircle,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Gastado',
      value: `S/ ${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-neutral-50',
      iconColor: 'text-neutral-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-neutral-900 rounded-2xl p-6 sm:p-8 text-white"
      >
        <h2 className="text-xl sm:text-2xl font-bold">
          ¡Hola, {user?.name?.split(' ')[0] || 'Cliente'}! 👋
        </h2>
        <p className="mt-2 text-neutral-400 text-sm max-w-md">
          Bienvenido a tu panel personal. Aquí puedes ver tus pedidos, gestionar tu perfil y más.
        </p>
        <Button
          className="mt-4 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl h-10 text-sm font-semibold"
          onClick={() => router.push('/cliente/pedidos')}
        >
          Ver mis pedidos
          <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Card className="rounded-xl border-neutral-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  {loading ? (
                    <Skeleton className="h-7 w-16 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Card
          className="rounded-xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => router.push('/cliente/pedidos')}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                <ShoppingCart className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 text-sm">Mis Pedidos</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Revisa el estado de tus pedidos</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="rounded-xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => router.push('/cliente/perfil')}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                <UserCircle className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 text-sm">Mi Perfil</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Actualiza tu información personal</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export function CustomerPanel() {
  const { user, logout } = useAuthStore()
  const { customerSection, setCustomerSection } = useViewStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sync customer section from URL
  useEffect(() => {
    const section = URL_TO_CUSTOMER_SECTION[pathname]
    if (section && section !== customerSection) {
      setCustomerSection(section as CustomerSection)
    }
  }, [pathname, customerSection, setCustomerSection])

  const handleNavigate = (section: CustomerSection) => {
    setCustomerSection(section)
    setMobileOpen(false)
    const url = CUSTOMER_SECTION_URLS[section]
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
  const userName = user.name || 'Cliente'
  const userEmail = user.email || ''

  const renderSection = () => {
    switch (customerSection) {
      case 'dashboard':
        return <CustomerDashboard />
      case 'orders':
        return <CustomerOrders />
      case 'profile':
        return <CustomerProfile />
      default:
        return <CustomerDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200 z-30">
        <SidebarNav
          items={navItems}
          activeSection={customerSection}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          storeName={storeName}
          userName={userName}
          userEmail={userEmail}
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
            activeSection={customerSection}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            storeName={storeName}
            userName={userName}
            userEmail={userEmail}
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
                  {sectionTitles[customerSection]}
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
              key={customerSection}
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
