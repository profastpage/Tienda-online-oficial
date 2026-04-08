'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, ShoppingBag, TrendingUp, LogOut, Store,
  Mail, Phone, Calendar, Search, ChevronDown, ChevronUp,
  CheckCircle2, BarChart3, RefreshCw, UserPlus, Shield,
  Lock, Eye, Trash2, Ban, Power, Unlock, AlertTriangle,
  X, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  createdAt: string
  store: { id: string; name: string; slug: string; plan: string; isActive: boolean }
}

interface LeadData {
  id: string
  name: string
  email: string
  phone: string
  message: string
  source: string
  plan: string
  status: string
  createdAt: string
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
  leads: LeadData[]
  recentActivity: Array<{ type: string; userName: string; storeName: string; role: string; date: string }>
}

const planColors: Record<string, string> = {
  basico: 'bg-neutral-100 text-neutral-700',
  pro: 'bg-neutral-900 text-white',
  premium: 'bg-amber-100 text-amber-700',
  empresarial: 'bg-purple-100 text-purple-700',
  free: 'bg-gray-100 text-gray-600',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

// ═══ Login Gate ═══
function SuperAdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Strategy 1: Try the dedicated super-admin auth endpoint
      const res = await fetch('/api/super-admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        onLogin(data.token)
        return
      }

      const data = await res.json()

      // Strategy 2: If 503 (env vars not configured), fall back to /api/auth/login
      // which also detects super admin credentials and sets the proper cookies
      if (res.status === 503) {
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const loginData = await loginRes.json()
          if (loginRes.ok) {
            // The /api/auth/login sets super-admin-token cookie automatically
            // Pass the token from the response, or empty string to rely on cookies
            onLogin(loginData.token || '')
            return
          }
          setError(loginData.error || 'Error al autenticar')
          return
        } catch {
          setError('Super admin no configurado. Verifica las variables de entorno.')
          return
        }
      }

      // Other errors from /api/super-admin/auth
      setError(data.error || 'Error al autenticar')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-neutral-900">Super Admin</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">Ingresa tus credenciales de administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="email"
                    placeholder="admin@tienda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Acceder al Panel
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-neutral-400 mt-4">
          Acceso restringido al administrador del sistema
        </p>
        <button
          onClick={() => router.push('/login')}
          className="flex items-center justify-center gap-1.5 mx-auto mt-3 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al login principal
        </button>
      </motion.div>
    </div>
  )
}

