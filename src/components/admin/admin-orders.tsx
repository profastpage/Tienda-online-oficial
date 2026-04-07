'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Eye,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  StickyNote,
  Package,
  Clock,
  CreditCard,
  Trash2,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  DollarSign,
  AlertTriangle,
  Mail,
  Hash,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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

interface PaymentMethodInfo {
  name: string
  type: string
}

interface MercadoPagoPaymentInfo {
  id: string
  preferenceId: string
  paymentId: string | null
  status: string
  paymentType: string
  lastFourDigits: string
  installments: number
  payerEmail: string
  createdAt: string
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
  paymentMethod: PaymentMethodInfo | null
  mercadoPagoPayment: MercadoPagoPaymentInfo | null
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const paymentMethodBadge: Record<string, string> = {
  yape: 'bg-purple-100 text-purple-700',
  plin: 'bg-teal-100 text-teal-700',
  efectivo: 'bg-green-100 text-green-700',
  transferencia: 'bg-blue-100 text-blue-700',
  tarjeta: 'bg-orange-100 text-orange-700',
}

const paymentMethodIcon: Record<string, string> = {
  yape: '💜',
  plin: '💚',
  efectivo: '💵',
  transferencia: '🏦',
  tarjeta: '💳',
}

const mpStatusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  authorized: 'bg-green-100 text-green-700',
  in_process: 'bg-blue-100 text-blue-700',
  in_mediation: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

const mpStatusLabel: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  authorized: 'Autorizado',
  in_process: 'En proceso',
  in_mediation: 'En mediación',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

const statusOptions = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

export function AdminOrders() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const storeId = user?.storeId || ''

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery])

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ storeId })
      if (activeFilter !== 'all') params.set('status', activeFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('sort', sortOrder)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) setOrders(await res.json())
    } catch {
      // silent
    }
  }, [storeId, activeFilter, debouncedSearch, sortOrder])

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

  const handleDeleteOrder = async () => {
    if (!deleteOrder) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders?id=${deleteOrder.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteOrder(null)
        if (viewOrder?.id === deleteOrder.id) setViewOrder(null)
        await fetchOrders()
      }
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!viewOrder) return
    setSavingNotes(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: viewOrder.id, notes: editNotes }),
      })
      if (res.ok) {
        const updatedOrder = await res.json()
        setViewOrder(updatedOrder)
        setIsEditingNotes(false)
      }
    } catch {
      // silent
    } finally {
      setSavingNotes(false)
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

  // Statistics
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length

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

      {/* Search bar & sort toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por número de pedido o nombre del cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-sm rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          className="h-10 rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50 gap-2 px-4"
        >
          {sortOrder === 'desc' ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">
            {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
          </span>
        </Button>
      </div>

      {/* Statistics bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Total pedidos</p>
              <p className="text-lg font-bold text-neutral-900">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Ingresos totales</p>
              <p className="text-lg font-bold text-neutral-900">S/ {totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Pendientes</p>
              <p className="text-lg font-bold text-neutral-900">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
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
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                    Pago
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
                      <TableCell className="hidden lg:table-cell">
                        {order.mercadoPagoPayment ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              mpStatusBadge[order.mercadoPagoPayment.status] || 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            💳 MP
                          </span>
                        ) : order.paymentMethod ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              paymentMethodBadge[order.paymentMethod.type.toLowerCase()] || 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            <span>{paymentMethodIcon[order.paymentMethod.type.toLowerCase()] || '💳'}</span>
                            {order.paymentMethod.name}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-neutral-900"
                            onClick={() => {
                              setViewOrder(order)
                              setEditNotes(order.notes)
                              setIsEditingNotes(false)
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {(order.status === 'pending' || order.status === 'cancelled') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-red-600"
                              onClick={() => setDeleteOrder(order)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="w-10 h-10 text-neutral-300" />
                        <p className="text-neutral-400 text-sm">
                          {activeFilter === 'all' || debouncedSearch
                            ? 'No se encontraron pedidos'
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteOrder} onOpenChange={(open) => !open && setDeleteOrder(null)}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              Eliminar pedido
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500 mt-2">
              ¿Estás seguro de que deseas eliminar el pedido <strong>#{deleteOrder?.orderNumber.slice(-6)}</strong> de <strong>{deleteOrder?.customerName}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                disabled={deleting}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                {/* Status & date & payment */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
                        statusBadge[viewOrder.status] || 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {statusLabel[viewOrder.status]}
                    </Badge>
                    {viewOrder.paymentMethod && !viewOrder.mercadoPagoPayment && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          paymentMethodBadge[viewOrder.paymentMethod.type.toLowerCase()] || 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        {viewOrder.paymentMethod.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(viewOrder.createdAt)}
                  </div>
                </div>

                {/* MercadoPago payment info */}
                {viewOrder.mercadoPagoPayment && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-neutral-400" />
                        Pago con MercadoPago
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Hash className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400">Estado MP</p>
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                                mpStatusBadge[viewOrder.mercadoPagoPayment.status] || 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {mpStatusLabel[viewOrder.mercadoPagoPayment.status] || viewOrder.mercadoPagoPayment.status}
                            </span>
                          </div>
                        </div>
                        {viewOrder.mercadoPagoPayment.paymentType && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Layers className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Tipo de pago</p>
                              <p className="text-sm font-medium text-neutral-900">
                                {viewOrder.mercadoPagoPayment.paymentType}
                              </p>
                            </div>
                          </div>
                        )}
                        {viewOrder.mercadoPagoPayment.lastFourDigits && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Últimos 4 dígitos</p>
                              <p className="text-sm font-medium text-neutral-900">
                                •••• {viewOrder.mercadoPagoPayment.lastFourDigits}
                              </p>
                            </div>
                          </div>
                        )}
                        {viewOrder.mercadoPagoPayment.installments > 1 && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Layers className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Cuotas</p>
                              <p className="text-sm font-medium text-neutral-900">
                                {viewOrder.mercadoPagoPayment.installments} cuotas
                              </p>
                            </div>
                          </div>
                        )}
                        {viewOrder.mercadoPagoPayment.payerEmail && (
                          <div className="flex items-center gap-2.5 sm:col-span-2">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Email del pagador</p>
                              <p className="text-sm font-medium text-neutral-900">
                                {viewOrder.mercadoPagoPayment.payerEmail}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-sm font-semibold text-neutral-900">Notas</h4>
                  </div>
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Agregar notas sobre el pedido..."
                        rows={3}
                        className="text-sm rounded-xl border-neutral-200 resize-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-3"
                        >
                          {savingNotes ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5 mr-1.5" />
                              Guardar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingNotes(false)
                            setEditNotes(viewOrder.notes)
                          }}
                          disabled={savingNotes}
                          className="h-8 rounded-lg border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-medium px-3"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100 min-h-[40px] cursor-pointer hover:border-neutral-200 transition-colors"
                      onClick={() => {
                        setEditNotes(viewOrder.notes)
                        setIsEditingNotes(true)
                      }}
                    >
                      {viewOrder.notes || (
                        <span className="text-neutral-400 italic">Click para agregar notas...</span>
                      )}
                    </div>
                  )}
                </div>

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
