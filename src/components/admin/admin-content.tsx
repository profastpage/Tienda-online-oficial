'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Save, Loader2, CheckCircle2, Layout, Type, Image,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, Plus, Trash2, GripVertical, Star, MessageSquareQuote
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

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface SectionDef {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

interface SimpleField {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'textarea'
  rows?: number
}

// ═══════════════════════════════════════════════════
// Visual Sub-Editors
// ═══════════════════════════════════════════════════

function StringListEditor({
  value,
  onChange,
  itemLabel,
  itemPlaceholder,
}: {
  value: string
  onChange: (v: string) => void
  itemLabel: string
  itemPlaceholder: string
}) {
  let items: string[] = []
  try { items = JSON.parse(value || '[]') } catch { items = value ? [value] : [] }

  const update = (newItems: string[]) => {
    onChange(JSON.stringify(newItems.filter(Boolean)))
  }

  const addItem = () => {
    update([...items, ''])
  }
  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, val: string) => {
    const next = [...items]
    next[idx] = val
    update(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{itemLabel}</span>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-neutral-300 shrink-0" />
          <Input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={itemPlaceholder}
            className="h-9 rounded-lg text-sm border-neutral-200"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-3 bg-neutral-50 rounded-lg">
          Sin elementos. Haz clic en &quot;Agregar&quot; para empezar.
        </p>
      )}
    </div>
  )
}

function IconTextListEditor({
  value,
  onChange,
  itemLabel,
  textPlaceholder,
}: {
  value: string
  onChange: (v: string) => void
  itemLabel: string
  textPlaceholder: string
}) {
  let items: Array<{ icon: string; text: string }> = []
  try { items = JSON.parse(value || '[]') } catch { items = [] }

  const update = (newItems: Array<{ icon: string; text: string }>) => {
    onChange(JSON.stringify(newItems))
  }

  const addItem = () => {
    update([...items, { icon: '✨', text: '' }])
  }
  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, field: 'icon' | 'text', val: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: val }
    update(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{itemLabel}</span>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
          <Input
            value={item.icon}
            onChange={(e) => updateItem(idx, 'icon', e.target.value)}
            placeholder="Emoji"
            className="h-9 w-16 rounded-lg text-sm text-center border-neutral-200 shrink-0"
          />
          <Input
            value={item.text}
            onChange={(e) => updateItem(idx, 'text', e.target.value)}
            placeholder={textPlaceholder}
            className="h-9 rounded-lg text-sm border-neutral-200 flex-1"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-3 bg-neutral-50 rounded-lg">
          Sin elementos. Haz clic en &quot;Agregar&quot; para empezar.
        </p>
      )}
    </div>
  )
}

function FeatureCardEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  let items: Array<{ icon: string; title: string; desc: string }> = []
  try { items = JSON.parse(value || '[]') } catch { items = [] }

  const update = (newItems: Array<{ icon: string; title: string; desc: string }>) => {
    onChange(JSON.stringify(newItems))
  }

  const addItem = () => {
    update([...items, { icon: '🚚', title: '', desc: '' }])
  }
  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, field: 'icon' | 'title' | 'desc', val: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: val }
    update(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Tarjetas de caracteristicas</span>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-medium">#{idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-7 w-7 shrink-0 text-neutral-400 hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={item.icon}
              onChange={(e) => updateItem(idx, 'icon', e.target.value)}
              placeholder="Emoji"
              className="h-9 w-16 rounded-lg text-sm text-center border-neutral-200 shrink-0"
            />
            <Input
              value={item.title}
              onChange={(e) => updateItem(idx, 'title', e.target.value)}
              placeholder="Titulo"
              className="h-9 rounded-lg text-sm border-neutral-200 flex-1"
            />
          </div>
          <Input
            value={item.desc}
            onChange={(e) => updateItem(idx, 'desc', e.target.value)}
            placeholder="Descripcion breve"
            className="h-9 rounded-lg text-sm border-neutral-200"
          />
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-3 bg-neutral-50 rounded-lg">
          Sin caracteristicas. Haz clic en &quot;Agregar&quot; para empezar.
        </p>
      )}
    </div>
  )
}

function StatCardEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  let items: Array<{ value: string; label: string }> = []
  try { items = JSON.parse(value || '[]') } catch { items = [] }

  const update = (newItems: Array<{ value: string; label: string }>) => {
    onChange(JSON.stringify(newItems))
  }

  const addItem = () => {
    update([...items, { value: '', label: '' }])
  }
  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, field: 'value' | 'label', val: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: val }
    update(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Estadisticas</span>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
          <Input
            value={item.value}
            onChange={(e) => updateItem(idx, 'value', e.target.value)}
            placeholder="+120"
            className="h-9 w-28 rounded-lg text-sm text-center font-bold border-neutral-200 shrink-0"
          />
          <Input
            value={item.label}
            onChange={(e) => updateItem(idx, 'label', e.target.value)}
            placeholder="Descripcion"
            className="h-9 rounded-lg text-sm border-neutral-200 flex-1"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-3 bg-neutral-50 rounded-lg">
          Sin estadisticas. Haz clic en &quot;Agregar&quot; para empezar.
        </p>
      )}
    </div>
  )
}

function FaqEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  let items: Array<{ q: string; a: string }> = []
  try { items = JSON.parse(value || '[]') } catch { items = [] }

  const update = (newItems: Array<{ q: string; a: string }>) => {
    onChange(JSON.stringify(newItems))
  }

  const addItem = () => {
    update([...items, { q: '', a: '' }])
  }
  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, field: 'q' | 'a', val: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: val }
    update(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Preguntas y respuestas</span>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar pregunta
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-medium">Pregunta #{idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-7 w-7 shrink-0 text-neutral-400 hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Input
            value={item.q}
            onChange={(e) => updateItem(idx, 'q', e.target.value)}
            placeholder="Escribe aqui la pregunta..."
            className="h-9 rounded-lg text-sm border-neutral-200 font-medium"
          />
          <Textarea
            value={item.a}
            onChange={(e) => updateItem(idx, 'a', e.target.value)}
            placeholder="Escribe aqui la respuesta..."
            rows={2}
            className="rounded-lg text-sm border-neutral-200 resize-none"
          />
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-3 bg-neutral-50 rounded-lg">
          Sin preguntas. Haz clic en &quot;Agregar pregunta&quot; para empezar.
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Testimonial Visual Editor (uses separate Testimonial table)
// ═══════════════════════════════════════════════════

interface TestimonialItem {
  id?: string
  name: string
  role: string
  content: string
  rating: number
  _isNew?: boolean
}

function TestimonialsEditor({ storeId }: { storeId: string }) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // 'all' | testimonial id
  const { toast } = useToast()

  const fetchTestimonials = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/admin/testimonials', {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      })
      if (res.ok) {
        const data = await res.json()
        setTestimonials(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('[TestimonialsEditor] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => { fetchTestimonials() }, [fetchTestimonials])

  const addItem = () => {
    setTestimonials(prev => [...prev, { name: '', role: '', content: '', rating: 5, _isNew: true }])
  }

  const removeItem = (idx: number) => {
    const item = testimonials[idx]
    if (item.id && !item._isNew) {
      // Delete from DB
      const { token } = useAuthStore.getState()
      fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({}),
      }).then(res => {
        if (res.ok) {
          setTestimonials(prev => prev.filter((_, i) => i !== idx))
          toast({ title: 'Testimonio eliminado', duration: 1500 })
        }
      })
    } else {
      setTestimonials(prev => prev.filter((_, i) => i !== idx))
    }
  }

  const updateItem = (idx: number, field: keyof TestimonialItem, val: string | number) => {
    setTestimonials(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: val }
      return next
    })
  }

  const saveItem = async (idx: number) => {
    const item = testimonials[idx]
    if (!item.name || !item.content) {
      toast({ title: 'Completa nombre y contenido', variant: 'destructive' })
      return
    }
    setSaving(item.id || `new_${idx}`)
    try {
      const { token } = useAuthStore.getState()
      const method = item._isNew || !item.id ? 'POST' : 'PUT'
      const body = item._isNew || !item.id
        ? { name: item.name, role: item.role, content: item.content, rating: item.rating }
        : { id: item.id, name: item.name, role: item.role, content: item.content, rating: item.rating }
      const res = await fetch('/api/admin/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id) {
          setTestimonials(prev => {
            const next = [...prev]
            next[idx] = { ...next[idx], id: data.id, _isNew: false }
            return next
          })
        }
        toast({ title: 'Testimonio guardado', duration: 1500 })
      } else {
        toast({ title: 'Error al guardar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de conexion', variant: 'destructive' })
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-8 w-40 bg-neutral-200 rounded animate-pulse" />
        <div className="h-24 w-full bg-neutral-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Testimonios de clientes ({testimonials.length})</span>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar testimonio
        </Button>
      </div>
      {testimonials.map((item, idx) => (
        <div key={item.id || `new_${idx}`} className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-medium">
              #{idx + 1} {item._isNew ? '(nuevo)' : ''}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => saveItem(idx)}
                disabled={saving === (item.id || `new_${idx}`)}
                className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {saving === (item.id || `new_${idx}`) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Guardar
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-7 w-7 text-neutral-400 hover:text-red-500">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={item.name}
              onChange={(e) => updateItem(idx, 'name', e.target.value)}
              placeholder="Nombre del cliente"
              className="h-9 rounded-lg text-sm border-neutral-200 flex-1"
            />
            <Input
              value={item.role}
              onChange={(e) => updateItem(idx, 'role', e.target.value)}
              placeholder="Rol (ej: Cliente frecuente)"
              className="h-9 rounded-lg text-sm border-neutral-200 flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateItem(idx, 'rating', star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0">{item.rating}/5</span>
          </div>
          <Textarea
            value={item.content}
            onChange={(e) => updateItem(idx, 'content', e.target.value)}
            placeholder="Escribe aqui lo que dijo el cliente..."
            rows={2}
            className="rounded-lg text-sm border-neutral-200 resize-none"
          />
        </div>
      ))}
      {testimonials.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-3 bg-neutral-50 rounded-lg">
          Sin testimonios. Haz clic en &quot;Agregar testimonio&quot; para empezar.
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Section Definitions
// ═══════════════════════════════════════════════════

const SECTIONS: SectionDef[] = [
  { id: 'announcement', label: 'Barra de Anuncio Superior', icon: Sparkles, description: 'Texto que aparece arriba del todo en tu tienda' },
  { id: 'hero', label: 'Banner Principal (Hero)', icon: Layout, description: 'Imagen principal, titulos, botones y badges de confianza' },
  { id: 'brands', label: 'Marca (Marquee)', icon: Type, description: 'Nombres de marcas que se muestran en carrusel' },
  { id: 'about', label: 'Seccion Nuestra Historia', icon: Type, description: 'Texto e imagenes sobre tu tienda' },
  { id: 'features', label: 'Barra de Beneficios', icon: Sparkles, description: 'Tarjetas con iconos de beneficios (envio gratis, etc.)' },
  { id: 'offers', label: 'Seccion de Ofertas', icon: Sparkles, description: 'Titulo y subtitulo de la seccion de ofertas' },
  { id: 'categories', label: 'Seccion de Categorias', icon: Type, description: 'Titulo y subtitulo de la seccion de categorias' },
  { id: 'testimonials', label: 'Seccion de Testimonios', icon: MessageSquareQuote, description: 'Resenas y comentarios de clientes (con estrellas)' },
  { id: 'newsletter', label: 'Newsletter / Suscripcion', icon: Type, description: 'Formulario de suscripcion por email' },
  { id: 'stats', label: 'Estadisticas', icon: Sparkles, description: 'Numeros y datos de tu tienda' },
  { id: 'faq', label: 'Preguntas Frecuentes (FAQ)', icon: Sparkles, description: 'Preguntas y respuestas en acordeon' },
  { id: 'cta', label: 'Llamada a la Accion (CTA)', icon: Sparkles, description: 'Seccion final para invitar a comprar' },
  { id: 'footer', label: 'Pie de Pagina (Footer)', icon: Type, description: 'Links, contacto y datos del pie de pagina' },
]

// Simple text fields per section
const SIMPLE_FIELDS: Record<string, SimpleField[]> = {
  announcement: [
    { key: 'text', label: 'Texto principal', placeholder: 'ENVIO GRATIS en pedidos mayores a S/199', type: 'text' },
    { key: 'subtext', label: 'Texto secundario', placeholder: 'Pago seguro contra entrega', type: 'text' },
  ],
  hero: [
    { key: 'badge', label: 'Badge (etiqueta)', placeholder: 'Nueva Coleccion 2026', type: 'text' },
    { key: 'title1', label: 'Titulo linea 1', placeholder: 'Estilo urbano', type: 'text' },
    { key: 'title2', label: 'Titulo linea 2', placeholder: 'sin limites', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo / Descripcion', placeholder: 'Ofertas exclusivas...', type: 'textarea', rows: 3 },
    { key: 'btnText1', label: 'Texto boton principal', placeholder: 'Ver Coleccion', type: 'text' },
    { key: 'btnText2', label: 'Texto boton secundario', placeholder: 'Ver Ofertas', type: 'text' },
    { key: 'image1', label: 'URL imagen banner 1', placeholder: '/images/hero/banner.png', type: 'text' },
    { key: 'image2', label: 'URL imagen banner 2', placeholder: '/images/hero/banner-2.png', type: 'text' },
    { key: 'image3', label: 'URL imagen banner 3', placeholder: '/images/hero/banner-3.png', type: 'text' },
    { key: 'stat1Icon', label: 'Stat 1 - Emoji', placeholder: '⭐', type: 'text' },
    { key: 'stat1Value', label: 'Stat 1 - Valor', placeholder: '4.8/5', type: 'text' },
    { key: 'stat1Label', label: 'Stat 1 - Texto', placeholder: '+200 resenas', type: 'text' },
    { key: 'stat2Icon', label: 'Stat 2 - Emoji', placeholder: '🚚', type: 'text' },
    { key: 'stat2Value', label: 'Stat 2 - Valor', placeholder: 'Envio rapido', type: 'text' },
    { key: 'stat2Label', label: 'Stat 2 - Texto', placeholder: '1-3 dias habiles', type: 'text' },
    { key: 'trustText1', label: 'Trust badge 1', placeholder: '✅ Envio gratis', type: 'text' },
    { key: 'trustText2', label: 'Trust badge 2', placeholder: '💰 Pago contra entrega', type: 'text' },
  ],
  about: [
    { key: 'badge', label: 'Badge', placeholder: 'Nuestra Historia', type: 'text' },
    { key: 'title', label: 'Titulo', placeholder: 'Mi Tienda', type: 'text' },
    { key: 'description', label: 'Descripcion', placeholder: 'Describe tu historia...', type: 'textarea', rows: 3 },
    { key: 'image', label: 'URL de imagen', placeholder: 'https://...', type: 'text' },
    { key: 'btnText', label: 'Texto boton', placeholder: 'Ver Catalogo', type: 'text' },
  ],
  offers: [
    { key: 'title', label: 'Titulo', placeholder: 'Ofertas', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo', placeholder: 'Los mejores precios...', type: 'text' },
  ],
  categories: [
    { key: 'title', label: 'Titulo', placeholder: 'Explora por Categoria', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo', placeholder: 'Encuentra exactamente lo que buscas', type: 'text' },
  ],
  testimonials: [
    { key: 'title', label: 'Titulo de la seccion', placeholder: 'Lo que dicen nuestros clientes', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo', placeholder: 'Resenas verificadas de compradores reales', type: 'text' },
  ],
  newsletter: [
    { key: 'title', label: 'Titulo', placeholder: 'Recibe ofertas exclusivas', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo', placeholder: 'Suscribete y obtén un 10%...', type: 'text' },
    { key: 'placeholder', label: 'Placeholder del input', placeholder: 'tu@email.com', type: 'text' },
    { key: 'btnText', label: 'Texto boton', placeholder: 'Suscribirme', type: 'text' },
    { key: 'footer', label: 'Texto inferior', placeholder: 'Sin spam...', type: 'text' },
  ],
  faq: [
    { key: 'title', label: 'Titulo', placeholder: 'Preguntas Frecuentes', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo', placeholder: 'Todo lo que necesitas saber...', type: 'text' },
  ],
  cta: [
    { key: 'title', label: 'Titulo', placeholder: '¿Listo para encontrar tu estilo?', type: 'text' },
    { key: 'subtitle', label: 'Subtitulo', placeholder: 'Unete a cientos de clientes...', type: 'textarea', rows: 2 },
    { key: 'btnText', label: 'Texto boton', placeholder: 'Ver Catalogo Completo', type: 'text' },
    { key: 'footer', label: 'Texto inferior', placeholder: 'Envio gratis desde S/199...', type: 'text' },
  ],
  footer: [
    { key: 'contactAddress', label: 'Direccion', placeholder: '📍 Lima, Peru', type: 'text' },
    { key: 'contactPhone', label: 'Telefono', placeholder: '📞 +51 999 888 777', type: 'text' },
    { key: 'contactWhatsapp', label: 'WhatsApp', placeholder: '💬 WhatsApp 24/7', type: 'text' },
    { key: 'contactHours', label: 'Horario', placeholder: '🕐 Lun-Sab: 9am-8pm', type: 'text' },
    { key: 'copyright', label: 'Copyright', placeholder: '© 2026 Mi Tienda. Todos los derechos reservados.', type: 'text' },
    { key: 'creditsText', label: 'Texto creditos', placeholder: 'Creado y desarrollado por Tienda Online', type: 'text' },
    { key: 'creditsUrl', label: 'URL creditos', placeholder: 'https://...', type: 'text' },
  ],
}

// ═══════════════════════════════════════════════════
// Main Admin Content Component
// ═══════════════════════════════════════════════════

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
        toast({ title: 'Contenido guardado', description: 'Todos los cambios se aplicaron correctamente. Se reflejaran en tu tienda publica.' })
        setTimeout(() => setSaved(false), 5000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminContent] save error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
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
          Personaliza todas las secciones de tu tienda publica: Hero, Testimonios, FAQ, Footer, emojis y mas.
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Los cambios se reflejan inmediatamente en la tienda publica. Soporta emojis al 100%.
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
          const simpleFields = SIMPLE_FIELDS[section.id] || []
          const sectionChangedCount = [
            ...simpleFields.map(f => `${section.id}.${f.key}`),
            // Count visual editors as changed if their value is non-empty and section is expanded
          ].filter(key => changedFields.has(key)).length
          const Icon = section.icon

          // Sections with only visual editors (no simple fields)
          const hasSimpleFields = simpleFields.length > 0
          // Sections with visual sub-editors
          const hasBrandsEditor = section.id === 'brands'
          const hasAboutFeaturesEditor = section.id === 'about'
          const hasFeatureCardsEditor = section.id === 'features'
          const hasStatsEditor = section.id === 'stats'
          const hasFaqEditor = section.id === 'faq'
          const hasTestimonialsEditor = section.id === 'testimonials'
          const hasFooterLinksEditor = section.id === 'footer'

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
                    <p className="text-[10px] text-neutral-400">{section.description}</p>
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
                  {/* Simple text/textarea fields */}
                  {hasSimpleFields && simpleFields.map((field) => {
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
                      </div>
                    )
                  })}

                  {/* Visual sub-editors (replacing JSON) */}
                  {hasBrandsEditor && (
                    <div className="pt-2 border-t border-dashed border-neutral-200">
                      <StringListEditor
                        value={content?.[section.id]?.['items'] || '[]'}
                        onChange={(v) => updateField(section.id, 'items', v)}
                        itemLabel="Nombres de marcas"
                        itemPlaceholder="Nombre de marca"
                      />
                    </div>
                  )}

                  {hasAboutFeaturesEditor && (
                    <div className="pt-2 border-t border-dashed border-neutral-200">
                      <IconTextListEditor
                        value={content?.[section.id]?.['features'] || '[]'}
                        onChange={(v) => updateField(section.id, 'features', v)}
                        itemLabel="Caracteristicas de tu tienda"
                        textPlaceholder="Describe una caracteristica"
                      />
                    </div>
                  )}

                  {hasFeatureCardsEditor && (
                    <div className="pt-2 border-t border-dashed border-neutral-200">
                      <FeatureCardEditor
                        value={content?.[section.id]?.['items'] || '[]'}
                        onChange={(v) => updateField(section.id, 'items', v)}
                      />
                    </div>
                  )}

                  {hasStatsEditor && (
                    <div className="pt-2 border-t border-dashed border-neutral-200">
                      <StatCardEditor
                        value={content?.[section.id]?.['items'] || '[]'}
                        onChange={(v) => updateField(section.id, 'items', v)}
                      />
                    </div>
                  )}

                  {hasFaqEditor && (
                    <div className="pt-2 border-t border-dashed border-neutral-200">
                      <FaqEditor
                        value={content?.[section.id]?.['items'] || '[]'}
                        onChange={(v) => updateField(section.id, 'items', v)}
                      />
                    </div>
                  )}

                  {hasTestimonialsEditor && (
                    <div className="pt-2 border-t border-dashed border-neutral-200">
                      <TestimonialsEditor storeId={storeId} />
                    </div>
                  )}

                  {hasFooterLinksEditor && (
                    <>
                      <div className="pt-2 border-t border-dashed border-neutral-200">
                        <StringListEditor
                          value={content?.[section.id]?.['shopLinks'] || '[]'}
                          onChange={(v) => updateField(section.id, 'shopLinks', v)}
                          itemLabel="Links de la tienda"
                          itemPlaceholder="Nombre de categoria (ej: Polos)"
                        />
                      </div>
                      <div className="border-t border-dashed border-neutral-200">
                        <StringListEditor
                          value={content?.[section.id]?.['helpLinks'] || '[]'}
                          onChange={(v) => updateField(section.id, 'helpLinks', v)}
                          itemLabel="Links de ayuda"
                          itemPlaceholder="Nombre de link (ej: FAQ, Contacto)"
                        />
                      </div>
                    </>
                  )}
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
