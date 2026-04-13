'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  StickyNote,
  Package,
  Clock,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

export function CustomerOrders() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/customer/orders?userId=${user.id}`)
      if (res.ok) setOrders(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.items.some((item) => item.productName.toLowerCase().includes(q))
    )
  })

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
        <Skeleton className="h-10 w-full max-w-sm" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="Buscar por número o producto..."
          className="pl-9 h-10 bg-white rounded-xl border-neutral-200 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Desktop table view */}
      <Card className="rounded-xl border-neutral-200 shadow-sm hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Pedido
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Fecha
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">
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
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-neutral-50 hover:bg-neutral-50/50 cursor-pointer"
                      onClick={() => setViewOrder(order)}
                    >
                      <TableCell className="font-medium text-neutral-900 text-sm">
                        #{order.orderNumber.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-neutral-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
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
                        <Badge
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${
                            statusBadge[order.status] || 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {statusLabel[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-neutral-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewOrder(order)
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="w-10 h-10 text-neutral-300" />
                        <p className="text-neutral-400 text-sm">
                          {searchQuery
                            ? 'No se encontraron pedidos'
                            : 'No hay pedidos aún'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">
                {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Card
                className="rounded-xl border-neutral-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setViewOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          #{order.orderNumber.slice(-6)}
                        </p>
                        <Badge
                          className={`text-[10px] font-semibold px-2 py-0 rounded-full border-0 ${
                            statusBadge[order.status] || 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {statusLabel[order.status] || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-neutral-900">
                        S/ {order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {/* Preview items */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item) =>
                        item.productImage ? (
                          <img
                            key={item.id}
                            src={item.productImage}
                            alt={item.productName}
                            className="w-8 h-8 rounded-lg object-cover bg-neutral-200 border-2 border-white"
                          />
                        ) : (
                          <div
                            key={item.id}
                            className="w-8 h-8 rounded-lg bg-neutral-200 border-2 border-white flex items-center justify-center"
                          >
                            <Package className="w-3 h-3 text-neutral-400" />
                          </div>
                        )
                      )}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 border-2 border-white flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-neutral-500">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 truncate ml-1">
                      {order.items.map((i) => i.productName).join(', ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-16">
            <ShoppingCart className="w-12 h-12 text-neutral-300" />
            <p className="text-neutral-400 text-sm">
              {searchQuery
                ? 'No se encontraron pedidos'
                : 'No hay pedidos aún'}
            </p>
          </div>
        )}
      </div>

      {/* Order detail dialog */}
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
                  <h4 className="text-sm font-semibold text-neutral-900">Información de envío</h4>
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
                            <span className="text-xs text-neutral-400">
                              Cantidad: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-neutral-900">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-neutral-400">
                            S/ {item.price.toFixed(2)} c/u
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
