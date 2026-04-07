'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, User, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'

interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
}

export function CustomerProfile() {
  const user = useAuthStore((s) => s.user)
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/customer/profile?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
          })
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    if (!profile.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es obligatorio.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        }),
      })
      if (res.ok) {
        const updatedUser = await res.json()
        setUser({
          ...user,
          name: updatedUser.name,
          phone: updatedUser.phone,
          address: updatedUser.address,
        })
        toast({
          title: 'Perfil actualizado',
          description: 'Tu información se ha guardado correctamente.',
        })
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar los cambios.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Hubo un error al guardar.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-6 space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-neutral-900">Mi Perfil</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Gestiona tu información personal y datos de envío.
        </p>
      </motion.div>

      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="rounded-xl border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {profile.name.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {profile.name || 'Sin nombre'}
                </h3>
                <p className="text-sm text-neutral-400">{profile.email}</p>
                <p className="text-xs text-neutral-300 mt-1 capitalize">Cliente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="rounded-xl border-neutral-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-neutral-900">
              Información Personal
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Actualiza tus datos. Tu email no puede ser cambiado.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                  <User className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-neutral-400" />
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  placeholder="Tu nombre completo"
                  className="h-10 rounded-xl border-neutral-200 bg-white text-sm"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  <Mail className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-neutral-400" />
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-10 rounded-xl border-neutral-200 bg-neutral-50 text-sm text-neutral-500 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-400">El correo no puede ser modificado.</p>
              </div>

              <Separator />

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-neutral-700">
                  <Phone className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-neutral-400" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  placeholder="+51 999 888 777"
                  className="h-10 rounded-xl border-neutral-200 bg-white text-sm"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-neutral-700">
                  <MapPin className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-neutral-400" />
                  Dirección de envío
                </Label>
                <Textarea
                  id="address"
                  placeholder="Av. Principal 123, Lima, Perú"
                  className="rounded-xl border-neutral-200 bg-white text-sm min-h-[80px] resize-none"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              {/* Save button */}
              <div className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl h-10 px-6 text-sm font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
