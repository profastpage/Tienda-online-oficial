'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, ShoppingBag, TrendingUp, LogOut, Store,
  Mail, Phone, Calendar, Search, ChevronDown, ChevronUp,
  CheckCircle2, BarChart3, RefreshCw, UserPlus, Shield,
  Trash2, Ban, Power, X, ExternalLink, AlertTriangle,
  LayoutDashboard, Eye, Clock, Package, UserCog, Tag,
  Send, Megaphone, CreditCard, Gift, Timer, Crown,
  ChevronRight, Copy, Check, Percent, DollarSign,
  Bell, Info, AlertCircle, Zap, Database,
  Key, MessageSquare, Smartphone, MapPin, HeartHandshake, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'

// ═══ Cache Buster - forces browser to load fresh JS chunks ═══
const PANEL_VERSION = 'v2.1'

// ═══ Types ═══
interface StoreData {
  id: string; name: string; slug: string; plan: string; isActive: boolean
  logo: string; whatsappNumber: string; address: string; createdAt: string
  subscriptionExpiresAt?: string; trialDays: number
  _count: { users: number; products: number; orders: number; categories: number; coupons: number }
  users: UserData[]; coupons: CouponData[]
}

interface UserData {
  id: string; email: string; name: string; phone: string; role: string
  avatar: string; createdAt: string
  store: { id: string; name: string; slug: string; plan: string; isActive: boolean }
}

interface CouponData {
  id: string; code: string; storeId: string; type: string; value: number
  minPurchase?: number; maxUses: number; usedCount: number; isActive: boolean
  expiresAt?: string; createdAt: string; store?: { id: string; name: string; slug: string }
}

interface SuperAdminData {
  stats: {
    totalStores: number; activeStores: number; totalUsers: number; totalProducts: number
    totalOrders: number; totalLeads: number; totalCoupons: number
    planDistribution: Record<string, number>; expiringStores: number; expiredStores: number
  }
  stores: StoreData[]; users: UserData[]; leads: any[]; coupons: CouponData[]
  recentActivity: Array<{ type: string; userName: string; storeName: string; role: string; date: string }>
  _dbWarning?: string
}

const planColors: Record<string, string> = {
  basico: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300', pro: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
  premium: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400', empresarial: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400',
  gratis: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', free: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive
    ? <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 text-[10px] font-semibold px-2 py-0.5">Activa</Badge>
    : <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 text-[10px] font-semibold px-2 py-0.5">Suspendida</Badge>
}

function SubscriptionBadge({ store }: { store: StoreData }) {
  if (!store.subscriptionExpiresAt) return <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5">Sin limite</Badge>
  const exp = new Date(store.subscriptionExpiresAt)
  const now = new Date()
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft <= 0) return <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 text-[10px] px-2 py-0.5 font-semibold">Expirada</Badge>
  if (daysLeft <= 7) return <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400 text-[10px] px-2 py-0.5 font-semibold">{daysLeft}d restantes</Badge>
  return <Badge className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5">{daysLeft}d restantes</Badge>
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 sm:p-4 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow">
      <div className={`${color || 'bg-neutral-100 dark:bg-neutral-800'} w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center`}>{icon}</div>
      <p className={`text-lg sm:text-2xl font-bold ${color === 'bg-green-100 dark:bg-green-900' ? 'text-green-600 dark:text-green-400' : color === 'bg-blue-100 dark:bg-blue-900' ? 'text-blue-600 dark:text-blue-400' : color === 'bg-orange-100 dark:bg-orange-900' ? 'text-orange-600' : 'text-neutral-900 dark:text-neutral-100'}`}>{value}</p>
      <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">{label}</p>
    </div>
  )
}

