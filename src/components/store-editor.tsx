'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  X, Save, Loader2, Camera, Plus, Trash2, Pencil,
  Store, Image as ImageIcon, Upload, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Phone, MapPin, MessageSquare,
  ShoppingBag, ArrowLeft, Package, Tag, Settings, Eye, Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageUpload } from '@/components/image-upload'

interface StoreInfo {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  whatsappNumber: string
  address: string
  plan: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  sortOrder: number
}

interface Product {
  id: string
  name: string
  price: number
  image: string
  images: string
  description: string
  inStock: boolean
  category: { name: string; slug: string }
}

export default function StoreEditor({ storeSlug, onExit }: { storeSlug: string; onExit?: () => void }) {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const token = useAuthStore((s) => s.token)

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeSection, setActiveSection] = useState<'store' | 'products' | 'categories'>('store')
  const [fetchError, setFetchError] = useState(false)

  // Store settings form
  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    whatsappNumber: '',
    address: '',
    logo: '',
  })

  // New product form
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    categoryId: '',
  })
  const [newProductUploading, setNewProductUploading] = useState(false)

  // New category form
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', image: '' })
  const [newCategoryUploading, setNewCategoryUploading] = useState(false)

  const getAuthHeaders = useCallback(() => {
    if (token) return { Authorization: `Bearer ${token}` }
    return {}
  }, [token])

  // Fetch all data
  const fetchStoreData = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const [storeRes, catsRes, prodsRes] = await Promise.all([
        fetch(`/api/store/info?slug=${storeSlug}`),
        fetch(`/api/categories?store=${storeSlug}`),
        fetch(`/api/products?store=${storeSlug}`),
      ])

      if (storeRes.ok) {
        const storeData = await storeRes.json()
        setStoreInfo(storeData)
        setStoreForm({
          name: storeData.name || '',
          description: storeData.description || '',
          whatsappNumber: storeData.whatsappNumber || '',
          address: storeData.address || '',
          logo: storeData.logo || '',
        })
      } else {
        // Fallback: use auth user data when DB fetch fails
        console.warn('[StoreEditor] Store fetch failed, using auth fallback')
        setFetchError(true)
        const fallbackStore: StoreInfo = {
          id: user?.storeId || '',
          name: user?.storeName || user?.name || storeSlug,
          slug: storeSlug,
          logo: user?.avatar || '',
          description: '',
          whatsappNumber: '',
          address: '',
          plan: 'basico',
          isActive: true,
        }
        setStoreInfo(fallbackStore)
        setStoreForm({
          name: fallbackStore.name,
          description: '',
          whatsappNumber: '',
          address: '',
          logo: '',
        })
      }
      if (catsRes.ok) {
        const catsData = await catsRes.json()
        setCategories(Array.isArray(catsData) ? catsData : [])
      } else {
        setCategories([])
      }
      if (prodsRes.ok) {
        const prodsData = await prodsRes.json()
        setProducts(Array.isArray(prodsData) ? prodsData : [])
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('[StoreEditor] Fetch error:', err)
      setFetchError(true)
      // Fallback: use auth user data on network error
      const fallbackStore: StoreInfo = {
        id: user?.storeId || '',
        name: user?.storeName || user?.name || storeSlug,
        slug: storeSlug,
        logo: user?.avatar || '',
        description: '',
        whatsappNumber: '',
        address: '',
        plan: 'basico',
        isActive: true,
      }
      setStoreInfo(fallbackStore)
      setStoreForm({
        name: fallbackStore.name,
        description: '',
        whatsappNumber: '',
        address: '',
        logo: '',
      })
      setCategories([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [storeSlug, user])

  useEffect(() => {
    fetchStoreData()
  }, [fetchStoreData])

  // Mark changes
  const markChanged = () => setHasChanges(true)

  // Save store settings
  const saveStoreSettings = async () => {
    if (!storeInfo?.id) {
      toast({
        title: 'Tienda no inicializada',
        description: 'No se encontró el ID de la tienda. La tienda necesita ser creada en la base de datos primero. Intenta recargar la página o contacta al soporte.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ id: storeInfo.id, ...storeForm }),
      })
      if (res.ok) {
        const data = await res.json()
        setStoreInfo(prev => prev ? { ...prev, ...data } : null)
        setHasChanges(false)
        toast({ title: 'Tienda actualizada', description: 'Los cambios se guardaron correctamente' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Save all changes
  const handleSaveAll = async () => {
    await saveStoreSettings()
  }

  // Upload image helper
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('storeSlug', storeSlug)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      ...getAuthHeaders() ? { headers: getAuthHeaders() } : {},
    })
    if (res.ok) {
      const data = await res.json()
      return data.url
    }
    return null
  }

  // Handle file input
  const handleFileInput = useCallback((accept: string, folder: string, onUploaded: (url: string) => void) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const url = await uploadImage(file, folder)
      if (url) {
        onUploaded(url)
        markChanged()
      } else {
        toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' })
      }
    }
    input.click()
  }, [storeSlug])

  // Add product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      toast({ title: 'Error', description: 'Nombre, precio y categoria son obligatorios', variant: 'destructive' })
      return
    }
    setNewProductUploading(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          storeId: storeInfo?.id,
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          image: newProduct.image || '',
          images: '[]',
          categoryId: newProduct.categoryId,
          sizes: JSON.stringify(['Unico']),
          colors: JSON.stringify([{ name: 'Default', hex: '#000000' }]),
          inStock: true,
          slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setProducts(prev => [created, ...prev])
        setNewProduct({ name: '', price: '', description: '', image: '', categoryId: '' })
        setShowNewProduct(false)
        toast({ title: 'Producto agregado', description: newProduct.name })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo agregar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setNewProductUploading(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      const res = await fetch(`/api/admin/products?id=${productId}&storeId=${storeInfo?.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        toast({ title: 'Producto eliminado' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }
    setNewCategoryUploading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          storeId: storeInfo?.id,
          name: newCategory.name,
          slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image: newCategory.image || '',
          sortOrder: categories.length,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setCategories(prev => [...prev, created])
        setNewCategory({ name: '', image: '' })
        setShowNewCategory(false)
        toast({ title: 'Categoria agregada' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo agregar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setNewCategoryUploading(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('¿Eliminar esta categoria?')) return
    try {
      const res = await fetch(`/api/admin/categories?id=${catId}&storeId=${storeInfo?.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== catId))
        toast({ title: 'Categoria eliminada' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  // Update product image
  const handleProductImageChange = async (productId: string, newUrl: string) => {
    try {
      const res = await fetch(`/api/admin/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: productId,
          storeId: storeInfo?.id,
          image: newUrl,
        }),
      })
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, image: newUrl } : p))
        toast({ title: 'Imagen actualizada' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    }
  }

  // Update category image
  const handleCategoryImageChange = async (catId: string, newUrl: string) => {
    try {
      const res = await fetch(`/api/admin/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: catId,
          storeId: storeInfo?.id,
          image: newUrl,
        }),
      })
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, image: newUrl } : c))
        toast({ title: 'Imagen actualizada' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Cargando editor...</p>
        </div>
      </div>
    )
  }

  if (!storeInfo) {
    const hasStoreId = !!user?.storeId
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 max-w-sm">
          <Store className={`w-12 h-12 mx-auto mb-3 ${hasStoreId ? 'text-amber-400' : 'text-neutral-300'}`} />
          <p className="text-sm font-medium text-neutral-700 mb-1">
            {hasStoreId ? 'Datos de tienda no disponibles' : 'Tienda no encontrada'}
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            {hasStoreId
              ? 'No se pudieron cargar los datos completos de la tienda desde la base de datos. Puedes continuar editando con los datos básicos o reintentar la conexión.'
              : 'No se encontró información de la tienda. Verifica que estés autenticado correctamente.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStoreData()}
            className="text-xs gap-1.5 rounded-lg"
          >
            <Loader2 className="w-3.5 h-3.5" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Editor Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {onExit && (
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={onExit}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-neutral-900 truncate">Editor de Tienda</h1>
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate">{storeInfo.name} · {storeInfo.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="hidden sm:flex text-xs gap-1.5 h-8 rounded-lg">
                  <Eye className="w-3.5 h-3.5" /> Ver Tienda
                </Button>
              </a>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                className={`text-xs gap-1.5 h-8 rounded-lg ${hasChanges ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-neutral-200 text-neutral-400'}`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasChanges ? <><CheckCircle2 className="w-3.5 h-3.5" /> Guardar</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Guardado</>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="sticky top-14 sm:top-16 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {[
              { key: 'store' as const, label: 'Tienda', icon: Store },
              { key: 'products' as const, label: 'Productos', icon: Package },
              { key: 'categories' as const, label: 'Categorias', icon: Tag },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeSection === tab.key
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.key === 'products' && <Badge className="ml-1 bg-neutral-200 text-neutral-600 text-[9px] px-1.5 h-4">{products.length}</Badge>}
                {tab.key === 'categories' && <Badge className="ml-1 bg-neutral-200 text-neutral-600 text-[9px] px-1.5 h-4">{categories.length}</Badge>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fetch Error Warning Banner */}
      {fetchError && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 truncate">
                Los datos de la tienda se cargaron desde tu cuenta. Algunos datos pueden estar incompletos.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStoreData()}
              className="shrink-0 text-xs gap-1.5 h-7 rounded-lg border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* ═══ STORE SETTINGS SECTION ═══ */}
        {activeSection === 'store' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            {/* Store Header Preview */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Editable Logo */}
                  <div className="relative group">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex items-center justify-center">
                      {storeForm.logo ? (
                        <img src={storeForm.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-white/70" />
                      )}
                    </div>
                    <button
                      onClick={() => handleFileInput('image/jpeg,image/png,image/webp', 'store-logos', (url) => { setStoreForm({ ...storeForm, logo: url }); markChanged() })}
                      className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mb-1">Nombre de la Tienda</p>
                    <Input
                      value={storeForm.name}
                      onChange={(e) => { setStoreForm({ ...storeForm, name: e.target.value }); markChanged() }}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10 rounded-lg text-base sm:text-lg font-bold focus:ring-white/30"
                      placeholder="Nombre de tu tienda"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    Descripcion de la Tienda
                  </Label>
                  <Textarea
                    value={storeForm.description}
                    onChange={(e) => { setStoreForm({ ...storeForm, description: e.target.value }); markChanged() }}
                    placeholder="Describe tu tienda, que vendes, tu historia..."
                    rows={3}
                    className="rounded-lg text-sm border-neutral-200 resize-none"
                  />
                </div>

                <Separator className="bg-neutral-100" />

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      value={storeForm.whatsappNumber}
                      onChange={(e) => { setStoreForm({ ...storeForm, whatsappNumber: e.target.value }); markChanged() }}
                      placeholder="+51 999 888 777"
                      className="h-10 rounded-lg text-sm border-neutral-200"
                    />
                    <p className="text-[10px] text-neutral-400">Incluye codigo de pais</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Direccion
                    </Label>
                    <Input
                      value={storeForm.address}
                      onChange={(e) => { setStoreForm({ ...storeForm, address: e.target.value }); markChanged() }}
                      placeholder="Av. Principal 123, Lima"
                      className="h-10 rounded-lg text-sm border-neutral-200"
                    />
                  </div>
                </div>

                {/* Logo Upload Area */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700">Logo de la Tienda</Label>
                  <div className="max-w-xs">
                    <ImageUpload
                      value={storeForm.logo}
                      onChange={(url) => { setStoreForm({ ...storeForm, logo: url }); markChanged() }}
                      storeSlug={storeSlug}
                      folder="store-logos"
                      aspectRatio="aspect-square"
                      label="Sube el logo de tu tienda"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store URL Info */}
            <Card className="rounded-2xl border">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">URL de tu Tienda</p>
                    <p className="text-xs text-neutral-400 truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}/${storeInfo.slug}` : `/${storeInfo.slug}`}
                    </p>
                  </div>
                  <a
                    href={`/${storeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Ver Tienda
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ PRODUCTS SECTION ═══ */}
        {activeSection === 'products' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            {/* Add Product Button */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">{products.length} productos</p>
              <Button
                size="sm"
                onClick={() => setShowNewProduct(!showNewProduct)}
                className="text-xs gap-1.5 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                {showNewProduct ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showNewProduct ? 'Cancelar' : 'Nuevo Producto'}
              </Button>
            </div>

            {/* New Product Form */}
            <AnimatePresence>
              {showNewProduct && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="rounded-2xl border-2 border-dashed border-neutral-300">
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900">Agregar Nuevo Producto</h3>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-600">Imagen del Producto</Label>
                        <ImageUpload
                          value={newProduct.image}
                          onChange={(url) => setNewProduct({ ...newProduct, image: url })}
                          storeSlug={storeSlug}
                          folder="products"
                          aspectRatio="aspect-square"
                          label="Sube la foto del producto"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-neutral-600">Nombre</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Nombre del producto"
                            className="h-9 rounded-lg text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-neutral-600">Precio (S/)</Label>
                          <Input
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="99.90"
                            type="number"
                            step="0.01"
                            className="h-9 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600">Categoria</Label>
                        <div className="flex gap-2 flex-wrap">
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setNewProduct({ ...newProduct, categoryId: cat.id })}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                newProduct.categoryId === cat.id
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600">Descripcion</Label>
                        <Textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Describe el producto..."
                          rows={2}
                          className="rounded-lg text-sm resize-none"
                        />
                      </div>

                      <Button
                        onClick={handleAddProduct}
                        disabled={newProductUploading || !newProduct.name || !newProduct.price || !newProduct.categoryId}
                        className="w-full h-9 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                      >
                        {newProductUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Plus className="w-4 h-4" /> Agregar Producto</>}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
                <p className="text-sm font-medium text-neutral-500">Sin productos</p>
                <p className="text-xs text-neutral-400 mt-1">Agrega tu primer producto para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                    {/* Product Image - Clickable to change */}
                    <div
                      className="relative aspect-square bg-neutral-100 cursor-pointer"
                      onClick={() => handleFileInput('image/jpeg,image/png,image/webp', 'products', (url) => handleProductImageChange(product.id, url))}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-neutral-300" />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <Camera className="w-4 h-4 text-neutral-700" />
                        </div>
                      </div>
                      {/* Price badge */}
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                        <span className="text-xs font-bold text-neutral-900">S/ {product.price?.toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Product Info */}
                    <div className="p-2.5 sm:p-3">
                      <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{product.category?.name || 'Sin categoria'}</p>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="mt-2 text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ CATEGORIES SECTION ═══ */}
        {activeSection === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">{categories.length} categorias</p>
              <Button
                size="sm"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-xs gap-1.5 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                {showNewCategory ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showNewCategory ? 'Cancelar' : 'Nueva Categoria'}
              </Button>
            </div>

            {/* New Category Form */}
            <AnimatePresence>
              {showNewCategory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="rounded-2xl border-2 border-dashed border-neutral-300">
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900">Nueva Categoria</h3>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-600">Imagen</Label>
                        <ImageUpload
                          value={newCategory.image}
                          onChange={(url) => setNewCategory({ ...newCategory, image: url })}
                          storeSlug={storeSlug}
                          folder="categories"
                          aspectRatio="aspect-square"
                          label="Sube la imagen de categoria"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600">Nombre</Label>
                        <Input
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          placeholder="Nombre de la categoria"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleAddCategory}
                        disabled={newCategoryUploading || !newCategory.name}
                        className="w-full h-9 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                      >
                        {newCategoryUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><Plus className="w-4 h-4" /> Crear Categoria</>}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories Grid */}
            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 sm:p-12 text-center">
                <Tag className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
                <p className="text-sm font-medium text-neutral-500">Sin categorias</p>
                <p className="text-xs text-neutral-400 mt-1">Crea categorias para organizar tus productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white rounded-xl border overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                    <div
                      className="relative aspect-video bg-neutral-100 cursor-pointer"
                      onClick={() => handleFileInput('image/jpeg,image/png,image/webp', 'categories', (url) => handleCategoryImageChange(cat.id, url))}
                    >
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-neutral-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <Camera className="w-4 h-4 text-neutral-700" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate">{cat.name}</p>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="shrink-0 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Unsaved Changes Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
          >
            <div className="max-w-lg mx-auto bg-neutral-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-medium">Cambios sin guardar</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setStoreForm({
                      name: storeInfo?.name || '',
                      description: storeInfo?.description || '',
                      whatsappNumber: storeInfo?.whatsappNumber || '',
                      address: storeInfo?.address || '',
                      logo: storeInfo?.logo || '',
                    })
                    setHasChanges(false)
                  }}
                  className="text-xs text-white/70 hover:text-white hover:bg-white/10 h-8 rounded-lg"
                >
                  Descartar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white h-8 rounded-lg gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
