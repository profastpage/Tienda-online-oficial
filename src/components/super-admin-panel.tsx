'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, ShoppingBag, TrendingUp, LogOut, Store,
  Mail, Phone, Calendar, Search, ChevronDown, ChevronUp,
  CheckCircle2, BarChart3, RefreshCw, UserPlus, Shield,
  Trash2, Ban, Power, X, ExternalLink, AlertTriangle,
  LayoutDashboard, Eye, Clock, Package, UserCog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// ═══ Types ═══
interface StoreData {
  id: string
  name: string
  slug: string
  plan: string
  isActive: boolean
  logo: string
  whatsappNumber: string
  createdAt: string
  _count: { users: number; products: number; orders: number; categories: number }
  users: UserData[]
}

interface UserData {
  id: string
  email: string
  name: string
  phone: string
  role: string
  avatar: string
  createdAt: string
  store: { id: string; name: string; slug: string; plan: string; isActive: boolean }
}

interface SuperAdminData {
  stats: {
    totalStores: number
    activeStores: number
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalLeads: number
    planDistribution: Record<string, number>
  }
  stores: StoreData[]
  users: UserData[]
  leads: any[]
  recentActivity: Array<{ type: string; userName: string; storeName: string; role: string; date: string }>
  _dbWarning?: string
}

const planColors: Record<string, string> = {
  basico: 'bg-neutral-100 text-neutral-700',
  pro: 'bg-neutral-900 text-white',
  premium: 'bg-amber-100 text-amber-700',
  empresarial: 'bg-purple-100 text-purple-700',
  gratis: 'bg-gray-100 text-gray-600',
  free: 'bg-gray-100 text-gray-600',
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">Activa</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5">Suspendida</Badge>
  )
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-3 sm:p-4 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow">
      <div className={`${color || 'bg-neutral-100'} w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <p className={`text-lg sm:text-2xl font-bold ${color === 'bg-green-100' ? 'text-green-600' : color === 'bg-blue-100' ? 'text-blue-600' : 'text-neutral-900'}`}>{value}</p>
      <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">{label}</p>
    </div>
  )
}

function AvatarCircle({ name, avatar, size = 'md' }: { name: string; avatar?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs'
  if (avatar) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shrink-0`}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ═══ Main Panel ═══
