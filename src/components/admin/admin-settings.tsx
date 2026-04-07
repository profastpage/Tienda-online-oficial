'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Save,
  Store,
  Loader2,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  QrCode,
  ChevronDown,
  ChevronUp,
  Bell,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth-store'

interface StoreData {
  id: string
  name: string
  description: string
  whatsappNumber: string
  address: string
  logo: string
  slug: string
}

interface PaymentMethod {
  id: string
  storeId: string
  type: string
  name: string
  isActive: boolean
  qrCode: string
  accountNumber: string
  accountHolder: string
  bankName: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const PAYMENT_TYPES: { value: string; label: string; icon: string }[] = [
  { value: 'yape', label: 'Yape', icon: '💜' },
  { value: 'plin', label: 'Plin', icon: '💚' },
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'niubiz', label: 'Niubiz', icon: '🔴' },
  { value: 'mercadopago', label: 'MercadoPago', icon: '💙' },
  { value: 'otro', label: 'Otro', icon: '💰' },
]

const PAYMENT_TYPE_COLORS: Record<string, string> = {
  yape: 'bg-purple-100 text-purple-700',
  plin: 'bg-teal-100 text-teal-700',
  efectivo: 'bg-green-100 text-green-700',
  transferencia: 'bg-blue-100 text-blue-700',
  tarjeta: 'bg-orange-100 text-orange-700',
  niubiz: 'bg-red-100 text-red-700',
  mercadopago: 'bg-sky-100 text-sky-700',
  otro: 'bg-neutral-100 text-neutral-700',
}

const PAYMENT_TYPE_ICONS: Record<string, string> = {
  yape: '💜',
  plin: '💚',
  efectivo: '💵',
  transferencia: '🏦',
  tarjeta: '💳',
  niubiz: '🔴',
  mercadopago: '💙',
  otro: '💰',
}

function getPaymentTypeLabel(type: string): string {
  return PAYMENT_TYPES.find((t) => t.value === type)?.label || type
}

function getPaymentTypeIcon(type: string): string {
  return PAYMENT_TYPE_ICONS[type] || '💰'
}

function getPaymentTypeColor(type: string): string {
  return PAYMENT_TYPE_COLORS[type] || 'bg-neutral-100 text-neutral-700'
}

interface PaymentMethodFormData {
  type: string
  name: string
  accountNumber: string
  accountHolder: string
  bankName: string
  qrCode: string
  sortOrder: number
  isActive: boolean
}

const defaultPaymentForm: PaymentMethodFormData = {
  type: 'yape',
  name: 'Yape',
  accountNumber: '',
  accountHolder: '',
  bankName: '',
  qrCode: '',
  sortOrder: 0,
  isActive: true,
}