function Avatar({ name, avatar, size = 'md' }: { name: string; avatar?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs'
  if (avatar) return <div className={`${sz} rounded-full overflow-hidden shrink-0`}><img src={avatar} alt={name} className="w-full h-full object-cover" /></div>
  return <div className={`${sz} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0`}>{name.charAt(0).toUpperCase()}</div>
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" /></button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Modal states
  const [couponModal, setCouponModal] = useState<{ open: boolean; storeId: string; storeName: string }>({ open: false, storeId: '', storeName: '' })
  const [notifModal, setNotifModal] = useState<{ open: boolean; storeId?: string; storeName?: string; broadcast: boolean }>({ open: false, broadcast: true })
  const [subModal, setSubModal] = useState<{ open: boolean; storeId: string; storeName: string; currentExpiry?: string }>({ open: false, storeId: '', storeName: '' })

  // Form states
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage', value: '', minPurchase: '', maxUses: '', expiresAt: '' })
  const [notifForm, setNotifForm] = useState({ type: 'info', title: '', message: '' })
  const [subDays, setSubDays] = useState('30')
  const [copied, setCopied] = useState<string | null>(null)

  // ═══ Auth ═══
  // Helper: call /api/auth/me with BOTH cookie AND Authorization header
  const fetchAuthMe = useCallback(async (extraHeaders: Record<string, string> = {}): Promise<Response> => {
    const t = extraHeaders['Authorization'] || (localStorage.getItem('auth-token') ? `Bearer ${localStorage.getItem('auth-token')}` : '')
    return fetch('/api/auth/me', {
      credentials: 'include',
      headers: { ...extraHeaders, ...(t ? { Authorization: t } : {}) },
    })
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const stored = localStorage.getItem('user')
      const storedToken = localStorage.getItem('auth-token')
      const authHeaders = storedToken ? { Authorization: `Bearer ${storedToken}` } : {}

      if (stored) {
        const user = JSON.parse(stored)
        if (user.role === 'super-admin') {
          setAuthed(true); setToken(storedToken)
          // Verify token is still valid via API (send BOTH cookie + Authorization header)
          const meRes = await fetchAuthMe(authHeaders)
          if (meRes.ok) {
            const userData = await meRes.json()
            if (userData?.role === 'super-admin') {
              localStorage.setItem('user', JSON.stringify(userData))
              if (userData.token) localStorage.setItem('auth-token', userData.token)
              setToken(userData.token || storedToken)
              return
            }
          }
          // Token invalid — clear and try cookie-only auth
          console.warn('[super-admin] Stored token invalid, clearing and retrying...')
          localStorage.removeItem('user'); localStorage.removeItem('auth-token')
        } else {
          localStorage.removeItem('user'); localStorage.removeItem('auth-token')
        }
      }
      // No valid localStorage — try cookies + header via /api/auth/me
      const meRes = await fetchAuthMe()
      if (!meRes.ok) { router.push('/login'); return }
      const userData = await meRes.json()
      if (userData?.role === 'super-admin') {
        localStorage.setItem('user', JSON.stringify(userData))
        if (userData.token) localStorage.setItem('auth-token', userData.token)
        setAuthed(true); setToken(userData.token || null)
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error('[super-admin] Auth check error:', err)
      router.push('/login')
    }
  }, [router, fetchAuthMe])

  useEffect(() => { checkAuth() }, [checkAuth])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const apiCall = useCallback(async (body: Record<string, any>) => {
    const t = token || localStorage.getItem('auth-token')
    console.log('[super-admin-panel] apiCall:', body)
    const res = await fetch('/api/super-admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const json = await res.json()
    console.log('[super-admin-panel] apiCall response:', json)
    return json
  }, [token])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const t = token || localStorage.getItem('auth-token')
      const cacheBuster = `?_t=${Date.now()}`
      const res = await fetch(`/api/super-admin${cacheBuster}`, {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        cache: 'no-store',
      })
      if (res.status === 401) {
        // Auth expired — try to re-auth via cookies before redirecting
        console.warn('[super-admin] 401 from API, attempting cookie re-auth...')
        try {
          const meRes = await fetchAuthMe()
          if (meRes.ok) {
            const meData = await meRes.json()
            if (meData?.role === 'super-admin' && meData.token) {
              localStorage.setItem('user', JSON.stringify(meData))
              localStorage.setItem('auth-token', meData.token)
              setToken(meData.token)
              const retryRes = await fetch(`/api/super-admin?_t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${meData.token}` },
                cache: 'no-store',
              })
              if (retryRes.ok) {
                const json = await retryRes.json()
                setData(json)
                return
              }
            }
          }
        } catch (retryErr) {
          console.error('[super-admin] Re-auth attempt failed:', retryErr)
        }
        router.push('/login')
        return
      }
      if (!res.ok) {
        console.error('[super-admin] API error:', res.status)
        return
      }
      const json = await res.json()
      if (json.error && !json.stats) throw new Error(json.error)
      setData(json)
    } catch (err) {
      console.error('[super-admin] Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { if (authed && !data) fetchData() }, [authed, data, fetchData])

  // Auto-refresh every 30 seconds for real-time sync
  useEffect(() => {
    if (!authed) return
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [authed, fetchData])

  const handleLogout = useCallback(async () => {
    localStorage.removeItem('user'); localStorage.removeItem('auth-token')
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* */ }
    router.push('/login')
  }, [router])

  const handleAction = useCallback(async (action: string, storeId: string, extra?: any) => {
    setActionLoading(storeId)
    try {
      const body: any = { action, storeId, ...extra }
      const json = await apiCall(body)
      if (json.error) throw new Error(json.error)

      if (action === 'store-token' && json.token) {
        localStorage.setItem('user', JSON.stringify(json.user))
        localStorage.setItem('auth-token', json.token)
        router.push(`/admin?slug=${json.user.storeSlug}`)
        return
      }

      showToast(json.message || 'Accion exitosa')
      setData(null); await fetchData()
    } catch (err: any) { showToast(err.message || 'Error', 'error') }
    finally { setActionLoading(null); setConfirmDelete(null) }
  }, [apiCall, fetchData, router])

  // Create coupon handler
  const handleCreateCoupon = async () => {
    if (!couponForm.code || !couponForm.value) { showToast('Codigo y valor requeridos', 'error'); return }
    setActionLoading('coupon')
    try {
      const json = await apiCall({ action: 'create-coupon', ...couponForm, storeId: couponModal.storeId })
      if (json.error) throw new Error(json.error)
      showToast('Cupon creado!')
      setCouponModal({ open: false, storeId: '', storeName: '' })
      setCouponForm({ code: '', type: 'percentage', value: '', minPurchase: '', maxUses: '', expiresAt: '' })
      setData(null); await fetchData()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setActionLoading(null) }
  }

  // Send notification handler
  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.message) { showToast('Titulo y mensaje requeridos', 'error'); return }
    setActionLoading('notif')
    try {
      const json = await apiCall({ action: 'send-notification', ...notifForm, storeId: notifModal.storeId, broadcast: notifModal.broadcast })
      if (json.error) throw new Error(json.error)
      showToast(json.message || 'Notificacion enviada!')
      setNotifModal({ open: false, broadcast: true })
      setNotifForm({ type: 'info', title: '', message: '' })
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setActionLoading(null) }
  }

  // Set subscription handler
  const handleSetSubscription = async () => {
    const days = parseInt(subDays)
    if (!days || days <= 0) { showToast('Dias invalidos', 'error'); return }
    setActionLoading('sub')
    try {
      const json = await apiCall({ action: 'set-subscription', storeId: subModal.storeId, days })
      if (json.error) throw new Error(json.error)
      showToast(json.message || 'Suscripcion actualizada!')
      setSubModal({ open: false, storeId: '', storeName: '' })
      setData(null); await fetchData()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setActionLoading(null) }
  }

  // ═══ Auth guard ═══
  if (!authed) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Verificando acceso...</p>
      </div>
    </div>
  )

  // ═══ Filters ═══
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
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCoupons = data?.coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.store?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return d } }
  const formatDateShort = (d: string) => { try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) } catch { return d } }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tiendas', label: 'Tiendas', icon: Store, count: data?.stats.totalStores },
    { id: 'usuarios', label: 'Usuarios', icon: Users, count: data?.stats.totalUsers },
    { id: 'cupones', label: 'Cupones', icon: Tag, count: data?.stats.totalCoupons },
    { id: 'leads', label: 'Leads', icon: Mail, count: data?.stats.totalLeads },
  ]

  const dbWarning = data && '_dbWarning' in data ? (data as any)._dbWarning : null

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DB Warning */}
      <AnimatePresence>
        {dbWarning && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 flex items-start gap-2 max-w-7xl mx-auto">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-400 leading-relaxed flex-1">{dbWarning}</p>
              <button onClick={() => setData(d => d ? { ...d, _dbWarning: undefined } : null)} className="shrink-0"><X className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/80 dark:border-neutral-700/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => router.push('/')} className="p-1.5 -ml-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">Super Admin</h1>
                  <Badge className="bg-red-500 text-white text-[8px] sm:text-[10px] px-1.5 py-0 shrink-0 font-bold">SUPER</Badge>
                </div>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 hidden sm:block truncate">Control total de tiendas</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle size="sm" />
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="md:hidden text-neutral-500 dark:text-neutral-400 h-9 w-9">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setData(null); fetchData(); }} disabled={loading} className="text-neutral-500 dark:text-neutral-400 h-9">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline ml-1.5 text-xs">Actualizar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500 dark:text-neutral-400 h-9">
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline ml-1.5 text-xs">Salir</span>
            </Button>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:block max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <Input placeholder={`Buscar en ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-700 text-sm" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" /></button>}
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-neutral-100 dark:border-neutral-800">
              <div className="px-3 py-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus className="pl-9 h-9 bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-700 text-sm" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Tabs */}
        <div className="hidden md:flex max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 gap-1 pb-0">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tab.id ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-950' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24 md:pb-6">
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-[3px] border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Cargando datos...</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ─── Stats ─── */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <StatCard icon={<Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />} value={data.stats.totalStores} label="Tiendas" color="bg-amber-100 dark:bg-amber-900" />
              <StatCard icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />} value={data.stats.activeStores} label="Activas" color="bg-green-100 dark:bg-green-900" />
              <StatCard icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />} value={data.stats.totalUsers} label="Usuarios" color="bg-indigo-100 dark:bg-indigo-900" />
              <StatCard icon={<ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />} value={data.stats.totalProducts} label="Productos" color="bg-pink-100 dark:bg-pink-900" />
              <StatCard icon={<Package className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />} value={data.stats.totalOrders} label="Pedidos" color="bg-violet-100 dark:bg-violet-900" />
              <StatCard icon={<Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />} value={data.stats.totalCoupons} label="Cupones" color="bg-emerald-100 dark:bg-emerald-900" />
              <StatCard icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />} value={data.stats.totalLeads} label="Leads" color="bg-blue-100 dark:bg-blue-900" />
              <StatCard icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />} value={data.stats.expiringStores + data.stats.expiredStores} label="Por Vencer" color="bg-orange-100 dark:bg-orange-900" />
            </div>

            {/* Plan Distribution */}
            {data.stats.planDistribution && Object.keys(data.stats.planDistribution).length > 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">Distribucion de Planes</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.stats.planDistribution).map(([plan, count]) => (
                    <div key={plan} className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-950 rounded-lg px-2.5 py-1.5">
                      <Badge className={`${planColors[plan] || planColors.free} text-[10px] capitalize border-0`}>{plan}</Badge>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ DASHBOARD TAB ═══ */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button onClick={() => setNotifModal({ open: true, broadcast: true })} className="h-auto py-3 flex-col gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    <Megaphone className="w-5 h-5" /> <span className="text-xs">Broadcast</span>
                  </Button>
                  <Button onClick={() => { const s = data.stores[0]; if (s) setCouponModal({ open: true, storeId: s.id, storeName: s.name }) }} className="h-auto py-3 flex-col gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    <Gift className="w-5 h-5" /> <span className="text-xs">Crear Cupon</span>
                  </Button>
                  <Button onClick={() => setActiveTab('tiendas')} className="h-auto py-3 flex-col gap-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
                    <Store className="w-5 h-5" /> <span className="text-xs">Ver Tiendas</span>
                  </Button>
                  <Button onClick={() => setActiveTab('leads')} className="h-auto py-3 flex-col gap-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                    <Mail className="w-5 h-5" /> <span className="text-xs">Ver Leads</span>
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400 dark:text-neutral-500" /><h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Actividad Reciente</h3>
                  </div>
                  {data.recentActivity?.length > 0 ? (
                    <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                      {data.recentActivity.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 sm:px-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${a.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'}`}>
                            {a.role === 'admin' ? <Store className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 truncate"><strong className="text-neutral-900 dark:text-neutral-100">{a.userName}</strong> {a.role === 'admin' ? 'creo' : 'se registro en'} <strong className="text-neutral-900 dark:text-neutral-100">{a.storeName}</strong></p>
                            <p className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{formatDate(a.date)}</p>
                          </div>
                          <Badge className={`${a.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'} text-[10px] capitalize shrink-0`}>{a.role === 'admin' ? 'Admin' : 'Cliente'}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4"><Users className="w-10 h-10 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" /><p className="text-sm text-neutral-400 dark:text-neutral-500">Sin actividad</p></div>
                  )}
                </div>

                {/* Recent Stores - Cards on all devices */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 px-1">Ultimas Tiendas</h3>
                  {filteredStores.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-8 text-center"><Store className="w-8 h-8 mx-auto mb-2 text-neutral-200 dark:text-neutral-700" /><p className="text-xs text-neutral-400 dark:text-neutral-500">No hay tiendas</p></div>
                  ) : filteredStores.slice(0, 5).map((store) => (
                    <div key={store.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={store.name} avatar={store.logo} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{store.name}</p>
                            <StatusBadge isActive={store.isActive} />
                            <SubscriptionBadge store={store} />
                          </div>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{store.users[0]?.name || '-'} · {formatDateShort(store.createdAt)}</p>
                        </div>
                        <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize border-0 shrink-0`}>{store.plan}</Badge>
                      </div>
                      <div className="flex gap-3 mt-2 pt-2 border-t border-neutral-50 dark:border-neutral-800 text-[10px] text-neutral-500 dark:text-neutral-400">
                        <span><strong className="text-neutral-700 dark:text-neutral-300">{store._count?.products ?? 0}</strong> prod</span>
                        <span><strong className="text-neutral-700 dark:text-neutral-300">{store._count?.orders ?? 0}</strong> pedidos</span>
                        <span><strong className="text-neutral-700 dark:text-neutral-300">{store.users?.length ?? 0}</strong> users</span>
                        <span><strong className="text-neutral-700 dark:text-neutral-300">{store._count?.coupons ?? 0}</strong> cupones</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ TIENDAS TAB ═══ */}
            {activeTab === 'tiendas' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 sm:space-y-3">
                {filteredStores.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-12 text-center"><Store className="w-12 h-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" /><p className="text-sm text-neutral-400 dark:text-neutral-500">No se encontraron tiendas</p></div>
                ) : filteredStores.map((store) => (
                  <div key={store.id} className="bg-white dark:bg-neutral-900 rounded-xl sm:rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <button className="w-full text-left" onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}>
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar name={store.name} avatar={store.logo} size="md" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{store.name}</p>
                                <StatusBadge isActive={store.isActive} />
                                <SubscriptionBadge store={store} />
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge className={`${planColors[store.plan] || planColors.free} text-[10px] capitalize border-0`}>{store.plan}</Badge>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{store.slug} · {store.users.length} usuarios</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 p-1">{expandedStore === store.id ? <ChevronUp className="w-4 h-4 text-neutral-400 dark:text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />}</div>
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedStore === store.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 p-3 sm:p-4 space-y-4">
                            {/* Store Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border"><p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{store._count?.products ?? 0}</p><p className="text-[10px] text-neutral-500 dark:text-neutral-400">Productos</p></div>
                              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border"><p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{store._count?.orders ?? 0}</p><p className="text-[10px] text-neutral-500 dark:text-neutral-400">Pedidos</p></div>
                              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border"><p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{store._count?.categories ?? 0}</p><p className="text-[10px] text-neutral-500 dark:text-neutral-400">Categorias</p></div>
                              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border"><p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{store._count?.coupons ?? 0}</p><p className="text-[10px] text-neutral-500 dark:text-neutral-400">Cupones</p></div>
                            </div>

                            {/* Store Contact Details (WhatsApp, Address) */}
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] sm:text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Datos de la Tienda</h4>
                              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 p-2.5 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                                  <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">WhatsApp:</span>
                                  <span className="text-xs text-neutral-600 dark:text-neutral-400 flex-1">{store.whatsappNumber || 'No configurado'}</span>
                                  {store.whatsappNumber && (
                                    <a href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400 p-1 rounded hover:bg-green-50 dark:hover:bg-green-950">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                {store.address && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                    <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">Direccion:</span>
                                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{store.address}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">URL:</span>
                                  <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-400 underline truncate">{store.slug}</a>
                                </div>
                              </div>
                            </div>

                            {/* Contact Info */}
                            {store.users.length > 0 && (
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] sm:text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Contacto</h4>
                                {store.users.map((user) => (
                                  <div key={user.id} className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                    <Avatar name={user.name} avatar={user.avatar} size="sm" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{user.email}</p>
                                      {user.phone && <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{user.phone}</p>}
                                    </div>
                                    <Badge className={`${user.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'} text-[10px] capitalize`}>{user.role}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Actions Grid */}
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] sm:text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Acciones</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="col-span-2 sm:col-span-1">
                                  <Button size="sm" className="w-full text-xs gap-1 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md">
                                    <Eye className="w-3.5 h-3.5" /> Tienda Oficial
                                  </Button>
                                </a>
                                <Button size="sm" className="text-xs gap-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('store-token', store.id)} disabled={actionLoading === store.id}>
                                  {actionLoading === store.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ExternalLink className="w-3.5 h-3.5" /> Gestionar</>}
                                </Button>
                                <Button size="sm" variant={store.isActive ? 'outline' : 'default'} className={`text-xs gap-1 h-9 rounded-lg ${!store.isActive ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`} onClick={() => handleAction('toggle-store', store.id, { isActive: !store.isActive })} disabled={actionLoading === store.id}>
                                  {store.isActive ? <><Ban className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600 dark:text-red-400">Suspender</span></> : <><Power className="w-3.5 h-3.5" /> Activar</>}
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs gap-1 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => { setCouponModal({ open: true, storeId: store.id, storeName: store.name }) }}>
                                  <Tag className="w-3.5 h-3.5" /> Cupon
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs gap-1 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900" onClick={() => { setSubModal({ open: true, storeId: store.id, storeName: store.name, currentExpiry: store.subscriptionExpiresAt }) }}>
                                  <Timer className="w-3.5 h-3.5" /> Suscripcion
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs gap-1 h-9 rounded-lg bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900" onClick={() => { setNotifModal({ open: true, storeId: store.id, storeName: store.name, broadcast: false }) }}>
                                  <Send className="w-3.5 h-3.5" /> Notificar
                                </Button>
                                {confirmDelete === store.id ? (
                                  <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 p-1.5">
                                    <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Eliminar?</span>
                                    <Button size="sm" className="text-[10px] bg-red-600 hover:bg-red-700 text-white h-7 px-2" onClick={() => handleAction('delete-store', store.id)}>Si</Button>
                                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => setConfirmDelete(null)}>No</Button>
                                  </div>
                                ) : (
                                  <Button size="sm" variant="outline" className="text-xs gap-1 h-9 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800" onClick={() => setConfirmDelete(store.id)}>
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                  </Button>
                                )}
                              </div>

                              {/* Plan Change */}
                              <div className="mt-3 p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Cambiar Plan</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {['basico', 'pro', 'premium', 'empresarial'].map(p => (
                                    <button key={p} disabled={store.plan === p || actionLoading === store.id} onClick={() => handleAction('change-plan', store.id, { plan: p })}
                                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${store.plan === p ? planColors[p] || '' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'} disabled:opacity-100`}>
                                      {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ═══ USUARIOS TAB ═══ */}
            {activeTab === 'usuarios' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {filteredUsers.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-12 text-center"><Users className="w-12 h-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" /><p className="text-sm text-neutral-400 dark:text-neutral-500">Sin usuarios</p></div>
                ) : (
                  <>
                    <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-2xl border shadow-sm overflow-hidden">
                      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-neutral-50/50 dark:bg-neutral-800/50">
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Telefono</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Tienda</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Rol</th>
                        <th className="text-center py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-xs">Fecha</th>
                      </tr></thead><tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50 dark:bg-neutral-950">
                            <td className="py-3 px-4"><div className="flex items-center gap-2"><Avatar name={user.name} avatar={user.avatar} size="sm" /><span className="font-medium">{user.name}</span></div></td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{user.email}</td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{user.phone || '-'}</td>
                            <td className="py-3 px-4"><div className="flex items-center gap-1.5"><span className="font-medium">{user.store.name}</span><Badge className={`${planColors[user.store.plan] || planColors.free} text-[9px] capitalize border-0`}>{user.store.plan}</Badge></div></td>
                            <td className="py-3 px-4 text-center"><Badge className={`${user.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'} text-[10px] capitalize`}>{user.role}</Badge></td>
                            <td className="py-3 px-4 text-center"><StatusBadge isActive={user.store.isActive} /></td>
                            <td className="py-3 px-4 text-neutral-400 dark:text-neutral-500 text-xs">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody></table></div>
                    </div>
                    <div className="lg:hidden space-y-2">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white dark:bg-neutral-900 rounded-xl border p-3 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={user.name} avatar={user.avatar} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                                <Badge className={`${user.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'} text-[10px] capitalize`}>{user.role}</Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 truncate">{user.email}</p>
                              {user.phone && <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{user.phone}</p>}
                            </div>
                            <StatusBadge isActive={user.store.isActive} />
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50 dark:border-neutral-800">
                            <div className="flex items-center gap-1.5">
                              <Store className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                              <span className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-medium">{user.store.name}</span>
                              <Badge className={`${planColors[user.store.plan] || planColors.free} text-[9px] capitalize border-0`}>{user.store.plan}</Badge>
                            </div>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{formatDateShort(user.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ═══ CUPONES TAB ═══ */}
            {activeTab === 'cupones' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {filteredCoupons.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-12 text-center"><Tag className="w-12 h-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" /><p className="text-sm text-neutral-400 dark:text-neutral-500">Sin cupones creados</p><p className="text-xs text-neutral-300 dark:text-neutral-600 mt-1">Crea cupones desde el panel de cada tienda</p></div>
                ) : (
                  <div className="space-y-2">
                    {filteredCoupons.map((coupon) => (
                      <div key={coupon.id} className="bg-white dark:bg-neutral-900 rounded-xl border p-3 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                            {coupon.type === 'percentage' ? <Percent className="w-4 h-4 text-emerald-600" /> : <DollarSign className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">{coupon.code}</p>
                              <Badge className={coupon.isActive ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 text-[10px]' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 text-[10px]'}>
                                {coupon.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {coupon.type === 'percentage' ? `${coupon.value}% descuento` : `S/ ${coupon.value} descuento`}
                              {coupon.minPurchase ? ` · Min. S/ ${coupon.minPurchase}` : ''}
                              {' · '}{coupon.usedCount}/{coupon.maxUses || '∞'} usados
                              {coupon.store?.name ? ` · ${coupon.store.name}` : ''}
                            </p>
                          </div>
                          {coupon.expiresAt && (
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 hidden sm:block">{formatDateShort(coupon.expiresAt)}</span>
                          )}
                          <button onClick={async () => {
                            const json = await apiCall({ action: 'toggle-coupon', couponId: coupon.id, isActive: !coupon.isActive })
                            if (json.success) { showToast(json.message); setData(null); await fetchData() }
                          }} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0">
                            {coupon.isActive ? <Ban className="w-3.5 h-3.5 text-red-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                          </button>
                          <button onClick={async () => {
                            const json = await apiCall({ action: 'delete-coupon', couponId: coupon.id })
                            if (json.success) { showToast(json.message); setData(null); await fetchData() }
                          }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 shrink-0">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ LEADS TAB ═══ */}
            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {filteredLeads.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-12 text-center"><Mail className="w-12 h-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" /><p className="text-sm text-neutral-400 dark:text-neutral-500">Sin leads</p></div>
                ) : (
                  <div className="space-y-2">
                    {filteredLeads.map((lead: any) => (
                      <div key={lead.id} className="bg-white dark:bg-neutral-900 rounded-xl border p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{lead.name}</p>
                            <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {lead.plan && <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] border-0">{lead.plan}</Badge>}
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">{formatDateShort(lead.createdAt)}</span>
                          </div>
                        </div>
                        {lead.message && <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">{lead.message}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* ═══ MOBILE NAV ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative ${activeTab === tab.id ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}`}>
              {activeTab === tab.id && <motion.div layoutId="tab-ind" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neutral-900 dark:bg-neutral-100 rounded-full" />}
              <div className="relative"><tab.icon className="w-5 h-5" />
                {tab.count !== undefined && tab.count > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full px-0.5">{tab.count > 99 ? '99+' : tab.count}</span>}
              </div>
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ═══ MODALS ═══ */}

      {/* Coupon Modal */}
      <Modal open={couponModal.open} onClose={() => setCouponModal({ open: false, storeId: '', storeName: '' })} title={`Crear Cupon - ${couponModal.storeName}`}>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Codigo</label><Input placeholder="Ej: VERANO20" value={couponForm.code} onChange={(e) => setCouponForm(f => ({ ...f, code: e.target.value }))} className="h-10 uppercase" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Tipo</label>
              <select value={couponForm.type} onChange={(e) => setCouponForm(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 text-sm bg-white dark:bg-neutral-900">
                <option value="percentage">Porcentaje (%)</option><option value="fixed">Monto fijo (S/)</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Valor</label><Input placeholder={couponForm.type === 'percentage' ? '20' : '50'} type="number" value={couponForm.value} onChange={(e) => setCouponForm(f => ({ ...f, value: e.target.value }))} className="h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Compra minima (S/)</label><Input placeholder="Opcional" type="number" value={couponForm.minPurchase} onChange={(e) => setCouponForm(f => ({ ...f, minPurchase: e.target.value }))} className="h-10" /></div>
            <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Max usos (0=∞)</label><Input placeholder="0" type="number" value={couponForm.maxUses} onChange={(e) => setCouponForm(f => ({ ...f, maxUses: e.target.value }))} className="h-10" /></div>
          </div>
          <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Expira (opcional)</label><Input type="date" value={couponForm.expiresAt} onChange={(e) => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))} className="h-10" /></div>
          <Button onClick={handleCreateCoupon} disabled={actionLoading === 'coupon'} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-lg">
            {actionLoading === 'coupon' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Crear Cupon'}
          </Button>
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal open={notifModal.open} onClose={() => setNotifModal({ open: false, broadcast: true })} title={notifModal.broadcast ? 'Enviar Broadcast a Todas las Tiendas' : `Notificar - ${notifModal.storeName}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-700 dark:text-blue-400">{notifModal.broadcast ? 'Se enviara a TODAS las tiendas' : `Se enviara a: ${notifModal.storeName}`}</span>
          </div>

          {/* Quick Promo Templates */}
          <div>
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Plantillas Rapidas</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Bienvenida', type: 'info', title: 'Bienvenido a tu Tienda Online', msg: 'Tu tienda online esta lista. Comienza a configurar tus productos, categorias y metodos de pago. Si necesitas ayuda, no dudes en contactarnos.' },
                { label: 'Promocion', type: 'promo', title: 'Gran Promocion Especial', msg: 'Aprovecha nuestra promocion especial. Usa el cupon BIENVENIDO10 y obtiene un 10% de descuento en tu primera compra. Valido por tiempo limitado.' },
                { label: 'Recordatorio', type: 'warning', title: 'Renueva tu Suscripcion', msg: 'Tu suscripcion esta por vencer. Renueva ahora para no perder acceso a todas las funciones de tu tienda online. Contactanos para obtener descuentos por renovacion anticipada.' },
                { label: 'Nuevo Cupon', type: 'coupon', title: 'Nuevo Cupon de Descuento Disponible', msg: 'Se ha creado un nuevo cupon de descuento exclusivo para ti. Revisa la seccion de cupones en tu panel de administracion para ver los detalles.' },
                { label: 'Actualizacion', type: 'info', title: 'Nuevas Funciones Disponibles', msg: 'Hemos actualizado la plataforma con nuevas funciones. Ahora puedes gestionar mejor tus pedidos, productos y clientes desde el panel de administracion.' },
              ].map((tpl) => (
                <button key={tpl.label} onClick={() => setNotifForm({ type: tpl.type, title: tpl.title, message: tpl.msg })} className="text-[10px] px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium transition-colors">
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Tipo</label>
            <select value={notifForm.type} onChange={(e) => setNotifForm(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 text-sm bg-white dark:bg-neutral-900">
              <option value="info">Info</option><option value="promo">Promocion</option><option value="warning">Alerta</option><option value="coupon">Cupon</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Titulo</label><Input placeholder="Titulo del mensaje" value={notifForm.title} onChange={(e) => setNotifForm(f => ({ ...f, title: e.target.value }))} className="h-10" /></div>
          <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Mensaje</label><textarea placeholder="Escribe el mensaje..." value={notifForm.message} onChange={(e) => setNotifForm(f => ({ ...f, message: e.target.value }))} className="w-full h-24 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm resize-none bg-white dark:bg-neutral-900" /></div>
          <Button onClick={handleSendNotification} disabled={actionLoading === 'notif'} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg">
            {actionLoading === 'notif' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4 mr-1.5" /> Enviar</>}
          </Button>
        </div>
      </Modal>

      {/* Subscription Modal */}
      <Modal open={subModal.open} onClose={() => setSubModal({ open: false, storeId: '', storeName: '' })} title={`Suscripcion - ${subModal.storeName}`}>
        <div className="space-y-3">
          {subModal.currentExpiry && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Timer className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-700 dark:text-orange-400">Expira: {new Date(subModal.currentExpiry).toLocaleDateString('es-PE')}</span>
            </div>
          )}
          <div><label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Dias a agregar</label>
            <div className="flex gap-2 mt-1.5">
              {[7, 15, 30, 60, 90, 365].map(d => (
                <button key={d} onClick={() => setSubDays(String(d))} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${subDays === String(d) ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>{d}d</button>
              ))}
            </div>
            <Input type="number" placeholder="O custom..." value={subDays} onChange={(e) => setSubDays(e.target.value)} className="h-10 mt-2" />
          </div>
          <Button onClick={handleSetSubscription} disabled={actionLoading === 'sub'} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10 rounded-lg">
            {actionLoading === 'sub' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Timer className="w-4 h-4 mr-1.5" /> Aplicar</>}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
