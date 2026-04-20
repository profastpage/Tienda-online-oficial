'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Save, Loader2, CheckCircle2, Layout, Type, Image,
  ChevronDown, ChevronUp, RefreshCw, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'

interface SectionDef {
  id: string
  label: string
  icon: React.ElementType
  fields: Array<{ key: string; label: string; type: 'text' | 'textarea' | 'json'; placeholder?: string; rows?: number }>
}

const SECTIONS: SectionDef[] = [
  {
    id: 'announcement',
    label: 'Barra de Anuncio Superior',
    icon: Sparkles,
    fields: [
      { key: 'text', label: 'Texto principal', type: 'text', placeholder: 'ENVÍO GRATIS en pedidos mayores a S/199' },
      { key: 'subtext', label: 'Texto secundario', type: 'text', placeholder: 'Pago seguro contra entrega' },
    ],
  },
  {
    id: 'hero',
    label: 'Sección Hero (Banner Principal)',
    icon: Layout,
    fields: [
      { key: 'badge', label: 'Badge (etiqueta)', type: 'text', placeholder: '🔥 Nueva Colección 2026' },
      { key: 'title1', label: 'Título línea 1', type: 'text', placeholder: 'Estilo urbano' },
      { key: 'title2', label: 'Título línea 2', type: 'text', placeholder: 'sin límites' },
      { key: 'subtitle', label: 'Subtítulo / Descripción', type: 'textarea', placeholder: 'Ofertas exclusivas...', rows: 3 },
      { key: 'btnText1', label: 'Texto botón principal', type: 'text', placeholder: 'Ver Colección' },
      { key: 'btnText2', label: 'Texto botón secundario', type: 'text', placeholder: 'Ver Ofertas' },
      { key: 'image1', label: 'URL imagen banner 1', type: 'text', placeholder: '/images/hero/banner.png' },
      { key: 'image2', label: 'URL imagen banner 2', type: 'text', placeholder: '/images/hero/banner-2.png' },
      { key: 'image3', label: 'URL imagen banner 3', type: 'text', placeholder: '/images/hero/banner-3.png' },
      { key: 'stat1Icon', label: 'Stat 1 - Emoji/Icono', type: 'text', placeholder: '⭐' },
      { key: 'stat1Value', label: 'Stat 1 - Valor', type: 'text', placeholder: '4.8/5' },
      { key: 'stat1Label', label: 'Stat 1 - Label', type: 'text', placeholder: '+200 reseñas' },
      { key: 'stat2Icon', label: 'Stat 2 - Emoji/Icono', type: 'text', placeholder: '🚚' },
      { key: 'stat2Value', label: 'Stat 2 - Valor', type: 'text', placeholder: 'Envío rápido' },
      { key: 'stat2Label', label: 'Stat 2 - Label', type: 'text', placeholder: '1-3 días hábiles' },
      { key: 'trustText1', label: 'Trust badge 1', type: 'text', placeholder: '✅ Envío gratis' },
      { key: 'trustText2', label: 'Trust badge 2', type: 'text', placeholder: '💰 Pago contra entrega' },
    ],
  },
  {
    id: 'brands',
    label: 'Marca (Marquee de marcas)',
    icon: Type,
    fields: [
      { key: 'items', label: 'Marcas (JSON array)', type: 'json', placeholder: '["MARCA1","MARCA2","MARCA3"]' },
    ],
  },
  {
    id: 'about',
    label: 'Sección "Nuestra Historia"',
    icon: Type,
    fields: [
      { key: 'badge', label: 'Badge', type: 'text', placeholder: 'Nuestra Historia' },
      { key: 'title', label: 'Título', type: 'text', placeholder: 'Mi Tienda' },
      { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Describe tu historia...', rows: 3 },
      { key: 'features', label: 'Características (JSON array)', type: 'json', placeholder: '[{"icon":"✨","text":"Calidad premium"}]' },
      { key: 'image', label: 'URL de imagen', type: 'text', placeholder: 'https://...' },
      { key: 'btnText', label: 'Texto botón', type: 'text', placeholder: 'Ver Catálogo' },
    ],
  },
  {
    id: 'features',
    label: 'Barra de Beneficios/Características',
    icon: Sparkles,
    fields: [
      { key: 'items', label: 'Features (JSON array)', type: 'json', placeholder: '[{"icon":"🚚","title":"Envío Gratis","desc":"En pedidos +S/199"}]' },
    ],
  },
  {
    id: 'offers',
    label: 'Sección de Ofertas',
    icon: Sparkles,
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: 'Ofertas' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Los mejores precios...' },
    ],
  },
  {
    id: 'categories',
    label: 'Sección de Categorías',
    icon: Type,
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: 'Explora por Categoría' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Encuentra exactamente lo que buscas' },
    ],
  },
  {
    id: 'testimonials',
    label: 'Sección de Testimonios',
    icon: Type,
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: 'Lo que dicen nuestros clientes' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Reseñas verificadas...' },
    ],
  },
  {
    id: 'newsletter',
    label: 'Sección Newsletter/Suscripción',
    icon: Type,
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: 'Recibe ofertas exclusivas' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Suscríbite y obtén un 10%...' },
      { key: 'placeholder', label: 'Placeholder del input', type: 'text', placeholder: 'tu@email.com' },
      { key: 'btnText', label: 'Texto botón', type: 'text', placeholder: 'Suscribirme' },
      { key: 'footer', label: 'Texto inferior', type: 'text', placeholder: 'Sin spam...' },
    ],
  },
  {
    id: 'stats',
    label: 'Sección de Estadísticas',
    icon: Type,
    fields: [
      { key: 'items', label: 'Stats (JSON array)', type: 'json', placeholder: '[{"value":"+120","label":"Negocios activos"}]' },
    ],
  },
  {
    id: 'cta',
    label: 'Sección Llamada a la Acción (CTA)',
    icon: Sparkles,
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: '¿Listo para encontrar tu estilo?' },
      { key: 'subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Únete a cientos...', rows: 2 },
      { key: 'btnText', label: 'Texto botón', type: 'text', placeholder: 'Ver Catálogo Completo' },
      { key: 'footer', label: 'Texto inferior', type: 'text', placeholder: 'Envío gratis desde S/199...' },
    ],
  },
  {
    id: 'footer',
    label: 'Pie de Página (Footer)',
    icon: Type,
    fields: [
      { key: 'shopLinks', label: 'Links tienda (JSON array)', type: 'json', placeholder: '["Polos","Hoodies","Pantalones"]' },
      { key: 'helpLinks', label: 'Links ayuda (JSON array)', type: 'json', placeholder: '["FAQ","Contacto","Términos"]' },
      { key: 'contactAddress', label: 'Dirección', type: 'text', placeholder: '📍 Lima, Perú' },
      { key: 'contactPhone', label: 'Teléfono', type: 'text', placeholder: '📞 +51 999 888 777' },
      { key: 'contactWhatsapp', label: 'WhatsApp', type: 'text', placeholder: '💬 WhatsApp 24/7' },
      { key: 'contactHours', label: 'Horario', type: 'text', placeholder: '🕐 Lun-Sáb: 9am-8pm' },
      { key: 'copyright', label: 'Copyright', type: 'text', placeholder: '© 2026 Mi Tienda...' },
      { key: 'creditsText', label: 'Texto créditos', type: 'text', placeholder: 'Creado y desarrollado por Tienda Online' },
      { key: 'creditsUrl', label: 'URL créditos', type: 'text', placeholder: 'https://...' },
    ],
  },
]

