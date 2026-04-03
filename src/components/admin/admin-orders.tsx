'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Eye,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  StickyNote,
  Package,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthStore } from '@/stores/auth-store'

interface OrderItem {
  id: string
  productName: string
  productImage: string
  price: number
  quantity: number
  size: string
  color: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  status: string
  total: number
  notes: string
  createdAt: string
  items: OrderItem[]
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

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

const statusOptions = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

export function AdminOrders() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const storeId = user?.storeId || ''

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ storeId })
      if (activeFilter !== 'all') params.set('status', activeFilter)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) setOrders(await res.json())
    } catch {
      // silent
    }
  }, [storeId, activeFilter])

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false))
  }, [fetchOrders])

  const handleChangeStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (res.ok) {
        await fetchOrders()
        // Also update viewed order if it's the same
        if (viewOrder?.id === orderId) {
          setViewOrder({ ...viewOrder, status: newStatus })
        }
      }
    } catch {
      // silent
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-lg text-xs font-medium h-8 px-3 ${
              activeFilter === filter.value
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {filter.label}
            {activeFilter === filter.value && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({orders.length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Orders table */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Pedido
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Cliente
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                    Fecha
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center hidden sm:table-cell">
                    Items
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-neutral-50 hover:bg-neutral-50/50"
                    >
                      <TableCell className="font-medium text-neutral-900 text-sm">
                        #{order.orderNumber.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-neutral-900">{order.customerName}</p>
                          <p className="text-xs text-neutral-400 md:hidden">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-neutral-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                          <Package className="w-3.5 h-3.5" />
                          {order.items.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-semibold text-neutral-900">
                          S/ {order.total.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Select
                            value={order.status}
                            onValueChange={(val) => handleChangeStatus(order.id, val)}
                          >
                            <SelectTrigger
                              className={`w-[110px] h-7 text-[10px] font-semibold border-0 rounded-full px-2.5 ${
                                statusBadge[order.status] || 'bg-neutral-100 text-neutral-600'
                              } ${updatingStatus === order.id ? 'opacity-50' : ''}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {statusLabel[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-neutral-900"
                          onClick={() => setViewOrder(order)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="w-10 h-10 text-neutral-300" />
                        <p className="text-neutral-400 text-sm">
                          {activeFilter === 'all'
                            ? 'No hay pedidos aún'
                            : `No hay pedidos ${statusLabel[activeFilter]?.toLowerCase()}s`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {orders.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View order dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-6">
          {viewOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-neutral-900">
                  Pedido #{viewOrder.orderNumber.slice(-6)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Status & date */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
                      statusBadge[viewOrder.status] || 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {statusLabel[viewOrder.status]}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(viewOrder.createdAt)}
                  </div>
                </div>

                <Separator />

                {/* Customer info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-900">Información del cliente</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Nombre</p>
                        <p className="text-sm font-medium text-neutral-900">
                          {viewOrder.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Teléfono</p>
                        <p className="text-sm font-medium text-neutral-900">
                          {viewOrder.customerPhone || '—'}
                        </p>
                      </div>
                    </div>
                    {viewOrder.customerAddress && (
                      <div className="flex items-center gap-2.5 sm:col-span-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">Dirección</p>
                          <p className="text-sm font-medium text-neutral-900">
                            {viewOrder.customerAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Order items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Productos ({viewOrder.items.length})
                  </h4>
                  <div className="space-y-2">
                    {viewOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100"
                      >
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.size && (
                              <span className="text-xs text-neutral-400">
                                Talla: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-xs text-neutral-400">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-neutral-900">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-neutral-400">
                            S/ {item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                {viewOrder.notes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-neutral-400" />
                      <h4 className="text-sm font-semibold text-neutral-900">Notas</h4>
                    </div>
                    <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                      {viewOrder.notes}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-xl">
                  <span className="text-sm font-medium text-neutral-300">Total del pedido</span>
                  <span className="text-xl font-bold text-white">
                    S/ {viewOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
