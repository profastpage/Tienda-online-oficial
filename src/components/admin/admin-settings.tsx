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
  ShieldCheck,
  Camera,
  User,
  Phone,
  Link,
  Image,
  Globe,
  AlertTriangle,
  Copy,
  Info,
  Palette,
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
import TwoFactorSettings from '@/components/two-factor-settings'
import { ImageUpload } from '@/components/image-upload'
import { useToast } from '@/hooks/use-toast'

interface StoreData {
  id: string
  name: string
  description: string
  whatsappNumber: string
  address: string
  logo: string
  slug: string
  plan: string
  customDomain: string | null
  domainVerified: boolean
  domainVerifiedAt: string | null
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  customCSS?: string
  favicon?: string
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
    primaryColor: '#171717',
    secondaryColor: '#fafafa',
    accentColor: '#171717',
    fontFamily: 'system-ui',
    customCSS: '',
    favicon: '',
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

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Profile state
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    avatar: '',
  })
  const { toast } = useToast()
  const { setUser } = useAuthStore()

  // Store logo toggle state
  const [showLogoUrlInput, setShowLogoUrlInput] = useState(false)

  // Custom domain state
  const [domainInput, setDomainInput] = useState('')
  const [domainSaving, setDomainSaving] = useState(false)
  const [domainSaved, setDomainSaved] = useState(false)
  const [domainLoading, setDomainLoading] = useState(true)
  const [domainConfig, setDomainConfig] = useState<{
    customDomain: string | null
    domainVerified: boolean
    domainVerifiedAt: string | null
    plan: string
  } | null>(null)
  const [domainRemoving, setDomainRemoving] = useState(false)

  useEffect(() => {
    if (!storeId) return
    async function fetchStore() {
      try {
        const { token } = useAuthStore.getState()
        const res = await fetch(`/api/admin/settings?storeId=${storeId}`, {
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        })
        if (res.ok) {
          const data = await res.json()
          setStore(data)
          setForm({
            name: data.name || '',
            description: data.description || '',
            whatsappNumber: data.whatsappNumber || '',
            address: data.address || '',
            logo: data.logo || '',
            primaryColor: data.primaryColor || '#171717',
            secondaryColor: data.secondaryColor || '#fafafa',
            accentColor: data.accentColor || '#171717',
            fontFamily: data.fontFamily || 'system-ui',
            customCSS: data.customCSS || '',
            favicon: data.favicon || '',
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
      const { token } = useAuthStore.getState()
      const res = await fetch(`/api/admin/payment-methods?storeId=${storeId}`, {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      })
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

  useEffect(() => {
    if (!user) return
    async function fetchUser2FA() {
      try {
        const { token } = useAuthStore.getState()
        const res = await fetch(`/api/auth/me?userId=${user.id}`, {
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        })
        if (res.ok) {
          const data = await res.json()
          setTwoFactorEnabled(data.twoFactorEnabled || false)
        }
      } catch { /* silent */ }
    }
    fetchUser2FA()
  }, [user])

  // Fetch admin profile data
  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
    })
  }, [user])

  // Fetch custom domain config
  useEffect(() => {
    if (!storeId) return
    async function fetchDomainConfig() {
      setDomainLoading(true)
      try {
        const { token } = useAuthStore.getState()
        const res = await fetch(`/api/admin/domain?storeId=${storeId}`, {
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        })
        if (res.ok) {
          const data = await res.json()
          setDomainConfig(data)
          if (data.customDomain) {
            setDomainInput(data.customDomain)
          }
        }
      } catch {
        // silent
      } finally {
        setDomainLoading(false)
      }
    }
    fetchDomainConfig()
  }, [storeId])

  const handleSaveDomain = async () => {
    if (!storeId || !domainInput.trim()) {
      toast({ title: 'Error', description: 'Ingresa un dominio válido.', variant: 'destructive' })
      return
    }
    setDomainSaving(true)
    setDomainSaved(false)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/admin/domain', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ domain: domainInput.trim(), storeId }),
      })
      if (res.ok) {
        const data = await res.json()
        setDomainConfig({
          customDomain: data.customDomain,
          domainVerified: data.domainVerified,
          domainVerifiedAt: null,
          plan: domainConfig?.plan || store?.plan || 'basico',
        })
        setDomainSaved(true)
        toast({
          title: 'Dominio configurado',
          description: data.message || `Dominio ${data.customDomain} guardado correctamente.`,
        })
        setTimeout(() => setDomainSaved(false), 4000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar el dominio', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setDomainSaving(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!storeId) return
    setDomainRemoving(true)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch(`/api/admin/domain?storeId=${storeId}`, {
        method: 'DELETE',
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      })
      if (res.ok) {
        setDomainConfig(prev => prev ? { ...prev, customDomain: null, domainVerified: false, domainVerifiedAt: null } : null)
        setDomainInput('')
        setDomainSaved(false)
        toast({ title: 'Dominio eliminado', description: 'El dominio personalizado ha sido eliminado.' })
      } else {
        toast({ title: 'Error', description: 'No se pudo eliminar el dominio', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setDomainRemoving(false)
    }
  }

  const handleCopyCname = () => {
    navigator.clipboard.writeText('cname.tiendaonlineoficial.com')
    toast({ title: 'Copiado', description: 'CNAME copiado al portapapeles.' })
  }

  const handleSaveProfile = async () => {
    if (!user) return
    if (!profileForm.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es obligatorio.',
        variant: 'destructive',
      })
      return
    }
    setProfileSaving(true)
    setProfileSaved(false)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: user.id,
          name: profileForm.name,
          phone: profileForm.phone,
          avatar: profileForm.avatar,
        }),
      })
      if (res.ok) {
        const updatedUser = await res.json()
        setUser({
          ...user,
          name: updatedUser.name,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
        })
        setProfileSaved(true)
        toast({
          title: 'Perfil actualizado',
          description: 'Tu información personal se ha guardado correctamente.',
        })
        setTimeout(() => setProfileSaved(false), 3000)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el perfil.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Hubo un error al guardar el perfil.',
        variant: 'destructive',
      })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSave = async () => {
    if (!storeId) return
    setSaving(true)
    setSaved(false)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
        toast({ title: 'Tienda actualizada' })
        setTimeout(() => setSaved(false), 3000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminSettings] saveStore error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
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
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
        toast({ title: 'Metodo de pago agregado' })
        setTimeout(() => setPmSaved(false), 3000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminSettings] savePaymentMethod error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
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
      const { token } = useAuthStore.getState()
      const res = await fetch(`/api/admin/payment-methods/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setEditingPayment(null)
        await fetchPaymentMethods()
        toast({ title: 'Metodo de pago actualizado' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo actualizar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminSettings] updatePaymentMethod error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  // Toggle payment method active status
  const handleTogglePayment = async (pm: PaymentMethod) => {
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch(`/api/admin/payment-methods/${pm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...pm, isActive: !pm.isActive }),
      })
      if (res.ok) {
        await fetchPaymentMethods()
      }
    } catch (err) {
      console.error('[AdminSettings] togglePayment error:', err)
      toast({ title: 'Error', description: 'No se pudo cambiar estado', variant: 'destructive' })
    }
  }

  // Delete payment method
  const handleDeletePayment = async () => {
    if (!deletingPayment) return
    setDeleteSaving(true)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch(`/api/admin/payment-methods/${deletingPayment.id}`, {
        method: 'DELETE',
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      })
      if (res.ok) {
        setDeletingPayment(null)
        await fetchPaymentMethods()
        toast({ title: 'Metodo de pago eliminado' })
      } else {
        toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminSettings] deletePayment error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setDeleteSaving(false)
    }
  }

  // Sort payment methods by sortOrder
  const sortedPaymentMethods = [...paymentMethods].sort((a, b) => a.sortOrder - b.sortOrder)

  if (loading) {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-32" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Configuración</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Administra tu perfil y la información de tu tienda
        </p>
      </div>

      {/* ==================== MY PROFILE SECTION ==================== */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Mi Perfil</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Tu información personal
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Avatar with hover overlay - stacks on mobile, horizontal on sm+ */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-200 bg-neutral-100 transition-all duration-300 group-hover:border-neutral-400 group-hover:shadow-md flex-shrink-0">
                {profileForm.avatar ? (
                  <img
                    key={profileForm.avatar}
                    src={profileForm.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover !aspect-square animate-in fade-in duration-300"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {profileForm.name.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
                {/* Hover camera overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (!file) return
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('folder', 'avatars')
                      formData.append('storeSlug', user?.storeSlug || 'store')
                      const { token } = useAuthStore.getState()
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
                      })
                      if (res.ok) {
                        const data = await res.json()
                        setProfileForm({ ...profileForm, avatar: data.url })
                      } else {
                        const errData = await res.json().catch(() => ({ error: 'Error de autenticación' }))
                        toast({ title: 'Error al subir', description: errData.error || 'No se pudo subir la imagen', variant: 'destructive' })
                      }
                    }
                    input.click()
                  }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/jpeg,image/png,image/webp,image/gif'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('folder', 'avatars')
                    formData.append('storeSlug', user?.storeSlug || 'store')
                    const { token } = useAuthStore.getState()
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
                    })
                    if (res.ok) {
                      const data = await res.json()
                      setProfileForm({ ...profileForm, avatar: data.url })
                    } else {
                      const errData = await res.json().catch(() => ({ error: 'Error de autenticación' }))
                      toast({ title: 'Error al subir', description: errData.error || 'No se pudo subir la imagen', variant: 'destructive' })
                    }
                  }
                  input.click()
                }}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-sm border-2 border-white"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">
                  {profileForm.name || 'Sin nombre'}
                </h3>
                {/* Online status indicator (cosmetic) */}
                <span className="relative flex h-2.5 w-2.5" title="Activo ahora">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              </div>
              <p className="text-sm text-neutral-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-neutral-300 capitalize">{user?.role === 'admin' ? 'Administrador' : user?.role}</p>
                <span className="text-[10px] text-green-600 font-medium">Activo ahora</span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <p className="text-xs font-medium text-neutral-500 mb-2">Cambiar foto de perfil</p>
            <div className="w-full max-w-xs sm:max-w-sm">
              <ImageUpload
                value={profileForm.avatar}
                onChange={(url) => setProfileForm({ ...profileForm, avatar: url })}
                storeSlug={user?.storeSlug || 'store'}
                folder="avatars"
                aspectRatio="aspect-square"
                label="Sube tu foto de perfil"
              />
            </div>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">
              <User className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-neutral-400" />
              Nombre completo
            </Label>
            <Input
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Tu nombre"
              className="h-10 rounded-lg text-sm border-neutral-200 w-full"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Correo electrónico</Label>
            <Input
              value={user?.email || ''}
              disabled
              className="h-10 rounded-lg text-sm border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed w-full"
            />
            <p className="text-xs text-neutral-400">El correo no puede ser modificado.</p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">
              <Phone className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-neutral-400" />
              Teléfono
            </Label>
            <Input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="+51 999 888 777"
              className="h-10 rounded-lg text-sm border-neutral-200 w-full"
            />
          </div>

          {/* Save profile button - full width on mobile */}
          <div className="flex items-center gap-3 pt-2 w-full">
            <Button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className={`h-10 rounded-lg text-sm font-medium gap-2 w-full sm:w-auto ${
                profileSaved
                  ? 'bg-green-600 hover:bg-green-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {profileSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : profileSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Perfil
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ==================== STORE SETTINGS SECTION ==================== */}
      <Separator className="bg-neutral-200" />

      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center">
            <Store className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Configuración de la Tienda</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Administra la información general de tu tienda
            </p>
          </div>
        </div>
      </div>

      {/* Logo preview */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-4 sm:p-6">
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
        <CardContent className="p-4 sm:p-6 space-y-6">
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
              className="h-10 rounded-lg text-sm border-neutral-200 w-full"
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
              className="rounded-lg text-sm border-neutral-200 resize-none w-full"
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
              className="h-10 rounded-lg text-sm border-neutral-200 w-full"
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
              className="h-10 rounded-lg text-sm border-neutral-200 w-full"
            />
          </div>

          <Separator className="bg-neutral-100" />

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="store-logo" className="text-sm font-medium text-neutral-700">
              Logo de la Tienda
            </Label>
            <ImageUpload
              value={form.logo}
              onChange={(url) => setForm({ ...form, logo: url })}
              storeSlug={user?.storeSlug || 'store'}
              folder="store-logos"
            />
            <p className="text-xs text-neutral-400">
              Imagen cuadrada recomendada (PNG, JPG). Máximo 5MB.
            </p>
            <button
              type="button"
              onClick={() => setShowLogoUrlInput(!showLogoUrlInput)}
              className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1 mt-1"
            >
              <Link className="w-3 h-3" />
              {showLogoUrlInput ? 'Ocultar entrada manual' : 'O ingresa URL manualmente'}
            </button>
            {showLogoUrlInput && (
              <div className="mt-2">
                <Input
                  id="store-logo-url"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save button - full width on mobile */}
      <div className="flex items-center gap-3 w-full">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={`h-10 rounded-lg text-sm font-medium gap-2 w-full sm:w-auto ${
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

      {/* ==================== STORE APPEARANCE / THEME SECTION ==================== */}
      <Separator className="bg-neutral-200" />

      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
            <Palette className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Apariencia de la Tienda</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Personaliza los colores, fuente y estilo visual de tu tienda
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Color Principal</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                  />
                </div>
                <Input
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  placeholder="#171717"
                  className="h-10 rounded-lg text-sm border-neutral-200 font-mono flex-1"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-neutral-400">Títulos, botones principales, nav</p>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Color Secundario</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                  />
                </div>
                <Input
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  placeholder="#fafafa"
                  className="h-10 rounded-lg text-sm border-neutral-200 font-mono flex-1"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-neutral-400">Fondos, secciones claras</p>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Color de Acento</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                  />
                </div>
                <Input
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  placeholder="#171717"
                  className="h-10 rounded-lg text-sm border-neutral-200 font-mono flex-1"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-neutral-400">Botones CTA, enlaces destacados</p>
            </div>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Font Family Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Tipografía</Label>
            <Select
              value={form.fontFamily}
              onValueChange={(value) => setForm({ ...form, fontFamily: value })}
            >
              <SelectTrigger className="h-10 rounded-lg text-sm border-neutral-200 w-full sm:w-64">
                <SelectValue placeholder="Selecciona una fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system-ui">
                  <span style={{ fontFamily: 'system-ui' }}>System Default</span>
                </SelectItem>
                <SelectItem value="Inter">
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Inter (Moderna)</span>
                </SelectItem>
                <SelectItem value="Playfair Display">
                  <span style={{ fontFamily: '"Playfair Display", serif' }}>Playfair Display (Elegante)</span>
                </SelectItem>
                <SelectItem value="Poppins">
                  <span style={{ fontFamily: 'Poppins, sans-serif' }}>Poppins (Amigable)</span>
                </SelectItem>
                <SelectItem value="Montserrat">
                  <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat (Limpia)</span>
                </SelectItem>
                <SelectItem value="Roboto">
                  <span style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto (Profesional)</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-400">La fuente se aplicará a toda tu tienda</p>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Favicon URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">
              Favicon (URL)
            </Label>
            <Input
              value={form.favicon}
              onChange={(e) => setForm({ ...form, favicon: e.target.value })}
              placeholder="https://ejemplo.com/favicon.ico"
              className="h-10 rounded-lg text-sm border-neutral-200 w-full"
            />
            <p className="text-xs text-neutral-400">
              URL del ícono que aparece en la pestaña del navegador (PNG, ICO, 32x32px)
            </p>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Vista Previa</Label>
            <div
              className="rounded-xl border border-neutral-200 overflow-hidden"
              style={{ fontFamily: form.fontFamily === 'system-ui' ? undefined : `${form.fontFamily}, sans-serif` }}
            >
              {/* Preview Header */}
              <div className="flex items-center gap-3 p-4" style={{ backgroundColor: form.primaryColor }}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">Mi Tienda</span>
              </div>
              {/* Preview Body */}
              <div className="p-4 space-y-3" style={{ backgroundColor: form.secondaryColor }}>
                <div className="h-3 rounded-full bg-neutral-200 w-3/4" />
                <div className="h-3 rounded-full bg-neutral-200 w-1/2" />
                <div className="flex gap-2 pt-1">
                  <div
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: form.accentColor }}
                  >
                    Comprar Ahora
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-xs font-medium border"
                    style={{
                      borderColor: form.primaryColor,
                      color: form.primaryColor,
                    }}
                  >
                    Ver Catálogo
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-100" />

          {/* Custom CSS (Premium only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-neutral-700">CSS Personalizado</Label>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] font-semibold px-2 py-0 h-5 rounded-full">Premium</Badge>
            </div>
            <Textarea
              value={form.customCSS}
              onChange={(e) => setForm({ ...form, customCSS: e.target.value })}
              placeholder=".mi-clase { color: red; }"
              rows={4}
              className="rounded-lg text-sm border-neutral-200 font-mono resize-none w-full"
            />
            <p className="text-xs text-neutral-400">
              Código CSS avanzado para personalizar aún más tu tienda
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ==================== CUSTOM DOMAIN SECTION ==================== */}
      <Separator className="bg-neutral-200" />

      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">Dominio Personalizado</h2>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] font-semibold px-2 py-0 h-5 rounded-full">Empresarial</Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5">
              Conecta tu propio dominio a tu tienda online
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Plan check */}
          {domainConfig && domainConfig.plan !== 'empresarial' ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
              <AlertTriangle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900">Plan Empresarial requerido</p>
                <p className="text-xs text-purple-700 mt-1">
                  El dominio personalizado está disponible únicamente en el plan Empresarial. 
                  Actualiza tu plan para habilitar esta función.
                </p>
              </div>
            </div>
          ) : domainLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Current domain status */}
              {domainConfig?.customDomain && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex-shrink-0">
                    {domainConfig.domainVerified ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {domainConfig.customDomain}
                    </p>
                    <p className={`text-xs mt-0.5 ${domainConfig.domainVerified ? 'text-green-600' : 'text-amber-600'}`}>
                      {domainConfig.domainVerified
                        ? 'Dominio verificado y activo'
                        : 'Pendiente de verificación DNS'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveDomain}
                    disabled={domainRemoving}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs flex-shrink-0"
                  >
                    {domainRemoving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    Eliminar
                  </Button>
                </div>
              )}

              {/* Domain input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">
                  Tu dominio personalizado
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="www.mitienda.com"
                    className="h-10 rounded-lg text-sm border-neutral-200 flex-1 font-mono"
                    disabled={domainSaving}
                  />
                  <Button
                    onClick={handleSaveDomain}
                    disabled={domainSaving || !domainInput.trim()}
                    className={`h-10 rounded-lg text-sm font-medium gap-2 px-4 flex-shrink-0 ${
                      domainSaved
                        ? 'bg-green-600 hover:bg-green-600 text-white'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {domainSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : domainSaved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {domainSaved ? '¡Guardado!' : domainSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
                <p className="text-xs text-neutral-400">
                  Ingresa solo el dominio (ej: www.mitienda.com). No incluyas http:// ni /
                </p>
              </div>

              <Separator className="bg-neutral-100" />

              {/* DNS setup instructions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-neutral-500" />
                  <p className="text-sm font-semibold text-neutral-900">Instrucciones de configuración DNS</p>
                </div>
                <ol className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: 'Ingresar tu dominio',
                      desc: 'Escribe tu dominio personalizado en el campo de arriba (ej: www.mitienda.com)',
                    },
                    {
                      step: 2,
                      title: 'Crear registro CNAME',
                      desc: 'En la configuración DNS de tu dominio, crea un registro CNAME apuntando a:',
                      highlight: 'cname.tiendaonlineoficial.com',
                      copyable: true,
                    },
                    {
                      step: 3,
                      title: 'Esperar propagación DNS',
                      desc: 'La propagación puede tomar hasta 48 horas, aunque generalmente es mucho más rápida.',
                    },
                    {
                      step: 4,
                      title: 'Verificación automática',
                      desc: 'Una vez que el DNS esté propagado, el dominio se verificará automáticamente y tu tienda será accesible desde él.',
                    },
                  ].map((item) => (
                    <li key={item.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                        {item.highlight && (
                          <button
                            type="button"
                            onClick={handleCopyCname}
                            className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors group cursor-pointer"
                          >
                            <code className="text-xs font-mono font-medium text-neutral-800">{item.highlight}</code>
                            <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
        <CardContent className="p-4 sm:p-6 space-y-4">
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
        <CardContent className="p-4 sm:p-6">
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
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border transition-colors ${
                    pm.isActive
                      ? 'bg-white border-neutral-200'
                      : 'bg-neutral-50 border-neutral-100 opacity-60'
                  }`}
                >
                  {/* Icon, Badge & Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 w-full">
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
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
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

                  {/* Actions row: QR, toggle, edit/delete */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-shrink-0 mt-1 sm:mt-0">
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
                      className="flex-shrink-0 ml-auto"
                    />

                    {/* Edit/Delete */}
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

      {/* ==================== TWO-FACTOR AUTHENTICATION SECTION ==================== */}
      <Separator className="bg-neutral-200" />

      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Seguridad de la Cuenta</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Autenticación en dos pasos (Google Authenticator)
            </p>
          </div>
        </div>
      </div>

      <TwoFactorSettings twoFactorEnabled={twoFactorEnabled} onStatusChange={setTwoFactorEnabled} />

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
