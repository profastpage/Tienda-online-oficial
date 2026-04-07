'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, ShoppingBag, TrendingUp, Settings, LogOut, Store,
  Mail, Phone, Calendar, Shield, Search, ChevronDown, ChevronUp,
  Eye, Trash2, Ban, CheckCircle2, XCircle, Clock, BarChart3,
  Filter, Download, RefreshCw, UserPlus, Globe, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

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

export default function SuperAdminPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedStore, setExpandedStore] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err) {
      console.error('Error fetching super admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredStores = data?.stores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.users.some(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const filteredUsers = data?.users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.store.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </button>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white text-[10px] font-bold">SUPER ADMIN</Badge>
            <span className="text-sm font-bold text-neutral-900 hidden sm:inline">Panel de Administración</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading} className="text-neutral-500">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-neutral-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Store className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data?.stats.totalStores || 0}</p>
                  <p className="text-xs text-neutral-500">Tiendas Totales</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{data?.stats.activeStores || 0}</p>
                  <p className="text-xs text-neutral-500">Tiendas Activas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data?.stats.totalUsers || 0}</p>
                  <p className="text-xs text-neutral-500">Usuarios</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingBag className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data?.stats.totalProducts || 0}</p>
                  <p className="text-xs text-neutral-500">Productos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data?.stats.totalOrders || 0}</p>
                  <p className="text-xs text-neutral-500">Pedidos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{data?.stats.totalLeads || 0}</p>
                  <p className="text-xs text-neutral-500">Leads</p>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            {data?.stats.planDistribution && Object.keys(data.stats.planDistribution).length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">Distribución de Planes</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(data.stats.planDistribution).map(([plan, count]) => (
                      <div key={plan} className="flex items-center gap-2">
                        <Badge className={`${planColors[plan] || 'bg-gray-100 text-gray-600'} text-xs capitalize`}>
                          {plan}
                        </Badge>
                        <span className="text-sm font-bold text-neutral-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="whitespace-nowrap text-xs gap-1.5"
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
                  placeholder={activeTab === 'tiendas' ? 'Buscar tiendas...' : activeTab === 'usuarios' ? 'Buscar usuarios...' : 'Buscar leads...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-neutral-400" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.recentActivity && data.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {data.recentActivity.map((activity, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                {activity.role === 'admin' ? <Store className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-900">
                                  <strong>{activity.userName}</strong> {activity.role === 'admin' ? 'creó' : 'se registró en'} <strong>{activity.storeName}</strong>
                                </p>
                                <p className="text-xs text-neutral-400">{formatDate(activity.date)}</p>
                              </div>
                            </div>
                            <Badge className={`${activity.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>
                              {activity.role === 'admin' ? 'Admin' : 'Cliente'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-neutral-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aún no hay actividad registrada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Stores Quick View */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Últimas Tiendas Registradas</CardTitle>
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
                                <Badge className={`${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px]`}>
                                  {store.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                              </td>
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
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
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
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                  {store.logo ? (
                                    <img src={store.logo} alt={store.name} className="w-10 h-10 rounded-lg object-cover" />
                                  ) : (
                                    <Store className="w-5 h-5 text-neutral-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-neutral-900">{store.name}</p>
                                  <p className="text-xs text-neutral-400">
                                    {store.slug} · {store.users.length} usuario(s) · {store._count.products} productos
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize`}>{store.plan}</Badge>
                                <Badge className={`${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px]`}>
                                  {store.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                                {expandedStore === store.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                              </div>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">{formatDate(store.createdAt)}</p>
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
                              <div className="border-t border-neutral-100 bg-neutral-50 p-4">
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Usuarios de esta tienda</h4>
                                <div className="space-y-2">
                                  {store.users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-100">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                          {user.name.charAt(0)}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                                          <p className="text-xs text-neutral-400">{user.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>
                                          {user.role}
                                        </Badge>
                                        <span className="text-[10px] text-neutral-400 hidden sm:inline">{formatDate(user.createdAt)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                  <div className="p-2 bg-white rounded-lg border">
                                    <p className="text-lg font-bold text-neutral-900">{store._count.products}</p>
                                    <p className="text-[10px] text-neutral-500">Productos</p>
                                  </div>
                                  <div className="p-2 bg-white rounded-lg border">
                                    <p className="text-lg font-bold text-neutral-900">{store._count.orders}</p>
                                    <p className="text-[10px] text-neutral-500">Pedidos</p>
                                  </div>
                                  <div className="p-2 bg-white rounded-lg border">
                                    <p className="text-lg font-bold text-neutral-900">{store._count.categories}</p>
                                    <p className="text-[10px] text-neutral-500">Categorías</p>
                                  </div>
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
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-200 bg-neutral-50">
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Usuario</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs hidden md:table-cell">Teléfono</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs">Tienda</th>
                            <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Rol</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs hidden sm:table-cell">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-neutral-400">
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
                                <td className="py-3 px-4 text-neutral-600 hidden md:table-cell">{user.phone || '—'}</td>
                                <td className="py-3 px-4">
                                  <span className="text-neutral-900 font-medium">{user.store.name}</span>
                                  <Badge className={`${planColors[user.store.plan] || planColors.free} text-[10px] capitalize ml-1.5`}>{user.store.plan}</Badge>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className={`${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] capitalize`}>
                                    {user.role}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-neutral-400 text-xs hidden sm:table-cell">{formatDate(user.createdAt)}</td>
                              </tr>
                            ))
                          )}
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
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs hidden md:table-cell">Teléfono</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs hidden lg:table-cell">Plan interés</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs hidden sm:table-cell">Origen</th>
                            <th className="text-center py-3 px-4 font-medium text-neutral-500 text-xs">Estado</th>
                            <th className="text-left py-3 px-4 font-medium text-neutral-500 text-xs hidden sm:table-cell">Fecha</th>
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
                                <td className="py-3 px-4 text-neutral-600 hidden md:table-cell">{lead.phone || '—'}</td>
                                <td className="py-3 px-4 hidden lg:table-cell">
                                  {lead.plan ? (
                                    <Badge className={`${planColors[lead.plan] || 'bg-gray-100 text-gray-600'} text-[10px] capitalize`}>{lead.plan}</Badge>
                                  ) : '—'}
                                </td>
                                <td className="py-3 px-4 text-neutral-600 hidden sm:table-cell capitalize">{lead.source}</td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className={`${statusColors[lead.status] || statusColors.new} text-[10px] capitalize`}>{lead.status}</Badge>
                                </td>
                                <td className="py-3 px-4 text-neutral-400 text-xs hidden sm:table-cell">{formatDate(lead.createdAt)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