export default function SuperAdminPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedStore, setExpandedStore] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // ═══ Auth: read from localStorage only on client ═══
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      const storedToken = localStorage.getItem('auth-token')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role === 'super-admin') {
          setAuthed(true)
          setToken(storedToken)
        } else {
          router.push('/login')
        }
      } else {
        fetch('/api/auth/me', { credentials: 'include' })
          .then(r => r.ok ? r.json() : null)
          .then(userData => {
            if (userData && userData.role === 'super-admin') {
              localStorage.setItem('user', JSON.stringify(userData))
              if (userData.token) localStorage.setItem('auth-token', userData.token)
              setAuthed(true)
              setToken(userData.token || null)
            } else {
              router.push('/login')
            }
          })
          .catch(() => router.push('/login'))
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const currentToken = token || localStorage.getItem('auth-token')
      const headers: HeadersInit = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}
      const res = await fetch('/api/super-admin', { headers })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const json = await res.json()
      if (json.error && !json.stats) throw new Error(json.error)
      setData(json)

      // Auto-seed if database is empty
      if (json.stats && json.stats.totalStores === 0 && !json._dbWarning) {
        try {
          const seedRes = await fetch('/api/init-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ autoSeed: true }),
          })
          if (seedRes.ok) {
            const refreshRes = await fetch('/api/super-admin', { headers })
            if (refreshRes.ok) setData(await refreshRes.json())
          }
        } catch { /* ignore seed errors */ }
      }
    } catch (err) {
      console.error('Error fetching super admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    if (authed && !data) fetchData()
  }, [authed, data, fetchData])

  const handleLogout = useCallback(async () => {
    localStorage.removeItem('user')
    localStorage.removeItem('auth-token')
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* ignore */ }
    router.push('/login')
  }, [router])

  const handleStoreAction = useCallback(async (action: string, storeId: string, isActive?: boolean) => {
    setActionLoading(storeId)
    try {
      const currentToken = token || localStorage.getItem('auth-token')
      const res = await fetch('/api/super-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}) },
        body: JSON.stringify({ action, storeId, isActive }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      if (action === 'store-token' && json.token) {
        localStorage.setItem('user', JSON.stringify(json.user))
        localStorage.setItem('auth-token', json.token)
        router.push(`/admin?slug=${json.user.storeSlug}`)
        return
      }
      setData(null)
      await fetchData()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(null)
      setConfirmDelete(null)
    }
  }, [token, fetchData, router])

  // ═══ Loading / Not Authed ═══
  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-neutral-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  const filteredStores = data?.stores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.users.some(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const filteredUsers = data?.users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.store.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredLeads = (data?.leads || []).filter((l: any) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.phone && l.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return dateStr }
  }

  const formatDateShort = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) }
    catch { return dateStr }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tiendas', label: 'Tiendas', icon: Store, count: data?.stats.totalStores },
    { id: 'usuarios', label: 'Usuarios', icon: Users, count: data?.stats.totalUsers },
    { id: 'leads', label: 'Leads', icon: Mail, count: data?.stats.totalLeads },
  ]

  const dbWarning = data && '_dbWarning' in data ? (data as any)._dbWarning : null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* DB Warning Banner */}
      <AnimatePresence>
        {dbWarning && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-amber-50 border-b border-amber-200 overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 flex items-start gap-2 max-w-7xl mx-auto">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-amber-700 leading-relaxed">{dbWarning}</p>
              <button onClick={() => setData(d => d ? { ...d, _dbWarning: undefined } : null)} className="shrink-0 ml-auto">
                <X className="w-3.5 h-3.5 text-amber-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Desktop Header ─── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex h-14 sm:h-16 items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-neutral-100">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-bold text-neutral-900 truncate">Super Admin</h1>
                  <Badge className="bg-red-500 text-white text-[8px] sm:text-[10px] px-1.5 py-0 shrink-0 font-bold hidden xs:inline-flex">SUPER</Badge>
                </div>
                <p className="text-[10px] text-neutral-400 hidden sm:block truncate">Panel de Administracion</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="md:hidden text-neutral-500 h-9 w-9">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setData(null); fetchData(); }} disabled={loading} className="text-neutral-500 h-9">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline ml-1.5 text-xs">Actualizar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500 h-9">
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline ml-1.5 text-xs">Salir</span>
            </Button>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder={`Buscar en ${activeTab === 'dashboard' ? 'todo' : activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-neutral-50 border-neutral-200 text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (toggle) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-neutral-100">
              <div className="px-3 py-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="pl-9 h-9 bg-neutral-50 border-neutral-200 text-sm"
                  />
                  {searchTerm && (
                    <button onClick={() => { setSearchTerm(''); setShowSearch(false) }} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:flex max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 gap-1 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.id ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24 md:pb-6">

        {/* Loading State */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-[3px] border-neutral-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-500 text-sm">Cargando datos...</p>
          </div>
        )}

        {/* Data Loaded */}
        {data && !loading && (
          <>
            {/* ─── Stats Grid ─── */}
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <StatCard icon={<Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />} value={data.stats.totalStores} label="Tiendas" color="bg-amber-100" />
              <StatCard icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />} value={data.stats.activeStores} label="Activas" color="bg-green-100" />
              <StatCard icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />} value={data.stats.totalUsers} label="Usuarios" color="bg-indigo-100" />
              <StatCard icon={<ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />} value={data.stats.totalProducts} label="Productos" color="bg-pink-100" />
              <StatCard icon={<Package className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />} value={data.stats.totalOrders} label="Pedidos" color="bg-violet-100" />
              <StatCard icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />} value={data.stats.totalLeads} label="Leads" color="bg-blue-100" />
            </div>

            {/* ─── Plan Distribution ─── */}
            {data.stats.planDistribution && Object.keys(data.stats.planDistribution).length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2.5 sm:mb-3">Distribucion de Planes</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.stats.planDistribution).map(([plan, count]) => (
                    <div key={plan} className="flex items-center gap-1.5 bg-neutral-50 rounded-lg px-2.5 py-1.5">
                      <Badge className={`${planColors[plan] || planColors.free} text-[10px] capitalize border-0`}>{plan}</Badge>
                      <span className="text-sm font-bold text-neutral-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════ TAB: Dashboard ═══════════════════ */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4 sm:space-y-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-neutral-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900">Actividad Reciente</h3>
                  </div>
                  {data.recentActivity && data.recentActivity.length > 0 ? (
                    <div className="divide-y divide-neutral-50">
                      {data.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 sm:px-4 hover:bg-neutral-50/50 transition-colors">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            activity.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.role === 'admin' ? <Store className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-neutral-700 truncate">
                              <strong className="text-neutral-900">{activity.userName}</strong>
                              {' '}{activity.role === 'admin' ? 'creo' : 'se registro en'}{' '}
                              <strong className="text-neutral-900">{activity.storeName}</strong>
                            </p>
                            <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">{formatDate(activity.date)}</p>
                          </div>
                          <Badge className={`${activity.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize shrink-0`}>
                            {activity.role === 'admin' ? 'Admin' : 'Cliente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Users className="w-10 h-10 mx-auto mb-3 text-neutral-200" />
                      <p className="text-sm text-neutral-400">Aun no hay actividad registrada</p>
                    </div>
                  )}
                </div>

                {/* Quick Store Overview - Desktop */}
                <div className="hidden lg:block bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900">Ultimas Tiendas</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/50">
                          <th className="text-left py-2.5 px-4 font-medium text-neutral-500 text-xs">Tienda</th>
                          <th className="text-left py-2.5 px-4 font-medium text-neutral-500 text-xs">Plan</th>
                          <th className="text-left py-2.5 px-4 font-medium text-neutral-500 text-xs">Admin</th>
                          <th className="text-center py-2.5 px-4 font-medium text-neutral-500 text-xs">Productos</th>
                          <th className="text-center py-2.5 px-4 font-medium text-neutral-500 text-xs">Pedidos</th>
                          <th className="text-center py-2.5 px-4 font-medium text-neutral-500 text-xs">Estado</th>
                          <th className="text-left py-2.5 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStores.slice(0, 10).map((store) => (
                          <tr key={store.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-neutral-900">{store.name}</td>
                            <td className="py-2.5 px-4"><Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize border-0`}>{store.plan}</Badge></td>
                            <td className="py-2.5 px-4 text-neutral-600">{store.users[0]?.name || '-'}</td>
                            <td className="py-2.5 px-4 text-center text-neutral-600">{store._count.products}</td>
                            <td className="py-2.5 px-4 text-center text-neutral-600">{store._count.orders}</td>
                            <td className="py-2.5 px-4 text-center"><StatusBadge isActive={store.isActive} /></td>
                            <td className="py-2.5 px-4 text-neutral-400 text-xs">{formatDate(store.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Store Overview - Mobile (Card Grid) */}
                <div className="lg:hidden space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-900 px-1">Ultimas Tiendas</h3>
                  {filteredStores.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
                      <Store className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
                      <p className="text-xs text-neutral-400">No se encontraron tiendas</p>
                    </div>
                  ) : filteredStores.slice(0, 5).map((store) => (
                    <div key={store.id} className="bg-white rounded-xl border border-neutral-100 p-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <AvatarCircle name={store.name} avatar={store.logo} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-neutral-900 truncate">{store.name}</p>
                            <StatusBadge isActive={store.isActive} />
                          </div>
                          <p className="text-[10px] text-neutral-400">{store.users[0]?.name || '-'} · {formatDateShort(store.createdAt)}</p>
                        </div>
                        <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize border-0 shrink-0`}>{store.plan}</Badge>
                      </div>
                      <div className="flex gap-3 mt-2 pt-2 border-t border-neutral-50">
                        <span className="text-[10px] text-neutral-500"><strong className="text-neutral-700">{store._count.products}</strong> productos</span>
                        <span className="text-[10px] text-neutral-500"><strong className="text-neutral-700">{store._count.orders}</strong> pedidos</span>
                        <span className="text-[10px] text-neutral-500"><strong className="text-neutral-700">{store.users.length}</strong> usuarios</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════ TAB: Tiendas ═══════════════════ */}
            {activeTab === 'tiendas' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {filteredStores.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center shadow-sm">
                    <Store className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
                    <p className="text-sm text-neutral-400">No se encontraron tiendas</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {filteredStores.map((store) => (
                      <div key={store.id} className="bg-white rounded-xl sm:rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                        {/* Store Header */}
                        <button
                          className="w-full text-left"
                          onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}
                        >
                          <div className="p-3 sm:p-4">
                            <div className="flex items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <AvatarCircle name={store.name} avatar={store.logo} size="md" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-semibold text-neutral-900 truncate">{store.name}</p>
                                    <StatusBadge isActive={store.isActive} />
                                    <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize border-0`}>{store.plan}</Badge>
                                  </div>
                                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 truncate">
                                    {store.slug} · {store.users.length} usuario(s) · {store._count.products} prod · {store._count.orders} pedidos
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 p-1">
                                {expandedStore === store.id
                                  ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                                  : <ChevronDown className="w-4 h-4 text-neutral-400" />
                                }
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Store Details */}
                        <AnimatePresence>
                          {expandedStore === store.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-neutral-100 bg-neutral-50/50 p-3 sm:p-4">
                                {/* Users */}
                                <h4 className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Usuarios</h4>
                                <div className="space-y-1.5 mb-4">
                                  {store.users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-white rounded-lg border border-neutral-100">
                                      <AvatarCircle name={user.name} avatar={user.avatar} size="sm" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                                        <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                                      </div>
                                      <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>{user.role}</Badge>
                                    </div>
                                  ))}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div className="bg-white p-2.5 rounded-xl border border-neutral-100 text-center">
                                    <p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.products}</p>
                                    <p className="text-[10px] text-neutral-500">Productos</p>
                                  </div>
                                  <div className="bg-white p-2.5 rounded-xl border border-neutral-100 text-center">
                                    <p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.orders}</p>
                                    <p className="text-[10px] text-neutral-500">Pedidos</p>
                                  </div>
                                  <div className="bg-white p-2.5 rounded-xl border border-neutral-100 text-center">
                                    <p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.categories}</p>
                                    <p className="text-[10px] text-neutral-500">Categorias</p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-lg"
                                    onClick={(e) => { e.stopPropagation(); handleStoreAction('store-token', store.id) }}
                                    disabled={actionLoading === store.id}
                                  >
                                    {actionLoading === store.id
                                      ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      : <><ExternalLink className="w-3.5 h-3.5" /> Gestionar</>
                                    }
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={store.isActive ? 'outline' : 'default'}
                                    className={`text-xs gap-1.5 h-9 rounded-lg ${!store.isActive ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleStoreAction('toggle-store', store.id, !store.isActive) }}
                                    disabled={actionLoading === store.id}
                                  >
                                    {store.isActive
                                      ? <><Ban className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600">Suspender</span></>
                                      : <><Power className="w-3.5 h-3.5" /> Activar</>
                                    }
                                  </Button>

                                  {/* Delete with confirmation */}
                                  {confirmDelete === store.id ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-red-600 font-medium">Seguro?</span>
                                      <Button
                                        size="sm"
                                        className="text-xs bg-red-600 hover:bg-red-700 text-white h-9 rounded-lg"
                                        onClick={(e) => { e.stopPropagation(); handleStoreAction('delete-store', store.id) }}
                                        disabled={actionLoading === store.id}
                                      >
                                        Si, eliminar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-9 rounded-lg"
                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null) }}
                                      >
                                        No
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-9 rounded-lg"
                                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(store.id) }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════════ TAB: Usuarios ═══════════════════ */}
            {activeTab === 'usuarios' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {filteredUsers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center shadow-sm">
                    <Users className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
                    <p className="text-sm text-neutral-400">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Usuario</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Tienda</th>
                              <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Rol</th>
                              <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Estado</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <AvatarCircle name={user.name} avatar={user.avatar} size="sm" />
                                    <span className="font-medium text-neutral-900">{user.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-neutral-900 font-medium">{user.store.name}</span>
                                    <Badge className={`${planColors[user.store.plan] || planColors.free} text-[9px] capitalize border-0`}>{user.store.plan}</Badge>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>{user.role}</Badge>
                                </td>
                                <td className="py-3 px-4 text-center"><StatusBadge isActive={user.store.isActive} /></td>
                                <td className="py-3 px-4 text-neutral-400 text-xs">{formatDate(user.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile/Tablet Cards */}
                    <div className="lg:hidden space-y-2">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white rounded-xl border border-neutral-100 p-3 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <AvatarCircle name={user.name} avatar={user.avatar} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                                <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>{user.role}</Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-neutral-400 truncate">{user.email}</p>
                            </div>
                            <StatusBadge isActive={user.store.isActive} />
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
                            <div className="flex items-center gap-1.5">
                              <Store className="w-3 h-3 text-neutral-400" />
                              <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">{user.store.name}</span>
                              <Badge className={`${planColors[user.store.plan] || planColors.free} text-[9px] capitalize border-0`}>{user.store.plan}</Badge>
                            </div>
                            <span className="text-[10px] text-neutral-400">{formatDateShort(user.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ═══════════════════ TAB: Leads ═══════════════════ */}
            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {filteredLeads.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center shadow-sm">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
                    <p className="text-sm text-neutral-400">No se encontraron leads</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Nombre</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Telefono</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Mensaje</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Origen</th>
                              <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLeads.map((lead: any) => (
                              <tr key={lead.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-neutral-900">{lead.name}</td>
                                <td className="py-3 px-4 text-neutral-600">{lead.email}</td>
                                <td className="py-3 px-4 text-neutral-600">{lead.phone || '-'}</td>
                                <td className="py-3 px-4 text-neutral-500 text-xs max-w-[200px] truncate">{lead.message || '-'}</td>
                                <td className="py-3 px-4 text-neutral-400 text-xs">{lead.source || '-'}</td>
                                <td className="py-3 px-4 text-neutral-400 text-xs">{formatDate(lead.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile/Tablet Cards */}
                    <div className="lg:hidden space-y-2">
                      {filteredLeads.map((lead: any) => (
                        <div key={lead.id} className="bg-white rounded-xl border border-neutral-100 p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900 truncate">{lead.name}</p>
                              <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{lead.email}</p>
                            </div>
                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">{formatDateShort(lead.createdAt)}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span className="text-xs text-neutral-600">{lead.phone}</span>
                            </div>
                          )}
                          {lead.message && (
                            <p className="text-[10px] sm:text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">{lead.message}</p>
                          )}
                          {lead.source && (
                            <div className="mt-1.5">
                              <Badge className="bg-neutral-100 text-neutral-600 text-[9px] border-0">{lead.source}</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* ═══ Mobile Bottom Navigation ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-neutral-200 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors ${
                activeTab === tab.id ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="mobile-tab-indicator" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neutral-900 rounded-full" />
              )}
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full px-0.5">
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
