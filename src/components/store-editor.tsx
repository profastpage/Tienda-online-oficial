'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  X, Save, Loader2, Camera, Plus, Trash2, Pencil,
  Store, Image as ImageIcon, Upload, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Phone, MapPin, MessageSquare,
  ShoppingBag, ArrowLeft, Package, Tag, Settings, Eye, Edit3,
  ToggleLeft, ToggleRight, Star, MessageSquareQuote, Sparkles,
  Layout, Type, RefreshCw
} from 'lucide-react'
import { AdminContent } from '@/components/admin/admin-content'
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
import { ThemeToggle } from '@/components/theme-toggle'

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
  slug: string
  price: number
  image: string
  images: string
  description: string
  inStock: boolean
  categoryId: string
  category: { name: string; slug: string; id: string }
}

export default function StoreEditor({ storeSlug, onExit, stayOnEditor }: { storeSlug: string; onExit?: () => void; stayOnEditor?: boolean }) {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const token = useAuthStore((s) => s.token)

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeSection, setActiveSection] = useState<'store' | 'products' | 'categories' | 'testimonials' | 'faq' | 'content'>('store')
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

  // Editing product (inline edit for existing product)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    inStock: true,
  })
  const [savingProductId, setSavingProductId] = useState<string | null>(null)

  // Editing category name
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [savingCatId, setSavingCatId] = useState<string | null>(null)

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Array<{id?: string; name: string; role: string; content: string; rating: number; _isNew?: boolean}>>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(false)

  // FAQ state (from StoreContent table)
  const [faqItems, setFaqItems] = useState<Array<{q: string; a: string}>>([])
  const [faqLoading, setFaqLoading] = useState(false)

  // Store content state (for all sections)
  const [storeContent, setStoreContent] = useState<Record<string, Record<string, string>>>({})
  const [contentLoading, setContentLoading] = useState(false)
  const [contentSaving, setContentSaving] = useState<string | null>(null)

  const getAuthHeaders = useCallback((): Record<string, string> => {
    // Only return auth header, let each fetch call set Content-Type as needed
    if (token) return { Authorization: `Bearer ${token}` }
    return {}
  }, [token])

  // Get the effective store ID - always prefer user.storeId for authenticated operations
  const getEffectiveStoreId = useCallback(() => {
    // Always use the authenticated user's storeId for operations
    // This is more reliable than storeInfo.id from API which might be stale
    return user?.storeId || storeInfo?.id || ''
  }, [user?.storeId, storeInfo?.id])

  // Fetch all data
  const fetchStoreData = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    
    // Quick check: if user has store data in auth, use it immediately
    if (user?.storeId && user?.storeName) {
      const quickStore: StoreInfo = {
        id: user.storeId,
        name: user.storeName,
        slug: storeSlug,
        logo: user.avatar || '',
        description: '',
        whatsappNumber: '',
        address: '',
        plan: 'basico',
        isActive: true,
      }
      setStoreInfo(quickStore)
      setStoreForm({
        name: quickStore.name,
        description: '',
        whatsappNumber: '',
        address: '',
        logo: quickStore.logo,
      })
    }
    
    try {
      // Use authenticated admin endpoints for all data
      const headers = getAuthHeaders()
      
      // Fetch categories and products from admin endpoints
      const [catsRes, prodsRes] = await Promise.all([
        fetch(`/api/admin/categories`, { headers }),
        fetch(`/api/admin/products`, { headers }),
      ])

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
      
      // Fetch store info if not already set from user data
      if (!user?.storeId) {
        const storeUrl = `/api/store/info?slug=${storeSlug}`
        const storeRes = await fetch(storeUrl)
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
          setFetchError(true)
        }
      }
    } catch (err) {
      console.error('[StoreEditor] Fetch error:', err)
      setFetchError(true)
      
      // Set fallback store from user data if available
      if (user?.storeId) {
        const fallbackStore: StoreInfo = {
          id: user.storeId,
          name: user.storeName || user.name || storeSlug,
          slug: storeSlug,
          logo: user.avatar || '',
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
    } finally {
      setLoading(false)
    }
  }, [storeSlug, user, getAuthHeaders])

  useEffect(() => {
    fetchStoreData()
  }, [fetchStoreData])

  // ═══ TESTIMONIALS & STORE CONTENT FETCHING ═══

  const fetchTestimonials = useCallback(async () => {
    setTestimonialsLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials', { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setTestimonials(Array.isArray(data) ? data : [])
      }
    } catch {
      // silently fail
    }
    setTestimonialsLoading(false)
  }, [getAuthHeaders])

  const fetchStoreContent = useCallback(async () => {
    setContentLoading(true)
    try {
      const res = await fetch('/api/admin/store-content', { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setStoreContent(data || {})
        // Parse FAQ items
        try {
          const faq = JSON.parse(data?.faq?.items || '[]')
          setFaqItems(Array.isArray(faq) ? faq : [])
        } catch { setFaqItems([]) }
      }
    } catch {
      // silently fail
    }
    setContentLoading(false)
  }, [getAuthHeaders])

  // Fetch data when switching to new tabs
  useEffect(() => {
    if (activeSection === 'testimonials') {
      fetchTestimonials()
    }
    if (activeSection === 'faq' || activeSection === 'content') {
      fetchStoreContent()
    }
  }, [activeSection, fetchTestimonials, fetchStoreContent])

  // ═══ TESTIMONIAL CRUD ═══

  const addTestimonial = () => {
    setTestimonials(prev => [...prev, { name: '', role: '', content: '', rating: 5, _isNew: true }])
  }

  const deleteTestimonial = async (idx: number, id?: string) => {
    if (id) {
      try {
        const res = await fetch(`/api/admin/testimonials?id=${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })
        if (res.ok) {
          setTestimonials(prev => prev.filter((_, i) => i !== idx))
          toast({ title: 'Testimonio eliminado', duration: 1500 })
        } else {
          toast({ title: 'Error al eliminar', variant: 'destructive' })
        }
      } catch {
        toast({ title: 'Error de conexion', variant: 'destructive' })
      }
    } else {
      setTestimonials(prev => prev.filter((_, i) => i !== idx))
    }
  }

  const updateTestimonial = (idx: number, field: string, value: string | number) => {
    setTestimonials(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const saveTestimonial = async (idx: number) => {
    const item = testimonials[idx]
    if (!item.name || !item.content) {
      toast({ title: 'Completa nombre y contenido', variant: 'destructive' })
      return
    }
    setContentSaving(`testimonial_${idx}`)
    try {
      const method = item._isNew || !item.id ? 'POST' : 'PUT'
      const body = item._isNew || !item.id
        ? { name: item.name, role: item.role, content: item.content, rating: item.rating }
        : { id: item.id, name: item.name, role: item.role, content: item.content, rating: item.rating }
      const res = await fetch('/api/admin/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
      setContentSaving(null)
    }
  }

  // ═══ FAQ CRUD ═══

  const addFaqItem = () => {
    setFaqItems(prev => [...prev, { q: '', a: '' }])
  }

  const removeFaqItem = (idx: number) => {
    setFaqItems(prev => prev.filter((_, i) => i !== idx))
  }

  const updateFaqItem = (idx: number, field: 'q' | 'a', value: string) => {
    setFaqItems(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const saveFaq = async () => {
    setContentSaving('faq')
    try {
      const items: Array<{ section: string; key: string; value: string }> = []
      items.push({ section: 'faq', key: 'items', value: JSON.stringify(faqItems) })
      const res = await fetch('/api/admin/store-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ items }),
      })
      if (res.ok) {
        toast({ title: 'FAQ guardado', description: 'Las preguntas frecuentes se actualizaron correctamente' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de conexion', variant: 'destructive' })
    } finally {
      setContentSaving(null)
    }
  }

  // Mark changes
  const markChanged = () => setHasChanges(true)

  // Save store settings
  const saveStoreSettings = async () => {
    const effectiveStoreId = getEffectiveStoreId()
    if (!effectiveStoreId) {
      toast({
        title: 'Tienda no inicializada',
        description: 'No se encontro el ID de la tienda. Intenta recargar la pagina.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ id: effectiveStoreId, ...storeForm }),
      })
      if (res.ok) {
        const data = await res.json()
        setStoreInfo(prev => prev ? { ...prev, ...data } : null)
        // Update form with saved data to ensure consistency
        setStoreForm({
          name: data.name || '',
          description: data.description || '',
          whatsappNumber: data.whatsappNumber || '',
          address: data.address || '',
          logo: data.logo || '',
        })
        setHasChanges(false)
        toast({ title: 'Tienda actualizada', description: 'Los cambios se guardaron correctamente' })
        // In stayOnEditor mode, refresh all data from server to ensure persistence
        if (stayOnEditor) {
          // Re-fetch store data to ensure everything is in sync
          setTimeout(() => fetchStoreData(), 500)
        }
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
    const headers = getAuthHeaders()
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
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

  // ═══ PRODUCT CRUD ═══

  // Add product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      toast({ title: 'Error', description: 'Nombre, precio y categoria son obligatorios', variant: 'destructive' })
      return
    }
    const effectiveStoreId = getEffectiveStoreId()
    if (!effectiveStoreId) {
      toast({ title: 'Error', description: 'No se pudo determinar la tienda. Recarga la pagina.', variant: 'destructive' })
      return
    }
    console.log('[StoreEditor] Adding product:', { name: newProduct.name, storeId: effectiveStoreId, categoryId: newProduct.categoryId, hasToken: !!token })
    setNewProductUploading(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          storeId: effectiveStoreId,
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
      console.log('[StoreEditor] Add product response:', res.status, res.statusText)
      if (res.ok) {
        const created = await res.json()
        setProducts(prev => [created, ...prev])
        setNewProduct({ name: '', price: '', description: '', image: '', categoryId: '' })
        setShowNewProduct(false)
        toast({ title: 'Producto agregado', description: newProduct.name })
      } else {
        const err = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }))
        console.error('[StoreEditor] Add product error:', err)
        toast({ title: 'Error', description: err.error || 'No se pudo agregar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[StoreEditor] Add product network error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setNewProductUploading(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Eliminar este producto?')) return
    const effectiveStoreId = getEffectiveStoreId()
    try {
      const res = await fetch(`/api/admin/products?id=${productId}&storeId=${effectiveStoreId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        if (editingProductId === productId) setEditingProductId(null)
        toast({ title: 'Producto eliminado' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  // Open edit form for a product
  const handleStartEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setEditProductForm({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      categoryId: product.categoryId || product.category?.id || '',
      inStock: product.inStock !== false,
    })
  }

  // Save edited product (name, price, description, category, stock)
  const handleSaveEditProduct = async (productId: string) => {
    if (!editProductForm.name || !editProductForm.price) {
      toast({ title: 'Error', description: 'Nombre y precio son obligatorios', variant: 'destructive' })
      return
    }
    const effectiveStoreId = getEffectiveStoreId()
    setSavingProductId(productId)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: productId,
          storeId: effectiveStoreId,
          name: editProductForm.name,
          price: parseFloat(editProductForm.price),
          description: editProductForm.description,
          categoryId: editProductForm.categoryId || undefined,
          inStock: editProductForm.inStock,
          slug: editProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updated } : p))
        setEditingProductId(null)
        toast({ title: 'Producto actualizado' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo actualizar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setSavingProductId(null)
    }
  }

  // Toggle product stock status (quick action)
  const handleToggleStock = async (product: Product) => {
    const effectiveStoreId = getEffectiveStoreId()
    try {
      const newStock = !product.inStock
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: product.id,
          storeId: effectiveStoreId,
          inStock: newStock,
        }),
      })
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inStock: newStock } : p))
        toast({ title: newStock ? 'Producto en stock' : 'Producto sin stock' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    }
  }

  // Update product image
  const handleProductImageChange = async (productId: string, newUrl: string) => {
    const effectiveStoreId = getEffectiveStoreId()
    try {
      const res = await fetch(`/api/admin/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: productId,
          storeId: effectiveStoreId,
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

  // ═══ CATEGORY CRUD ═══

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }
    const effectiveStoreId = getEffectiveStoreId()
    console.log('[StoreEditor] Adding category:', { name: newCategory.name, storeId: effectiveStoreId, hasToken: !!token })
    setNewCategoryUploading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          storeId: effectiveStoreId,
          name: newCategory.name,
          slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image: newCategory.image || '',
          sortOrder: categories.length,
        }),
      })
      console.log('[StoreEditor] Add category response:', res.status, res.statusText)
      if (res.ok) {
        const created = await res.json()
        setCategories(prev => [...prev, created])
        setNewCategory({ name: '', image: '' })
        setShowNewCategory(false)
        toast({ title: 'Categoria agregada' })
      } else {
        const err = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }))
        console.error('[StoreEditor] Add category error:', err)
        toast({ title: 'Error', description: err.error || 'No se pudo agregar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[StoreEditor] Add category network error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setNewCategoryUploading(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Eliminar esta categoria?')) return
    const effectiveStoreId = getEffectiveStoreId()
    try {
      const res = await fetch(`/api/admin/categories?id=${catId}&storeId=${effectiveStoreId}`, {
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

  // Save edited category name
  const handleSaveEditCategory = async (catId: string) => {
    if (!editCatName.trim()) {
      toast({ title: 'Error', description: 'El nombre no puede estar vacio', variant: 'destructive' })
      return
    }
    const effectiveStoreId = getEffectiveStoreId()
    setSavingCatId(catId)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: catId,
          storeId: effectiveStoreId,
          name: editCatName.trim(),
          slug: editCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      })
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, name: editCatName.trim(), slug: editCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') } : c))
        // Also update products referencing this category
        setProducts(prev => prev.map(p => p.category?.id === catId ? { ...p, category: { ...p.category, name: editCatName.trim() } } : p))
        setEditingCatId(null)
        toast({ title: 'Categoria actualizada' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo actualizar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setSavingCatId(null)
    }
  }

  // Update category image
  const handleCategoryImageChange = async (catId: string, newUrl: string) => {
    const effectiveStoreId = getEffectiveStoreId()
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          id: catId,
          storeId: effectiveStoreId,
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

  // ═══ LOADING / ERROR STATES ═══

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400 dark:text-neutral-500" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando editor...</p>
        </div>
      </div>
    )
  }

  if (!storeInfo) {
    const hasStoreId = !!user?.storeId
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center p-8 max-w-sm">
          <Store className={`w-12 h-12 mx-auto mb-3 ${hasStoreId ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {hasStoreId ? 'Datos de tienda no disponibles' : 'Tienda no encontrada'}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
            {hasStoreId
              ? 'No se pudieron cargar los datos completos de la tienda. Puedes continuar editando con los datos basicos o reintentar la conexion.'
              : 'No se encontro informacion de la tienda. Verifica que estes autenticado correctamente.'}
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

  // ═══ MAIN RENDER ═══

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      {/* Editor Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Show back button when onExit is provided and not in stayOnEditor mode */}
              {onExit && !stayOnEditor && (
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={onExit}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {/* In stayOnEditor mode, show "Cerrar Editor" button to go back to admin panel */}
              {stayOnEditor && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="shrink-0 h-8 gap-1.5 text-xs border-neutral-300 dark:border-neutral-700">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cerrar Editor</span>
                    <span className="sm:hidden">Cerrar</span>
                  </Button>
                </Link>
              )}
              {/* User Avatar / Profile */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 overflow-hidden flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 shadow-sm">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || 'Usuario'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-bold">{(user?.name || storeInfo.name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" title="En línea"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">Editor de Tienda</h1>
                <p className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 truncate">{storeInfo.name} · {storeInfo.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle size="sm" />
              <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                <Button variant="outline" size="sm" className="hidden sm:flex text-xs gap-1.5 h-8 rounded-lg">
                  <Eye className="w-3.5 h-3.5" /> Ver Tienda
                </Button>
              </a>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                className={`text-xs gap-1.5 h-8 rounded-lg ${hasChanges ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500'}`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasChanges ? <><CheckCircle2 className="w-3.5 h-3.5" /> Guardar</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Guardado</>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="sticky top-14 sm:top-16 z-40 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {[
              { key: 'store' as const, label: 'Tienda', icon: Store },
              { key: 'products' as const, label: 'Productos', icon: Package },
              { key: 'categories' as const, label: 'Categorias', icon: Tag },
              { key: 'testimonials' as const, label: 'Testimonios', icon: MessageSquareQuote },
              { key: 'faq' as const, label: 'FAQ', icon: Sparkles },
              { key: 'content' as const, label: 'Contenido', icon: Layout },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeSection === tab.key
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.key === 'products' && <Badge className="ml-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[9px] px-1.5 h-4">{products.length}</Badge>}
                {tab.key === 'categories' && <Badge className="ml-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[9px] px-1.5 h-4">{categories.length}</Badge>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fetch Error Warning Banner */}
      {fetchError && (
        <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 truncate">
                Los datos de la tienda se cargaron desde tu cuenta. Algunos datos pueden estar incompletos.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStoreData()}
              className="shrink-0 text-xs gap-1.5 h-7 rounded-lg border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">

        {/* ═══ STORE SETTINGS SECTION ═══ */}
        {activeSection === 'store' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            {/* Store Header Preview */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border dark:border-neutral-800 shadow-sm overflow-hidden">
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
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                    Descripcion de la Tienda
                  </Label>
                  <Textarea
                    value={storeForm.description}
                    onChange={(e) => { setStoreForm({ ...storeForm, description: e.target.value }); markChanged() }}
                    placeholder="Describe tu tienda, que vendes, tu historia..."
                    rows={3}
                    className="rounded-lg text-sm border-neutral-200 dark:border-neutral-700 resize-none"
                  />
                </div>

                <Separator className="bg-neutral-100 dark:bg-neutral-800" />

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      value={storeForm.whatsappNumber}
                      onChange={(e) => { setStoreForm({ ...storeForm, whatsappNumber: e.target.value }); markChanged() }}
                      placeholder="+51 999 888 777"
                      className="h-10 rounded-lg text-sm border-neutral-200 dark:border-neutral-700"
                    />
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Incluye codigo de pais</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Direccion
                    </Label>
                    <Input
                      value={storeForm.address}
                      onChange={(e) => { setStoreForm({ ...storeForm, address: e.target.value }); markChanged() }}
                      placeholder="Av. Principal 123, Lima"
                      className="h-10 rounded-lg text-sm border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>

                {/* Logo Upload Area */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Logo de la Tienda</Label>
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
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">URL de tu Tienda</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}/${storeInfo.slug}` : `/${storeInfo.slug}`}
                    </p>
                  </div>
                  <a
                    href={`/${storeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{products.length} productos</p>
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
                  <Card className="rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Agregar Nuevo Producto</h3>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Imagen del Producto</Label>
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
                          <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Nombre</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Nombre del producto"
                            className="h-9 rounded-lg text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Precio (S/)</Label>
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
                        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Categoria</Label>
                        {categories.length === 0 ? (
                          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                              Primero debes crear una categoria. Ve a la pestana <strong>Categorias</strong> para agregar una.
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => setNewProduct({ ...newProduct, categoryId: cat.id })}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                  newProduct.categoryId === cat.id
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Descripcion</Label>
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
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border dark:border-neutral-800 p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Sin productos</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Agrega tu primer producto para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {products.map(product => (
                  <Card key={product.id} className="rounded-2xl border dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Product Image - Clickable to change */}
                        <div
                          className="relative w-full sm:w-32 h-40 sm:h-auto bg-neutral-100 dark:bg-neutral-800 cursor-pointer shrink-0"
                          onClick={() => handleFileInput('image/jpeg,image/png,image/webp', 'products', (url) => handleProductImageChange(product.id, url))}
                        >
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                            </div>
                          )}
                          {/* Hover overlay for camera */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg">
                              <Camera className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                            </div>
                          </div>
                          {/* Stock indicator */}
                          <div className="absolute top-2 right-2">
                            <Badge className={`text-[9px] px-1.5 py-0 ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {product.inStock ? 'En stock' : 'Sin stock'}
                            </Badge>
                          </div>
                          {/* Price badge */}
                          <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">S/ {product.price?.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Product Info + Actions */}
                        <div className="flex-1 p-3 sm:p-4">
                          {editingProductId === product.id ? (
                            /* ═══ INLINE EDIT FORM ═══ */
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Editando producto</p>
                                <button onClick={() => setEditingProductId(null)} className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Nombre</Label>
                                  <Input
                                    value={editProductForm.name}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                                    className="h-8 rounded-lg text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Precio (S/)</Label>
                                  <Input
                                    value={editProductForm.price}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                                    type="number"
                                    step="0.01"
                                    className="h-8 rounded-lg text-sm"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Descripcion</Label>
                                <Textarea
                                  value={editProductForm.description}
                                  onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                                  rows={2}
                                  className="rounded-lg text-sm resize-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Categoria</Label>
                                <div className="flex gap-1.5 flex-wrap">
                                  {categories.map(cat => (
                                    <button
                                      key={cat.id}
                                      onClick={() => setEditProductForm({ ...editProductForm, categoryId: cat.id })}
                                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                                        editProductForm.categoryId === cat.id
                                          ? 'bg-neutral-900 text-white'
                                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                      }`}
                                    >
                                      {cat.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-1">
                                {/* Stock Toggle */}
                                <button
                                  onClick={() => setEditProductForm({ ...editProductForm, inStock: !editProductForm.inStock })}
                                  className="flex items-center gap-1.5 text-xs"
                                >
                                  {editProductForm.inStock ? (
                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                  )}
                                  <span className={editProductForm.inStock ? 'text-green-700 dark:text-green-400 font-medium' : 'text-neutral-400 dark:text-neutral-500'}>
                                    {editProductForm.inStock ? 'En stock' : 'Sin stock'}
                                  </span>
                                </button>

                                <div className="flex-1" />

                                {/* Save / Cancel */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingProductId(null)}
                                  className="text-xs h-7 rounded-lg"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEditProduct(product.id)}
                                  disabled={savingProductId === product.id}
                                  className="text-xs h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-1"
                                >
                                  {savingProductId === product.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <><Save className="w-3 h-3" /> Guardar</>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* ═══ PRODUCT VIEW ═══ */
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{product.name}</p>
                                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{product.category?.name || 'Sin categoria'}</p>
                                </div>
                                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 shrink-0">S/ {product.price?.toFixed(2)}</p>
                              </div>

                              {product.description && (
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">{product.description}</p>
                              )}

                              {/* Actions row */}
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartEditProduct(product)}
                                  className="text-[10px] h-6 px-2 rounded-md gap-1"
                                >
                                  <Pencil className="w-3 h-3" /> Editar
                                </Button>

                                <button
                                  onClick={() => handleToggleStock(product)}
                                  className={`text-[10px] h-6 px-2 rounded-md flex items-center gap-1 transition-colors ${
                                    product.inStock
                                      ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950'
                                      : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                                  }`}
                                >
                                  {product.inStock ? (
                                    <><ToggleRight className="w-3.5 h-3.5" /> Pausar</>
                                  ) : (
                                    <><ToggleLeft className="w-3.5 h-3.5" /> Activar</>
                                  )}
                                </button>

                                <div className="flex-1" />

                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-[10px] h-6 px-2 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" /> Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ CATEGORIES SECTION ═══ */}
        {activeSection === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{categories.length} categorias</p>
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
                  <Card className="rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Nueva Categoria</h3>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Imagen</Label>
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
                        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Nombre</Label>
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

            {/* Categories Grid - now with inline name editing */}
            {categories.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border dark:border-neutral-800 p-8 sm:p-12 text-center">
                <Tag className="w-12 h-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Sin categorias</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Crea categorias para organizar tus productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {categories.map(cat => (
                  <Card key={cat.id} className="rounded-xl border dark:border-neutral-800 overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      {/* Category Image */}
                      <div
                        className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                        onClick={() => handleFileInput('image/jpeg,image/png,image/webp', 'categories', (url) => handleCategoryImageChange(cat.id, url))}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg">
                            <Camera className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                          </div>
                        </div>
                      </div>

                      {/* Category Name + Actions */}
                      <div className="p-3">
                        {editingCatId === cat.id ? (
                          /* Inline edit category name */
                          <div className="space-y-2">
                            <Input
                              value={editCatName}
                              onChange={(e) => setEditCatName(e.target.value)}
                              className="h-8 rounded-lg text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditCategory(cat.id)
                                if (e.key === 'Escape') setEditingCatId(null)
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingCatId(null)}
                                className="text-[10px] h-6 rounded-md"
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEditCategory(cat.id)}
                                disabled={savingCatId === cat.id}
                                className="text-[10px] h-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white gap-1"
                              >
                                {savingCatId === cat.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <><Save className="w-3 h-3" /> Guardar</>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{cat.name}</p>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name) }}
                                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:text-neutral-500 dark:hover:bg-red-950 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ TESTIMONIALS SECTION ═══ */}
        {activeSection === 'testimonials' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{testimonials.length} testimonios</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Resenas de clientes que se muestran en tu tienda</p>
              </div>
              <Button
                size="sm"
                onClick={addTestimonial}
                className="text-xs gap-1.5 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Testimonio
              </Button>
            </div>

            {testimonialsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
              </div>
            )}

            {!testimonialsLoading && testimonials.length === 0 && (
              <Card className="rounded-2xl border dark:border-neutral-800">
                <CardContent className="p-8 text-center">
                  <MessageSquareQuote className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Sin testimonios</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Agrega testimonios de tus clientes para generar confianza</p>
                </CardContent>
              </Card>
            )}

            {!testimonialsLoading && testimonials.map((item, idx) => (
              <Card key={item.id || `new_${idx}`} className="rounded-2xl border dark:border-neutral-800">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                      #{idx + 1} {item._isNew ? '(nuevo)' : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveTestimonial(idx)}
                        disabled={contentSaving === `testimonial_${idx}`}
                        className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                      >
                        {contentSaving === `testimonial_${idx}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Guardar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTestimonial(idx, item.id)}
                        className="h-7 w-7 text-neutral-400 hover:text-red-500 dark:text-neutral-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Nombre</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                        placeholder="Nombre del cliente"
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Rol</Label>
                      <Input
                        value={item.role}
                        onChange={(e) => updateTestimonial(idx, 'role', e.target.value)}
                        placeholder="Ej: Cliente frecuente"
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Calificacion</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateTestimonial(idx, 'rating', star)}
                          className="focus:outline-none p-0.5"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600 hover:text-amber-300'}`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1">{item.rating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Testimonio</Label>
                    <Textarea
                      value={item.content}
                      onChange={(e) => updateTestimonial(idx, 'content', e.target.value)}
                      placeholder="Escribe aqui lo que dijo el cliente..."
                      rows={3}
                      className="rounded-lg text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* ═══ FAQ SECTION ═══ */}
        {activeSection === 'faq' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{faqItems.length} preguntas frecuentes</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Preguntas y respuestas que se muestran en tu tienda</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveFaq}
                  disabled={contentSaving === 'faq'}
                  className="text-xs gap-1.5 h-8 rounded-lg"
                >
                  {contentSaving === 'faq' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar FAQ
                </Button>
                <Button
                  size="sm"
                  onClick={addFaqItem}
                  className="text-xs gap-1.5 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Pregunta
                </Button>
              </div>
            </div>

            {contentLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
              </div>
            )}

            {!contentLoading && faqItems.length === 0 && (
              <Card className="rounded-2xl border dark:border-neutral-800">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Sin preguntas frecuentes</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Agrega preguntas y respuestas para ayudar a tus clientes</p>
                </CardContent>
              </Card>
            )}

            {!contentLoading && faqItems.map((item, idx) => (
              <Card key={`faq_${idx}`} className="rounded-2xl border dark:border-neutral-800">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Pregunta #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFaqItem(idx)}
                      className="h-7 w-7 text-neutral-400 hover:text-red-500 dark:text-neutral-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Pregunta</Label>
                    <Input
                      value={item.q}
                      onChange={(e) => updateFaqItem(idx, 'q', e.target.value)}
                      placeholder="Escribe aqui la pregunta..."
                      className="h-9 rounded-lg text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Respuesta</Label>
                    <Textarea
                      value={item.a}
                      onChange={(e) => updateFaqItem(idx, 'a', e.target.value)}
                      placeholder="Escribe aqui la respuesta..."
                      rows={2}
                      className="rounded-lg text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* ═══ CONTENT SECTION ═══ */}
        {activeSection === 'content' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <AdminContent />
          </motion.div>
        )}

      </main>

      {/* Unsaved Changes Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 text-white border-t shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <p className="text-xs text-neutral-300">Tienes cambios sin guardar en la configuracion de la tienda</p>
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
                  className="text-xs h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Descartar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="text-xs h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white gap-1"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Guardar Cambios</>}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