// ═══ Main Panel ═══
export default function SuperAdminPanel() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedStore, setExpandedStore] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'toggle' | 'delete'
    storeId: string
    storeName: string
    isActive?: boolean
  } | null>(null)

  // Check for existing auth on mount (rely on cookies first, no Bearer header)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try without any Bearer header — rely on super-admin-token cookie
        const res = await fetch('/api/super-admin')
        if (res.ok) {
          const json = await res.json()
          setData(json)
          setIsAuthenticated(true)
          return
        }
      } catch {
        // Ignore network errors
      }
      setIsAuthenticated(false)
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = useCallback(async (token: string) => {
    setAuthToken(token)
    setLoading(true)
    try {
      // If we have a token, try with Bearer header first
      if (token) {
        const res = await fetch('/api/super-admin', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (res.ok) {
          const json = await res.json()
          setData(json)
          setIsAuthenticated(true)
          return
        }
      }
      // Fallback: try without Bearer header (rely on cookies set by login)
      const res = await fetch('/api/super-admin')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setIsAuthenticated(true)
        return
      }
      // Both failed — stay on login form
      setIsAuthenticated(false)
    } catch {
      console.error('Error fetching super admin data')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const headers: HeadersInit = authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      const res = await fetch('/api/super-admin', { headers })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err) {
      console.error('Error fetching super admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [authToken])

  const handleStoreAction = useCallback(async (action: 'toggle-store' | 'delete-store', storeId: string, isActive?: boolean) => {
    setActionLoading(storeId)
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      }
      const res = await fetch('/api/super-admin', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action, storeId, isActive }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(null)
      setConfirmDialog(null)
    }
  }, [authToken, fetchData])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/super-admin/auth', { method: 'DELETE' })
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore
    }
    document.cookie = 'super-admin-token=; path=/; max-age=0'
    document.cookie = 'auth-token=; path=/; max-age=0'
    setIsAuthenticated(false)
    setAuthToken(null)
    setData(null)
    router.push('/login')
  }, [router])

  const filteredStores = data?.stores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.users.some(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const filteredUsers = data?.users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.store.plan.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredLeads = data?.leads.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch { return dateStr }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tiendas', label: 'Tiendas', icon: Store },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'leads', label: 'Leads', icon: Mail },
  ]

  // ═══ Show Login Gate ═══
  if (!isAuthenticated && !loading) {
    return <SuperAdminLogin onLogin={handleLogin} />
  }

  // ═══ Loading State ═══
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </button>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white text-[10px] font-bold">SUPER ADMIN</Badge>
            <span className="text-sm font-bold text-neutral-900 hidden sm:inline">Panel de Administración</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading} className="text-neutral-500">
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

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* Stats Cards - Mobile-first grid */}
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
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-3">Distribución de Planes</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.entries(data.stats.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-1.5">
                    <Badge className={`${planColors[plan] || 'bg-gray-100 text-gray-600'} text-[10px] sm:text-xs capitalize`}>
                      {plan}
                    </Badge>
                    <span className="text-sm font-bold text-neutral-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs - scrollable on mobile */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap text-xs gap-1.5 shrink-0"
            >
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
            <Input
              placeholder={activeTab === 'tiendas' ? 'Buscar tiendas, email, plan...' : activeTab === 'usuarios' ? 'Buscar usuarios, email, tienda...' : 'Buscar leads...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            )}
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
                              <strong>{activity.userName}</strong> {activity.role === 'admin' ? 'creó' : 'se registró en'} <strong>{activity.storeName}</strong>
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
                    <p className="text-sm">Aún no hay actividad registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Store Table - Desktop */}
            <Card className="hidden lg:block">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Últimas Tiendas Registradas</CardTitle>
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
                          <td className="py-2.5 px-3">
                            <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize`}>{store.plan}</Badge>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600">{store.users[0]?.name || '—'}</td>
                          <td className="py-2.5 px-3 text-center text-neutral-600">{store._count.products}</td>
                          <td className="py-2.5 px-3 text-center">
                            <StatusBadge isActive={store.isActive} />
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400 text-xs">{formatDate(store.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Store Cards */}
            <div className="lg:hidden space-y-3">
              {filteredStores.slice(0, 10).map((store) => (
                <StoreMobileCard key={store.id} store={store} formatDate={formatDate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Stores Tab */}
        {activeTab === 'tiendas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3">
              {filteredStores.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Store className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No se encontraron tiendas</p>
                  </CardContent>
                </Card>
              ) : (
                filteredStores.map((store) => (
                  <Card key={store.id} className="overflow-hidden">
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                              {store.logo ? (
                                <img src={store.logo} alt={store.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover" />
                              ) : (
                                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-neutral-900 truncate">{store.name}</p>
                                <StatusBadge isActive={store.isActive} />
                              </div>
                              <p className="text-xs text-neutral-400 truncate">
                                {store.slug} · {store.users.length} usuario(s) · {store._count.products} productos
                              </p>
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
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-neutral-100 bg-neutral-50 p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Usuarios</h4>
                              <div className="flex items-center gap-1.5">
                                <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize sm:hidden`}>{store.plan}</Badge>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              {store.users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-100">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                                      <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>
                                      {user.role}
                                    </Badge>
                                    <span className="text-[10px] text-neutral-400 hidden sm:inline">{formatDate(user.createdAt)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Store Stats */}
                            <div className="grid grid-cols-3 gap-2 text-center mb-4">
                              <div className="p-2 bg-white rounded-lg border">
                                <p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.products}</p>
                                <p className="text-[10px] text-neutral-500">Productos</p>
                              </div>
                              <div className="p-2 bg-white rounded-lg border">
                                <p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.orders}</p>
                                <p className="text-[10px] text-neutral-500">Pedidos</p>
                              </div>
                              <div className="p-2 bg-white rounded-lg border">
                                <p className="text-base sm:text-lg font-bold text-neutral-900">{store._count.categories}</p>
                                <p className="text-[10px] text-neutral-500">Categorías</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant={store.isActive ? 'outline' : 'default'}
                                className="text-xs gap-1.5"
                                onClick={() => setConfirmDialog({
                                  type: 'toggle',
                                  storeId: store.id,
                                  storeName: store.name,
                                  isActive: !store.isActive,
                                })}
                                disabled={actionLoading === store.id}
                              >
                                {actionLoading === store.id ? (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : store.isActive ? (
                                  <>
                                    <Ban className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-red-600">Suspender</span>
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-3.5 h-3.5" />
                                    Activar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => setConfirmDialog({
                                  type: 'delete',
                                  storeId: store.id,
                                  storeName: store.name,
                                })}
                                disabled={actionLoading === store.id}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'usuarios' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Teléfono</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Tienda</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Rol</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Estado Tienda</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-400">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No se encontraron usuarios</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {user.name.charAt(0)}
                                </div>
                                <span className="font-medium text-neutral-900">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                            <td className="py-3 px-4 text-neutral-600">{user.phone || '—'}</td>
                            <td className="py-3 px-4">
                              <span className="text-neutral-900 font-medium">{user.store.name}</span>
                              <Badge className={`${planColors[user.store.plan] || planColors.free} text-[10px] capitalize ml-1.5`}>{user.store.plan}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <StatusBadge isActive={user.store.isActive} />
                            </td>
                            <td className="py-3 px-4 text-neutral-400 text-xs">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile User Cards */}
            <div className="md:hidden space-y-2">
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-neutral-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron usuarios</p>
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                            <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <StatusBadge isActive={user.store.isActive} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100">
                        <span className="truncate">{user.store.name}</span>
                        <Badge className={`${planColors[user.store.plan] || planColors.free} text-[10px] capitalize`}>{user.store.plan}</Badge>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1.5">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Teléfono</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Plan interés</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Origen</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-400">
                            <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No se encontraron leads</p>
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-neutral-900">{lead.name}</td>
                            <td className="py-3 px-4 text-neutral-600">{lead.email}</td>
                            <td className="py-3 px-4 text-neutral-600">{lead.phone || '—'}</td>
                            <td className="py-3 px-4">
                              {lead.plan ? (
                                <Badge className={`${planColors[lead.plan] || 'bg-gray-100 text-gray-600'} text-[10px] capitalize`}>{lead.plan}</Badge>
                              ) : '—'}
                            </td>
                            <td className="py-3 px-4 text-neutral-600 capitalize">{lead.source}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`${statusColors[lead.status] || statusColors.new} text-[10px] capitalize`}>{lead.status}</Badge>
                            </td>
                            <td className="py-3 px-4 text-neutral-400 text-xs">{formatDate(lead.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Lead Cards */}
            <div className="md:hidden space-y-2">
              {filteredLeads.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-neutral-400">
                    <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron leads</p>
                  </CardContent>
                </Card>
              ) : (
                filteredLeads.map((lead) => (
                  <Card key={lead.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{lead.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{lead.email}</p>
                        </div>
                        <Badge className={`${statusColors[lead.status] || statusColors.new} text-[10px] capitalize shrink-0`}>
                          {lead.status}
                        </Badge>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                        <div className="flex items-center gap-2">
                          {lead.plan && (
                            <Badge className={`${planColors[lead.plan] || 'bg-gray-100 text-gray-600'} text-[10px] capitalize`}>{lead.plan}</Badge>
                          )}
                          <span className="text-[10px] text-neutral-400 capitalize">{lead.source}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400">{formatDate(lead.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {confirmDialog?.type === 'toggle'
                ? confirmDialog?.isActive
                  ? 'Activar Tienda'
                  : 'Suspender Tienda'
                : 'Eliminar Tienda'
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'toggle' ? (
                confirmDialog?.isActive
                  ? `¿Estás seguro de que deseas activar la tienda "${confirmDialog.storeName}"? Los usuarios podrán acceder nuevamente.`
                  : `¿Estás seguro de que deseas suspender la tienda "${confirmDialog.storeName}"? Los usuarios no podrán acceder hasta que sea activada nuevamente.`
              ) : (
                `¿Estás seguro de que deseas ELIMINAR permanentemente la tienda "${confirmDialog?.storeName}" y todos sus datos? Esta acción no se puede deshacer.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog) {
                  handleStoreAction(
                    confirmDialog.type === 'toggle' ? 'toggle-store' : 'delete-store',
                    confirmDialog.storeId,
                    confirmDialog.type === 'toggle' ? confirmDialog.isActive : undefined
                  )
                }
              }}
              className={
                confirmDialog?.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : confirmDialog?.isActive
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-amber-600 hover:bg-amber-700'
              }
            >
              {confirmDialog?.type === 'toggle'
                ? confirmDialog?.isActive
                  ? 'Sí, Activar'
                  : 'Sí, Suspender'
                : 'Sí, Eliminar'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ═══ Sub-components ═══

function StatCard({ icon, value, label, valueColor = 'text-neutral-900' }: {
  icon: React.ReactNode
  value: number
  label: string
  valueColor?: string
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1.5">
          {icon}
        </div>
        <p className={`text-xl sm:text-2xl font-bold ${valueColor}`}>{value}</p>
        <p className="text-[10px] sm:text-xs text-neutral-500">{label}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge className={`${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px]`}>
      {isActive ? (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Activa
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <Ban className="w-3 h-3" />
          Suspensa
        </span>
      )}
    </Badge>
  )
}

function StoreMobileCard({ store, formatDate }: { store: StoreData; formatDate: (s: string) => string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-9 h-9 rounded-lg object-cover" />
              ) : (
                <Store className="w-4 h-4 text-neutral-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{store.name}</p>
              <p className="text-xs text-neutral-400">{store.users[0]?.name || '—'}</p>
            </div>
          </div>
          <StatusBadge isActive={store.isActive} />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100">
          <span>{store._count.products} productos · {store._count.users} usuarios</span>
          <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize`}>{store.plan}</Badge>
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">{formatDate(store.createdAt)}</p>
      </CardContent>
    </Card>
  )
}
