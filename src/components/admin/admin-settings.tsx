'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Store,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <div className="max-w-2xl space-y-6">
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
    </div>
  )
}
