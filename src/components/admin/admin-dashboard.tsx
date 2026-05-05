'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  UserPlus,
  BarChart3,
  CreditCard,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Crown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/stores/auth-store'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  newLeads: number
  ordersToday: number
  recentOrders: RecentOrder[]
  recentPayments: RecentPayment[]
  dailySales: { date: string; total: number; orders: number }[]
  orderStatusDist: { status: string; count: number }[]
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
  items: { id: string; productName: string; quantity: number; price: number }[]
}

interface RecentPayment {
  orderNumber: string
  total: number
  status: string
  paymentMethod: { name: string; type: string } | null
  createdAt: string
}

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const paymentMethodBadge: Record<string, string> = {
  yape: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  plin: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  efectivo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  transferencia: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tarjeta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  niubiz: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  mercadopago: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
}

const paymentMethodEmoji: Record<string, string> = {
  yape: '💜',
  plin: '🟢',
  efectivo: '💵',
  transferencia: '🏦',
  tarjeta: '💳',
  niubiz: '🔴',
  mercadopago: '🔵',
}

const statCards = [
  {
    key: 'totalRevenue',
    label: 'Ingresos Totales',
    icon: DollarSign,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    format: (v: number) => `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
  },
  {
    key: 'totalOrders',
    label: 'Total Pedidos',
    icon: ShoppingCart,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalProducts',
    label: 'Total Productos',
    icon: Package,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalCustomers',
    label: 'Total Clientes',
    icon: Users,
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    format: (v: number) => v.toString(),
  },
  {
    key: 'ordersToday',
    label: 'Pedidos Hoy',
    icon: CalendarCheck,
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    format: (v: number) => v.toString(),
  },
]

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeStatus, setStoreStatus] = useState<{ approvalStatus: string; plan: string; isActive: boolean } | null>(null)

  useEffect(() => {
    if (!user?.storeId) return
    async function fetchStats() {
      try {
        const sid = user!.storeId
        const { token } = useAuthStore.getState()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        
        // Fetch store status in parallel
        const storeRes = await fetch(`/api/admin/settings?storeId=${sid}`, { headers })
        if (storeRes.ok) {
          const storeData = await storeRes.json()
          setStoreStatus({
            approvalStatus: storeData.approvalStatus || 'approved',
            plan: storeData.plan || 'gratis',
            isActive: storeData.isActive !== false,
          })
        }

        const res = await fetch(`/api/admin/dashboard?storeId=${sid}`, {
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user?.storeId])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="rounded-xl border-neutral-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="mt-3 h-7 w-28" />
                <Skeleton className="mt-1 h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-xl border-neutral-200 lg:col-span-2">
            <CardContent className="p-5">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="rounded-xl border-neutral-200">
            <CardContent className="p-5">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-5">
            <Skeleton className="h-6 w-40 mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasChartData = stats?.dailySales?.some((d) => d.total > 0)

  return (
    <div className="w-full space-y-6">
      {/* ═══ STORE APPROVAL STATUS BANNER ═══ */}
      {storeStatus?.approvalStatus === 'pending' && (
        <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-amber-900">Tu tienda está pendiente de aprobación</h3>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Un administrador está revisando tu solicitud. Mientras tanto, <strong>no puedes guardar cambios, 
                subir productos ni modificar categorías</strong>. 
                Una vez aprobada, recibirás un email de notificación.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 p-3.5 bg-white/70 rounded-xl border border-amber-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-900">¿Quieres un plan superior?</p>
                <p className="text-[11px] text-blue-600 mt-0.5">Contacta por WhatsApp para coordinar el upgrade de plan y pago.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3.5 bg-white/70 rounded-xl border border-amber-200">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-900">Plan actual: Gratuito</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Al aprobar, el admin puede asignarte el plan que elijas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {storeStatus?.approvalStatus === 'rejected' && (
        <div className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-red-900">Tu tienda fue rechazada</h3>
              <p className="text-sm text-red-700 mt-1">
                Contacta al soporte por WhatsApp para más información sobre el rechazo y cómo proceder.
              </p>
            </div>
          </div>
        </div>
      )}

      {storeStatus && storeStatus.approvalStatus === 'approved' && storeStatus.plan === 'gratis' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900">Estás en el plan Gratuito</p>
            <p className="text-[11px] text-amber-700">Tienes acceso limitado. Contacta por WhatsApp para upgrade.</p>
          </div>
        </div>
      )}

      {/* Quick alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats && stats.pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 rounded-xl"
          >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {stats.pendingOrders} pedidos pendientes
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Revisa y confirma los pedidos nuevos
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-400 ml-auto" />
          </motion.div>
        )}
        {stats && stats.newLeads > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl"
          >
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                {stats.newLeads} nuevos leads
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Contactos interesados en tu tienda
              </p>
            </div>
            <UserPlus className="w-5 h-5 text-emerald-400 ml-auto opacity-40" />
          </motion.div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const value = stats ? (stats as unknown as Record<string, unknown>)[card.key] as number : 0
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-xl border-neutral-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {card.label}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {card.format(value)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <Card className="rounded-xl border-neutral-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Ventas de los Últimos 7 Días
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats?.dailySales} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `S/${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Ventas']}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
                <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Sin datos de ventas</p>
                <p className="text-xs mt-1">Los pedidos aparecerán aquí automáticamente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order status distribution */}
        <Card className="rounded-xl border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Estado de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.orderStatusDist && stats.orderStatusDist.length > 0 ? (
                stats.orderStatusDist
                  .sort((a, b) => b.count - a.count)
                  .map((item) => {
                    const total = stats.orderStatusDist.reduce((s, i) => s + i.count, 0)
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                    return (
                      <div key={item.status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {statusLabel[item.status] || item.status}
                          </span>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              statusBadge[item.status]?.includes('green')
                                ? 'bg-green-500'
                                : statusBadge[item.status]?.includes('amber')
                                ? 'bg-amber-500'
                                : statusBadge[item.status]?.includes('blue')
                                ? 'bg-blue-500'
                                : statusBadge[item.status]?.includes('cyan')
                                ? 'bg-cyan-500'
                                : statusBadge[item.status]?.includes('red')
                                ? 'bg-red-500'
                                : 'bg-purple-500'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                  <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Sin pedidos</p>
                  <p className="text-xs mt-1">Los pedidos aparecerán aquí</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent payments */}
      {stats?.recentPayments && stats.recentPayments.length > 0 && (
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-0">
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-400" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Últimos Pagos Recibidos</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Últimos 10 pagos y métodos de pago utilizados
              </p>
            </div>
            {/* Desktop table */}
            <div className="mt-4 overflow-x-auto hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Pedido
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Método de Pago
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Fecha
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((payment, i) => {
                    const pmType = payment.paymentMethod?.type?.toLowerCase() || ''
                    const pmName = payment.paymentMethod?.name || 'No especificado'
                    const emoji = paymentMethodEmoji[pmType] || '💳'
                    const badgeClass = paymentMethodBadge[pmType] || 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    return (
                      <TableRow
                        key={`${payment.orderNumber}-${i}`}
                        className="border-neutral-50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                      >
                        <TableCell className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                          #{payment.orderNumber.slice(-6)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${badgeClass}`}
                          >
                            {emoji} {pmName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-500">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                          S/ {payment.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${
                              statusBadge[payment.status] || 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {statusLabel[payment.status] || payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Mobile card view */}
            <div className="mt-4 md:hidden px-5 pb-5 space-y-3">
              {stats.recentPayments.map((payment, i) => {
                const pmType = payment.paymentMethod?.type?.toLowerCase() || ''
                const pmName = payment.paymentMethod?.name || 'No especificado'
                const emoji = paymentMethodEmoji[pmType] || '💳'
                const badgeClass = paymentMethodBadge[pmType] || 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                return (
                  <motion.div
                    key={`mobile-${payment.orderNumber}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        #{payment.orderNumber.slice(-6)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${
                          statusBadge[payment.status] || 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {statusLabel[payment.status] || payment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${badgeClass}`}
                        >
                          {emoji} {pmName}
                        </Badge>
                        <span className="text-xs text-neutral-400">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        S/ {payment.total.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent orders */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-0">
          <div className="p-5 pb-0">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Pedidos Recientes</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Últimos 5 pedidos de tu tienda
            </p>
          </div>
          {/* Desktop table */}
          <div className="mt-4 overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Pedido
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Cliente
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Fecha
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Items
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">
                    Estado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-neutral-50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                    >
                      <TableCell className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                        #{order.orderNumber.slice(-6)}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600 dark:text-neutral-400">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {order.items?.length || 0} items
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                        S/ {order.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${
                            statusBadge[order.status] || 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {statusLabel[order.status] || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <p className="text-neutral-400 text-sm">No hay pedidos aún</p>
                      <p className="text-neutral-300 text-xs mt-1">
                        Los pedidos de tus clientes aparecerán aquí automáticamente
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile card view */}
          <div className="mt-4 md:hidden px-5 pb-5 space-y-3">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, i) => (
                <motion.div
                  key={`mobile-${order.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      #{order.orderNumber.slice(-6)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${
                        statusBadge[order.status] || 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {statusLabel[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      {order.items?.length || 0} items
                    </span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      S/ {order.total.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No hay pedidos aún</p>
                <p className="text-xs mt-1 text-neutral-300">
                  Los pedidos aparecerán aquí automáticamente
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