export function AdminContent() {
  const user = useAuthStore((s) => s.user)
  const storeId = user?.storeId || ''
  const { toast } = useToast()
  
  const [content, setContent] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())

  const fetchContent = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/admin/store-content', {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data || {})
      }
    } catch (err) {
      console.error('[AdminContent] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => { fetchContent() }, [fetchContent])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  const updateField = (section: string, key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }))
    setChangedFields(prev => {
      const next = new Set(prev)
      next.add(`${section}.${key}`)
      return next
    })
  }

  const handleSave = async () => {
    if (!storeId) return
    setSaving(true)
    setSaved(false)
    try {
      const { token } = useAuthStore.getState()
      const items: Array<{ section: string; key: string; value: string }> = []
      
      for (const [section, keys] of Object.entries(content)) {
        for (const [key, value] of Object.entries(keys)) {
          items.push({ section, key, value })
        }
      }

      const res = await fetch('/api/admin/store-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ items }),
      })

      if (res.ok) {
        setSaved(true)
        setChangedFields(new Set())
        toast({ title: 'Contenido guardado', description: 'Todos los cambios se aplicaron correctamente. Se reflejarán en tu tienda pública.' })
        setTimeout(() => setSaved(false), 5000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminContent] save error:', err)
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const totalChanged = changedFields.size

  if (loading) {
    return (
      <div className="w-full max-w-3xl space-y-4">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="h-64 w-full bg-neutral-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Contenido de la Tienda</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Personaliza todas las secciones de tu tienda pública: Hero, Testimonios, FAQ, Footer, emojis y más.
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Los cambios se reflejan inmediatamente en la tienda pública.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || totalChanged === 0}
          className={`h-10 rounded-lg text-sm font-medium gap-2 ${
            saved
              ? 'bg-green-600 hover:bg-green-600 text-white'
              : totalChanged > 0
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                : 'bg-neutral-200 text-neutral-400'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> ¡Guardado!</>
          ) : (
            <><Save className="w-4 h-4" /> Guardar Todo</>
          )}
        </Button>
        {totalChanged > 0 && !saving && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            {totalChanged} cambio{totalChanged > 1 ? 's' : ''}
          </Badge>
        )}
        <Button variant="outline" size="sm" onClick={fetchContent} className="gap-1.5 ml-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Recargar
        </Button>
      </div>

      <Separator />

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.id)
          const sectionFields = section.fields
          const sectionChangedCount = sectionFields.filter(f => changedFields.has(`${section.id}.${f.key}`)).length
          const Icon = section.icon

          return (
            <Card key={section.id} className="rounded-xl border-neutral-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{section.label}</p>
                    <p className="text-[10px] text-neutral-400">{sectionFields.length} campos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sectionChangedCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5">{sectionChangedCount}</Badge>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-4 border-t border-neutral-100">
                  {sectionFields.map((field) => {
                    const currentValue = content?.[section.id]?.[field.key] || ''
                    
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                          {field.label}
                          {currentValue && changedFields.has(`${section.id}.${field.key}`) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            value={currentValue}
                            onChange={(e) => updateField(section.id, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={field.rows || 3}
                            className="rounded-lg text-sm border-neutral-200 resize-none"
                          />
                        ) : (
                          <Input
                            value={currentValue}
                            onChange={(e) => updateField(section.id, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="h-9 rounded-lg text-sm border-neutral-200"
                          />
                        )}
                        {field.type === 'json' && (
                          <p className="text-[10px] text-neutral-400">
                            Formato JSON array. Los emojis se soportan al 100%.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Bottom Save */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving || totalChanged === 0}
          className={`h-10 rounded-lg text-sm font-medium gap-2 w-full sm:w-auto ${
            saved
              ? 'bg-green-600 hover:bg-green-600 text-white'
              : totalChanged > 0
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                : 'bg-neutral-200 text-neutral-400'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> ¡Guardado!</>
          ) : (
            <><Save className="w-4 h-4" /> Guardar Todos los Cambios</>
          )}
        </Button>
      </div>
    </div>
  )
}
