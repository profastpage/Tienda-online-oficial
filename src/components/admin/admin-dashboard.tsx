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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useAuthStore } from '@/stores/auth-store'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  recentOrders: RecentOrder[]
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

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const statCards = [
  {
    key: 'totalRevenue',
    label: 'Ingresos Totales',
    icon: DollarSign,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    format: (v: number) => `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
  },
  {
    key: 'totalOrders',
    label: 'Total Pedidos',
    icon: ShoppingCart,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalProducts',
    label: 'Total Productos',
    icon: Package,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalCustomers',
    label: 'Total Clientes',
    icon: Users,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    format: (v: number) => v.toString(),
  },
]

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.storeId) return
    async function fetchStats() {
      try {
        const res = await fetch(`/api/admin/dashboard?storeId=${user.storeId}`)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Quick stats summary */}
      {stats && stats.pendingOrders > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {stats.pendingOrders} pedidos pendientes
            </p>
            <p className="text-xs text-amber-700">
              Revisa y confirma los pedidos nuevos
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-400 ml-auto" />
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const value = stats ? (stats as Record<string, unknown>)[card.key] as number : 0
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
                  <p className="mt-3 text-2xl font-bold text-neutral-900">
                    {card.format(value)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recent orders */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-0">
          <div className="p-5 pb-0">
            <h3 className="text-base font-bold text-neutral-900">Pedidos Recientes</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Últimos 5 pedidos de tu tienda
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
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
                      className="border-neutral-50 hover:bg-neutral-50/50"
                    >
                      <TableCell className="font-medium text-neutral-900 text-sm">
                        #{order.orderNumber.slice(-6)}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-neutral-900 text-right">
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
                    <TableCell colSpan={5} className="h-32 text-center">
                      <p className="text-neutral-400 text-sm">No hay pedidos aún</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