export function AdminSettings() {
  const user = useAuthStore((s) => s.user)
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    whatsappNumber: '',
    address: '',
    logo: '',
  })

  const storeId = user?.storeId || ''

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [pmLoading, setPmLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentMethodFormData>({ ...defaultPaymentForm })
  const [pmSaving, setPmSaving] = useState(false)
  const [pmSaved, setPmSaved] = useState(false)

  // Edit dialog state
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null)
  const [editForm, setEditForm] = useState<PaymentMethodFormData>({ ...defaultPaymentForm })
  const [editSaving, setEditSaving] = useState(false)

  // Delete dialog state
  const [deletingPayment, setDeletingPayment] = useState<PaymentMethod | null>(null)
  const [deleteSaving, setDeleteSaving] = useState(false)

  useEffect(() => {
    if (!storeId) return
    async function fetchStore() {
      try {
        const res = await fetch(`/api/admin/settings?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          setStore(data)
          setForm({
            name: data.name || '',
            description: data.description || '',
            whatsappNumber: data.whatsappNumber || '',
            address: data.address || '',
            logo: data.logo || '',
          })
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchStore()
  }, [storeId])

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!storeId) return
    setPmLoading(true)
    try {
      const res = await fetch(`/api/admin/payment-methods?storeId=${storeId}`)
      if (res.ok) {
        const data = await res.json()
        setPaymentMethods(data)
      }
    } catch {
      // silent
    } finally {
      setPmLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const handleSave = async () => {
    if (!storeId) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storeId,
          ...form,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setStore(data)
        setSaved(true)
        // Update user storeName in auth store
        if (user && form.name !== user.storeName) {
          useAuthStore.getState().setUser({ ...user, storeName: form.name })
        }
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  // Handle payment type change - auto-fill name
  const handlePaymentTypeChange = (type: string) => {
    const label = getPaymentTypeLabel(type)
    setPaymentForm({ ...paymentForm, type, name: label })
  }

  // Handle edit type change - auto-fill name
  const handleEditTypeChange = (type: string) => {
    const label = getPaymentTypeLabel(type)
    setEditForm({ ...editForm, type, name: label })
  }

  // Save new payment method
  const handleSavePaymentMethod = async () => {
    if (!storeId) return
    setPmSaving(true)
    setPmSaved(false)
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          ...paymentForm,
        }),
      })
      if (res.ok) {
        setPmSaved(true)
        setPaymentForm({ ...defaultPaymentForm })
        setShowAddForm(false)
        await fetchPaymentMethods()
        setTimeout(() => setPmSaved(false), 3000)
      }
    } catch {
      // silent
    } finally {
      setPmSaving(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (pm: PaymentMethod) => {
    setEditingPayment(pm)
    setEditForm({
      type: pm.type,
      name: pm.name,
      accountNumber: pm.accountNumber,
      accountHolder: pm.accountHolder,
      bankName: pm.bankName,
      qrCode: pm.qrCode,
      sortOrder: pm.sortOrder,
      isActive: pm.isActive,
    })
  }

  // Save edited payment method
  const handleUpdatePaymentMethod = async () => {
    if (!editingPayment) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/admin/payment-methods/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setEditingPayment(null)
        await fetchPaymentMethods()
      }
    } catch {
      // silent
    } finally {
      setEditSaving(false)
    }
  }

  // Toggle payment method active status
  const handleTogglePayment = async (pm: PaymentMethod) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${pm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pm, isActive: !pm.isActive }),
      })
      if (res.ok) {
        await fetchPaymentMethods()
      }
    } catch {
      // silent
    }
  }

  // Delete payment method
  const handleDeletePayment = async () => {
    if (!deletingPayment) return
    setDeleteSaving(true)
    try {
      const res = await fetch(`/api/admin/payment-methods/${deletingPayment.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeletingPayment(null)
        await fetchPaymentMethods()
      }
    } catch {
      // silent
    } finally {
      setDeleteSaving(false)
    }
  }

  // Sort payment methods by sortOrder
  const sortedPaymentMethods = [...paymentMethods].sort((a, b) => a.sortOrder - b.sortOrder)

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-32" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Configuración de la Tienda</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Administra la información general de tu tienda
        </p>
      </div>

      {/* Logo preview */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            {form.logo ? (
              <img
                src={form.logo}
                alt="Logo"
                className="w-16 h-16 rounded-2xl object-cover bg-neutral-100 border border-neutral-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {form.name || 'Nombre de la tienda'}
              </h3>
              {store?.slug && (
                <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                  tienda.com/{store.slug}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings form */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-6 space-y-6">
          {/* Store name */}
          <div className="space-y-2">
            <Label htmlFor="store-name" className="text-sm font-medium text-neutral-700">
              Nombre de la tienda
            </Label>
            <Input
              id="store-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Mi Tienda"
              className="h-10 rounded-lg text-sm border-neutral-200"
            />
          </div>

          <Separator className="bg-neutral-100" />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="store-desc" className="text-sm font-medium text-neutral-700">
              Descripción
            </Label>
            <Textarea
              id="store-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe tu tienda..."
              rows={4}
              className="rounded-lg text-sm border-neutral-200 resize-none"
            />
            <p className="text-xs text-neutral-400">
              Aparecerá en la página principal de tu tienda
            </p>
          </div>

          <Separator className="bg-neutral-100" />

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="store-wa" className="text-sm font-medium text-neutral-700">
              Número de WhatsApp
            </Label>
            <Input
              id="store-wa"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="+51 999 888 777"
              className="h-10 rounded-lg text-sm border-neutral-200"
            />
            <p className="text-xs text-neutral-400">
              Incluye el código de país para pedidos por WhatsApp
            </p>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="store-addr" className="text-sm font-medium text-neutral-700">
              Dirección
            </Label>
            <Input
              id="store-addr"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Av. Principal 123, Lima"
              className="h-10 rounded-lg text-sm border-neutral-200"
            />
          </div>

          <Separator className="bg-neutral-100" />

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="store-logo" className="text-sm font-medium text-neutral-700">
              URL del Logo
            </Label>
            <Input
              id="store-logo"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://ejemplo.com/logo.png"
              className="h-10 rounded-lg text-sm border-neutral-200"
            />
            <p className="text-xs text-neutral-400">
              Imagen cuadrada recomendada (PNG, JPG)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={`h-10 rounded-lg text-sm font-medium gap-2 ${
            saved
              ? 'bg-green-600 hover:bg-green-600 text-white'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              ¡Guardado!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </Button>
        {saved && (
          <span className="text-xs text-green-600 font-medium">
            Los cambios han sido guardados correctamente
          </span>
        )}
      </div>

      {/* ==================== PUSH NOTIFICATIONS SECTION ==================== */}
      <Separator className="bg-neutral-200" />

      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">Notificaciones Push</h2>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-semibold px-2 py-0 h-5 rounded-full">Premium</Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5">
              Envía notificaciones a los clientes que instalen tu app
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-neutral-600">
            Las notificaciones push se envían a los usuarios que instalaron la app y permitieron recibir alertas. Puedes enviar notificaciones de ofertas, nuevos productos, y más.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { title: '🛍️ Nueva oferta', body: '20% de descuento en toda la tienda. Solo por hoy.' },
              { title: '📦 Envío confirmado', body: 'Tu pedido fue enviado correctamente.' },
              { title: '⭐ Nuevo producto', body: 'Revisa los nuevos productos que llegaron.' },
              { title: '💰 Precio especial', body: 'Tus productos favoritos tienen descuento.' },
              { title: '🎉 Promoción', body: 'Envío gratis en pedidos mayores a S/199.' },
              { title: '🔔 Recordatorio', body: 'Tienes productos en tu carrito sin completar.' },
            ].map((notif) => (
              <button
                key={notif.title}
                onClick={async () => {
                  if (!('Notification' in window)) return
                  if (Notification.permission === 'default') {
                    await Notification.requestPermission()
                  }
                  if (Notification.permission === 'granted') {
                    new Notification(notif.title, {
                      body: notif.body,
                      icon: '/icon.svg',
                      badge: '/icon.svg',
                      tag: `admin-notif-${Date.now()}`,
                    })
                  }
                }}
                className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all text-left group"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{notif.title.charAt(0)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-700">{notif.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{notif.body}</p>
                </div>
                <Send className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ==================== PAYMENT METHODS SECTION ==================== */}
      <Separator className="bg-neutral-200" />

      {/* Payment Methods Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Métodos de Pago</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Configura los métodos de pago aceptados en tu tienda
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-6">
          {pmLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : sortedPaymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-600">No hay métodos de pago</p>
              <p className="text-xs text-neutral-400 mt-1">
                Agrega tu primer método de pago para empezar a recibir pagos
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {sortedPaymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    pm.isActive
                      ? 'bg-white border-neutral-200'
                      : 'bg-neutral-50 border-neutral-100 opacity-60'
                  }`}
                >
                  {/* Icon & Badge */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xl flex-shrink-0">
                      {getPaymentTypeIcon(pm.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 truncate">
                          {pm.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 h-5 font-medium rounded-full flex-shrink-0 ${getPaymentTypeColor(pm.type)}`}
                        >
                          {getPaymentTypeLabel(pm.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {pm.accountNumber && (
                          <span className="text-xs text-neutral-500 truncate">
                            {pm.type === 'transferencia' ? 'Cta: ' : 'Nº: '}
                            {pm.accountNumber}
                          </span>
                        )}
                        {pm.accountHolder && (
                          <span className="text-xs text-neutral-400 truncate">
                            {pm.accountHolder}
                          </span>
                        )}
                        {pm.bankName && (
                          <span className="text-xs text-neutral-400 truncate">
                            {pm.bankName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Thumbnail */}
                  {pm.qrCode && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={pm.qrCode}
                          alt="QR"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Toggle */}
                  <Switch
                    checked={pm.isActive}
                    onCheckedChange={() => handleTogglePayment(pm)}
                    className="flex-shrink-0"
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                      onClick={() => openEditDialog(pm)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeletingPayment(pm)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Payment Method */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">
                Agregar Método de Pago
              </span>
            </div>
            {showAddForm ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {showAddForm && (
            <div className="px-6 pb-6 space-y-5 border-t border-neutral-100 pt-5">
              {/* Type Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Tipo de pago</Label>
                <Select
                  value={paymentForm.type}
                  onValueChange={handlePaymentTypeChange}
                >
                  <SelectTrigger className="h-10 rounded-lg text-sm border-neutral-200 w-full">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>
                        <span className="flex items-center gap-2">
                          <span>{pt.icon}</span>
                          <span>{pt.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Nombre</Label>
                <Input
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  placeholder="Nombre del método"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">
                  {paymentForm.type === 'yape' || paymentForm.type === 'plin'
                    ? 'Número de teléfono'
                    : paymentForm.type === 'transferencia'
                      ? 'Número de cuenta'
                      : paymentForm.type === 'efectivo'
                        ? 'Referencia (opcional)'
                        : 'Número de cuenta / Referencia'}
                </Label>
                <Input
                  value={paymentForm.accountNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                  placeholder={
                    paymentForm.type === 'yape' || paymentForm.type === 'plin'
                      ? '999 888 777'
                      : paymentForm.type === 'transferencia'
                        ? '123-456-7890123'
                        : 'Número o referencia'
                  }
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>

              {/* Account Holder */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Titular de la cuenta</Label>
                <Input
                  value={paymentForm.accountHolder}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountHolder: e.target.value })}
                  placeholder="Nombre del titular"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>

              {/* Bank Name (only for transferencia) */}
              {paymentForm.type === 'transferencia' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700">Banco</Label>
                  <Input
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    placeholder="BCP, Interbank, BBVA, etc."
                    className="h-10 rounded-lg text-sm border-neutral-200"
                  />
                </div>
              )}

              {/* QR Code (only for yape/plin) */}
              {(paymentForm.type === 'yape' || paymentForm.type === 'plin') && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
                      URL del Código QR
                    </span>
                  </Label>
                  <Input
                    value={paymentForm.qrCode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, qrCode: e.target.value })}
                    placeholder="https://ejemplo.com/qr-code.png"
                    className="h-10 rounded-lg text-sm border-neutral-200"
                  />
                  <p className="text-xs text-neutral-400">
                    Sube tu código QR a una URL y pégala aquí
                  </p>
                </div>
              )}

              {/* Sort Order & Active */}
              <div className="flex items-center gap-6">
                <div className="space-y-2 flex-1">
                  <Label className="text-sm font-medium text-neutral-700">Orden</Label>
                  <Input
                    type="number"
                    min={0}
                    value={paymentForm.sortOrder}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="h-10 rounded-lg text-sm border-neutral-200 w-24"
                  />
                  <p className="text-xs text-neutral-400">Menor = aparece primero</p>
                </div>
                <div className="flex items-center gap-2.5 pt-5">
                  <Switch
                    checked={paymentForm.isActive}
                    onCheckedChange={(checked) =>
                      setPaymentForm({ ...paymentForm, isActive: checked })
                    }
                  />
                  <Label className="text-sm font-medium text-neutral-700">
                    {paymentForm.isActive ? 'Activo' : 'Inactivo'}
                  </Label>
                </div>
              </div>

              {/* Save Payment Method Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSavePaymentMethod}
                  disabled={pmSaving}
                  className={`h-10 rounded-lg text-sm font-medium gap-2 ${
                    pmSaved
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {pmSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : pmSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Guardado!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Agregar Método
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false)
                    setPaymentForm({ ...defaultPaymentForm })
                  }}
                  className="h-10 rounded-lg text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== EDIT PAYMENT METHOD DIALOG ==================== */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900">
              Editar Método de Pago
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Modifica los datos del método de pago seleccionado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Tipo de pago</Label>
              <Select
                value={editForm.type}
                onValueChange={handleEditTypeChange}
              >
                <SelectTrigger className="h-10 rounded-lg text-sm border-neutral-200 w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      <span className="flex items-center gap-2">
                        <span>{pt.icon}</span>
                        <span>{pt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Nombre</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nombre del método"
                className="h-10 rounded-lg text-sm border-neutral-200"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                {editForm.type === 'yape' || editForm.type === 'plin'
                  ? 'Número de teléfono'
                  : editForm.type === 'transferencia'
                    ? 'Número de cuenta'
                    : 'Número de cuenta / Referencia'}
              </Label>
              <Input
                value={editForm.accountNumber}
                onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                placeholder="Número o referencia"
                className="h-10 rounded-lg text-sm border-neutral-200"
              />
            </div>

            {/* Account Holder */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Titular de la cuenta</Label>
              <Input
                value={editForm.accountHolder}
                onChange={(e) => setEditForm({ ...editForm, accountHolder: e.target.value })}
                placeholder="Nombre del titular"
                className="h-10 rounded-lg text-sm border-neutral-200"
              />
            </div>

            {/* Bank Name (only for transferencia) */}
            {editForm.type === 'transferencia' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Banco</Label>
                <Input
                  value={editForm.bankName}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  placeholder="BCP, Interbank, BBVA, etc."
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
            )}

            {/* QR Code (only for yape/plin) */}
            {(editForm.type === 'yape' || editForm.type === 'plin') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" />
                    URL del Código QR
                  </span>
                </Label>
                <Input
                  value={editForm.qrCode}
                  onChange={(e) => setEditForm({ ...editForm, qrCode: e.target.value })}
                  placeholder="https://ejemplo.com/qr-code.png"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
            )}

            {/* Sort Order & Active */}
            <div className="flex items-center gap-6">
              <div className="space-y-2 flex-1">
                <Label className="text-sm font-medium text-neutral-700">Orden</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.sortOrder}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="h-10 rounded-lg text-sm border-neutral-200 w-24"
                />
              </div>
              <div className="flex items-center gap-2.5 pt-5">
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, isActive: checked })
                  }
                />
                <Label className="text-sm font-medium text-neutral-700">
                  {editForm.isActive ? 'Activo' : 'Inactivo'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditingPayment(null)}
              className="h-10 rounded-lg text-sm text-neutral-500 hover:text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePaymentMethod}
              disabled={editSaving}
              className="h-10 rounded-lg text-sm font-medium gap-2 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {editSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      <Dialog open={!!deletingPayment} onOpenChange={(open) => !open && setDeletingPayment(null)}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900">
              Eliminar Método de Pago
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              ¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingPayment && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-xl">{getPaymentTypeIcon(deletingPayment.type)}</span>
              <div>
                <p className="text-sm font-medium text-neutral-900">{deletingPayment.name}</p>
                {deletingPayment.accountNumber && (
                  <p className="text-xs text-neutral-500">{deletingPayment.accountNumber}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeletingPayment(null)}
              disabled={deleteSaving}
              className="h-10 rounded-lg text-sm text-neutral-500 hover:text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeletePayment}
              disabled={deleteSaving}
              className="h-10 rounded-lg text-sm font-medium gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
