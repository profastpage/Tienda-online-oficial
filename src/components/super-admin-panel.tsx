'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, ShoppingBag, TrendingUp, LogOut, Store,
  Mail, Phone, Calendar, Search, ChevronDown, ChevronUp,
  CheckCircle2, BarChart3, RefreshCw, UserPlus, Shield,
  Trash2, Ban, Power, X, ExternalLink, AlertTriangle
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
    <Badge className="bg-green-100 text-green-700 text-[10px]">Activa</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 text-[10px]">Suspendida</Badge>
  )
}

function StatCard({ icon, value, label, valueColor }: { icon: React.ReactNode; value: number; label: string; valueColor?: string }) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 text-center">
        <div className="flex justify-center mb-1">{icon}</div>
        <p className={`text-xl sm:text-2xl font-bold ${valueColor || 'text-neutral-900'}`}>{value}</p>
        <p className="text-[10px] sm:text-xs text-neutral-500">{label}</p>
      </CardContent>
    </Card>
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
        // No stored user, try cookie-based auth
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

  // Fetch data once authenticated
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
      setData(null) // Force refetch
      await fetchData()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(null)
    }
  }, [token, fetchData])

  // ═══ Loading / Not Authed ═══
  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-neutral-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  const filteredStores = data?.stores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.users.some(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const filteredUsers = data?.users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.store.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredLeads = (data?.leads || []).filter((l: any) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return dateStr }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tiendas', label: 'Tiendas', icon: Store },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'leads', label: 'Leads', icon: Mail },
  ]

  const dbWarning = data && '_dbWarning' in data ? (data as any)._dbWarning : null

  return (
    <div className="min-h-screen bg-neutral-50">
      {dbWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">{dbWarning}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-red-500 sm:hidden" />
            <Badge className="bg-red-500 text-white text-[10px] font-bold">SUPER ADMIN</Badge>
            <span className="text-sm font-bold text-neutral-900 hidden sm:inline">Panel de Administracion</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => { setData(null); fetchData(); }} disabled={loading} className="text-neutral-500">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1">Actualizar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6 pt-[70px]">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
          <StatCard icon={<Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />} value={data?.stats.totalStores || 0} label="Tiendas" />
          <StatCard icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />} value={data?.stats.activeStores || 0} label="Activas" valueColor="text-green-600" />
          <StatCard icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />} value={data?.stats.totalUsers || 0} label="Usuarios" />
          <StatCard icon={<ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />} value={data?.stats.totalProducts || 0} label="Productos" />
          <StatCard icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />} value={data?.stats.totalOrders || 0} label="Pedidos" />
          <StatCard icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />} value={data?.stats.totalLeads || 0} label="Leads" valueColor="text-blue-600" />
        </div>

        {/* Plan Distribution */}
        {data?.stats.planDistribution && Object.keys(data.stats.planDistribution).length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-3">Distribucion de Planes</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.entries(data.stats.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-1.5">
                    <Badge className={`${planColors[plan] || planColors.free} text-[10px] sm:text-xs capitalize`}>{plan}</Badge>
                    <span className="text-sm font-bold text-neutral-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <Button key={tab.id} variant={activeTab === tab.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab.id)} className="whitespace-nowrap text-xs gap-1.5 shrink-0">
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'tiendas' && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{data?.stats.totalStores || 0}</Badge>}
              {tab.id === 'usuarios' && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{data?.stats.totalUsers || 0}</Badge>}
              {tab.id === 'leads' && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{data?.stats.totalLeads || 0}</Badge>}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input placeholder={`Buscar ${activeTab === 'tiendas' ? 'tiendas...' : activeTab === 'usuarios' ? 'usuarios...' : 'leads...'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10" />
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.recentActivity && data.recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {data.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {activity.role === 'admin' ? <Store className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate">
                              <strong>{activity.userName}</strong> {activity.role === 'admin' ? 'creo' : 'se registro en'} <strong>{activity.storeName}</strong>
                            </p>
                            <p className="text-[10px] sm:text-xs text-neutral-400">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                        <Badge className={`${activity.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize shrink-0`}>
                          {activity.role === 'admin' ? 'Admin' : 'Cliente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aun no hay actividad registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Store Table */}
            <Card className="hidden lg:block">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Ultimas Tiendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-2 px-3 font-medium text-neutral-500 text-xs">Tienda</th>
                        <th className="text-left py-2 px-3 font-medium text-neutral-500 text-xs">Plan</th>
                        <th className="text-left py-2 px-3 font-medium text-neutral-500 text-xs">Admin</th>
                        <th className="text-center py-2 px-3 font-medium text-neutral-500 text-xs">Productos</th>
                        <th className="text-center py-2 px-3 font-medium text-neutral-500 text-xs">Estado</th>
                        <th className="text-left py-2 px-3 font-medium text-neutral-500 text-xs">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStores.slice(0, 10).map((store) => (
                        <tr key={store.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-2.5 px-3 font-medium text-neutral-900">{store.name}</td>
                          <td className="py-2.5 px-3"><Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize`}>{store.plan}</Badge></td>
                          <td className="py-2.5 px-3 text-neutral-600">{store.users[0]?.name || '-'}</td>
                          <td className="py-2.5 px-3 text-center text-neutral-600">{store._count.products}</td>
                          <td className="py-2.5 px-3 text-center"><StatusBadge isActive={store.isActive} /></td>
                          <td className="py-2.5 px-3 text-neutral-400 text-xs">{formatDate(store.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stores Tab */}
        {activeTab === 'tiendas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3">
              {filteredStores.length === 0 ? (
                <Card><CardContent className="p-12 text-center"><Store className="w-10 h-10 text-neutral-300 mx-auto mb-3" /><p className="text-neutral-500 text-sm">No se encontraron tiendas</p></CardContent></Card>
              ) : filteredStores.map((store) => (
                <Card key={store.id} className="overflow-hidden">
                  <button className="w-full text-left" onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {store.logo ? <img src={store.logo} alt={store.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover" /> : <Store className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-neutral-900 truncate">{store.name}</p>
                              <StatusBadge isActive={store.isActive} />
                            </div>
                            <p className="text-xs text-neutral-400 truncate">{store.slug} · {store.users.length} usuario(s) · {store._count.products} productos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize hidden sm:inline-block`}>{store.plan}</Badge>
                          {expandedStore === store.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">{formatDate(store.createdAt)}</p>
                    </CardContent>
                  </button>
                  <AnimatePresence>
                    {expandedStore === store.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="border-t border-neutral-100 bg-neutral-50 p-3 sm:p-4">
                          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Usuarios</h4>
                          <div className="space-y-2 mb-4">
                            {store.users.map((user) => (
                              <div key={user.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-100">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">{user.name.charAt(0)}</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                                  </div>
                                </div>
                                <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>{user.role}</Badge>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center mb-4">
                            <div className="p-2 bg-white rounded-lg border"><p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.products}</p><p className="text-[10px] text-neutral-500">Productos</p></div>
                            <div className="p-2 bg-white rounded-lg border"><p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.orders}</p><p className="text-[10px] text-neutral-500">Pedidos</p></div>
                            <div className="p-2 bg-white rounded-lg border"><p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.categories}</p><p className="text-[10px] text-neutral-500">Categorias</p></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={(e) => { e.stopPropagation(); handleStoreAction('store-token', store.id) }} disabled={actionLoading === store.id}>
                              {actionLoading === store.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ExternalLink className="w-3.5 h-3.5" /> Gestionar</>}
                            </Button>
                            <Button size="sm" variant={store.isActive ? 'outline' : 'default'} className="text-xs gap-1.5" onClick={(e) => { e.stopPropagation(); handleStoreAction('toggle-store', store.id, !store.isActive) }} disabled={actionLoading === store.id}>
                              {store.isActive ? <><Ban className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600">Suspender</span></> : <><Power className="w-3.5 h-3.5" /> Activar</>}
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={(e) => { e.stopPropagation(); handleStoreAction('delete-store', store.id) }} disabled={actionLoading === store.id}>
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'usuarios' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Tienda</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Rol</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={6} className="py-12 text-center text-neutral-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No se encontraron usuarios</p></td></tr>
                      ) : filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">{user.name.charAt(0)}</span>}
                              </div>
                              <span className="font-medium text-neutral-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                          <td className="py-3 px-4"><span className="text-neutral-900 font-medium">{user.store.name}</span></td>
                          <td className="py-3 px-4 text-center"><Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>{user.role}</Badge></td>
                          <td className="py-3 px-4 text-center"><StatusBadge isActive={user.store.isActive} /></td>
                          <td className="py-3 px-4 text-neutral-400 text-xs">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Telefono</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Mensaje</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr><td colSpan={5} className="py-12 text-center text-neutral-400"><Mail className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No se encontraron leads</p></td></tr>
                      ) : filteredLeads.map((lead: any) => (
                        <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-3 px-4 font-medium text-neutral-900">{lead.name}</td>
                          <td className="py-3 px-4 text-neutral-600">{lead.email}</td>
                          <td className="py-3 px-4 text-neutral-600">{lead.phone || '-'}</td>
                          <td className="py-3 px-4 text-neutral-500 text-xs max-w-[200px] truncate">{lead.message || '-'}</td>
                          <td className="py-3 px-4 text-neutral-400 text-xs">{formatDate(lead.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
