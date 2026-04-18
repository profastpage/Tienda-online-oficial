'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ImageIcon,
  PackageOpen,
  Lock,
} from 'lucide-react'
import { ImageUpload } from '@/components/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  images: string
  categoryId: string
  category: Category
  isFeatured: boolean
  isNew: boolean
  inStock: boolean
  discount: number | null
  sizes: string
  colors: string
  createdAt: string
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: string
  comparePrice: string
  image: string
  additionalImages: string[]
  categoryId: string
  sizes: string
  colors: string
  discount: string
  isFeatured: boolean
  isNew: boolean
  inStock: boolean
}

const emptyForm: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  price: '',
  comparePrice: '',
  image: '',
  additionalImages: [],
  categoryId: '',
  sizes: '',
  colors: '',
  discount: '',
  isFeatured: false,
  isNew: false,
  inStock: true,
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AdminProducts() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const { toast } = useToast()
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [planLimit, setPlanLimit] = useState(2)

  const storeId = user?.storeId || ''
  const isDemoStore = storeId === 'kmpw0h5ig4o518kg4zsm5huo3'

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products?storeId=${storeId}`, { headers: authHeaders })
      if (res.ok) setProducts(await res.json())
    } catch (err) {
      console.error('[AdminProducts] fetchProducts error:', err)
      toast({ title: 'Error', description: 'No se pudieron cargar los productos', variant: 'destructive' })
    }
  }, [storeId, authHeaders, toast])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories?storeId=${storeId}`, { headers: authHeaders })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
      }
    } catch (err) {
      console.error('[AdminProducts] fetchCategories error:', err)
      toast({ title: 'Error', description: 'No se pudieron cargar las categorias', variant: 'destructive' })
    }
  }, [storeId, authHeaders, toast])

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false))
  }, [fetchProducts, fetchCategories])

  // Fetch plan limit for images
  useEffect(() => {
    async function fetchPlanLimit() {
      try {
        const res = await fetch(`/api/admin/settings?storeId=${storeId}`, { headers: authHeaders })
        if (res.ok) {
          const storeData = await res.json()
          const plan = storeData.plan || 'basico'
          // Default limits: basico=1, pro=2, premium=4
          const limits: Record<string, number> = { free: 1, basico: 1, pro: 2, premium: 4 }
          setPlanLimit(limits[plan] || 1)
        }
      } catch (err) {
        console.error('[AdminProducts] fetchPlanLimit error:', err)
      }
    }
    if (storeId) fetchPlanLimit()
  }, [storeId])

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    let extraImages: string[] = []
    try {
      extraImages = JSON.parse(product.images || '[]') as string[]
    } catch {
      extraImages = []
    }
    setEditingId(product.id)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      image: product.image,
      additionalImages: extraImages,
      categoryId: product.categoryId,
      sizes: JSON.parse(product.sizes || '[]').join(', '),
      colors: JSON.parse(product.colors || '[]').map((c: { name: string; hex: string }) => `${c.name}:${c.hex}`).join(', '),
      discount: product.discount?.toString() || '',
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      inStock: product.inStock,
    })
    setFormOpen(true)
  }

  const openDelete = (id: string) => {
    setDeletingId(id)
    setDeleteOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) return
    setSaving(true)
    try {
      const sizesArr = form.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const colorsArr = form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          const parts = c.split(':')
          return { name: parts[0]?.trim() || '', hex: parts[1]?.trim() || '#000000' }
        })

      const slug = form.slug || generateSlug(form.name)
      const body = {
        storeId,
        name: form.name,
        slug,
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        image: form.image,
        images: JSON.stringify(form.additionalImages.filter(Boolean)),
        categoryId: form.categoryId,
        sizes: sizesArr,
        colors: colorsArr,
        discount: form.discount ? parseInt(form.discount) : null,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        inStock: form.inStock,
      }

      const url = editingId
        ? `/api/admin/products`
        : `/api/admin/products`
      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { id: editingId, ...body } : body

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchProducts()
        setFormOpen(false)
        toast({ title: editingId ? 'Producto actualizado' : 'Producto creado' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo guardar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminProducts] handleSave error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/admin/products?id=${deletingId}`, { method: 'DELETE', headers: authHeaders })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingId))
        setDeleteOpen(false)
        setDeletingId(null)
        toast({ title: 'Producto eliminado' })
      } else {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast({ title: 'Error', description: err.error || 'No se pudo eliminar', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[AdminProducts] handleDelete error:', err)
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    }
  }

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.name || '—'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-neutral-200 rounded-lg text-sm"
          />
        </div>
        {isDemoStore ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <Lock className="w-4 h-4" />
            <span>Demo — Productos de solo lectura</span>
          </div>
        ) : (
          <Button
            onClick={openCreate}
            className="bg-neutral-900 hover:bg-neutral-800 text-white h-10 rounded-lg text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </Button>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((product, index) => {
              let extraImageCount = 0
              try {
                extraImageCount = (JSON.parse(product.images || '[]') as string[]).filter(Boolean).length
              } catch {
                // ignore
              }
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                >
                  <Card className="rounded-xl border-neutral-200 overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Product image */}
                        <div className="relative flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 rounded-xl object-cover bg-neutral-100"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-neutral-300" />
                            </div>
                          )}
                          {extraImageCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[9px] font-bold w-4.5 h-4.5 min-w-[18px] rounded-full flex items-center justify-center">
                              {extraImageCount + 1}
                            </span>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-neutral-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {getCategoryName(product.categoryId)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-900">
                                S/ {product.price.toFixed(2)}
                              </span>
                              {product.comparePrice && (
                                <span className="text-[11px] text-neutral-400 line-through">
                                  S/ {product.comparePrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {product.inStock ? (
                              <Badge className="bg-green-100 text-green-800 border-0 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                En stock
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-0 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Agotado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-neutral-100">
                        {isDemoStore ? (
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">Solo lectura</span>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-neutral-500 hover:text-neutral-900 text-xs gap-1.5 rounded-lg"
                              onClick={() => openEdit(product)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-neutral-500 hover:text-red-600 text-xs gap-1.5 rounded-lg"
                              onClick={() => openDelete(product.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eliminar
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-xl border-neutral-200">
              <CardContent className="py-12 px-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                    <PackageOpen className="w-7 h-7 text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      {search ? 'No se encontraron productos' : 'No hay productos aún'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {search ? 'Intenta con otra búsqueda' : 'Agrega tu primer producto para comenzar'}
                    </p>
                  </div>
                  {!search && !isDemoStore && (
                    <Button
                      onClick={openCreate}
                      className="mt-1 bg-neutral-900 hover:bg-neutral-800 text-white h-9 rounded-lg text-sm font-medium gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Producto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {filtered.length > 0 && (
          <div className="mt-3 px-1">
            <p className="text-xs text-neutral-400">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <Card className="rounded-xl border-neutral-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16">
                      Imagen
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Nombre
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                      Categoría
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                      Precio
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center hidden sm:table-cell">
                      Estado
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((product) => (
                      <TableRow
                        key={product.id}
                        className="border-neutral-50 hover:bg-neutral-50/50"
                      >
                        <TableCell>
                          <div className="relative">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-neutral-300" />
                              </div>
                            )}
                            {(() => {
                              try {
                                const extraCount = (JSON.parse(product.images || '[]') as string[]).filter(Boolean).length
                                if (extraCount > 0) {
                                  return (
                                    <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                      {extraCount + 1}
                                    </span>
                                  )
                                }
                              } catch {
                                // ignore
                              }
                              return null
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-400 md:hidden">
                              {getCategoryName(product.categoryId)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-neutral-600">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="text-sm font-semibold text-neutral-900">
                              S/ {product.price.toFixed(2)}
                            </span>
                            {product.comparePrice && (
                              <p className="text-xs text-neutral-400 line-through">
                                S/ {product.comparePrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {product.inStock ? (
                            <Badge className="bg-green-100 text-green-800 border-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                              En stock
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                              Agotado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isDemoStore ? (
                            <div className="flex items-center justify-center w-full">
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-900"
                                onClick={() => openEdit(product)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-400 hover:text-red-600"
                                onClick={() => openDelete(product.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <PackageOpen className="w-10 h-10 text-neutral-300" />
                          <p className="text-neutral-400 text-sm">
                            {search ? 'No se encontraron productos' : 'No hay productos aún'}
                          </p>
                          {!search && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 rounded-lg text-xs"
                              onClick={openCreate}
                            >
                              Crear primer producto
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-400">
                  {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Row: Name + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editingId ? form.slug : generateSlug(e.target.value),
                    })
                  }}
                  placeholder="Nombre del producto"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generado"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del producto..."
                rows={3}
                className="rounded-lg text-sm border-neutral-200 resize-none"
              />
            </div>

            {/* Row: Price + Compare + Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Precio *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Precio anterior</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  placeholder="0.00"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Descuento %</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="0"
                  className="h-10 rounded-lg text-sm border-neutral-200"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Imagen principal</Label>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                storeSlug={user?.storeSlug || 'store'}
                folder="products"
                className="w-full"
              />
              {form.image && (
                <p className="text-xs text-neutral-400 truncate max-w-xs">{form.image}</p>
              )}
            </div>

            {/* Additional Images Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-neutral-700">Imágenes adicionales</Label>
                <span className="text-xs text-muted-foreground">
                  {form.additionalImages.filter(Boolean).length}/{planLimit - 1} máximo
                </span>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Tu plan permite hasta <strong>{planLimit} imágenes</strong> por producto (1 principal + {planLimit - 1} adicionales).
              </p>
              {Array.from({ length: Math.max(planLimit - 1, 0) }).map((_, idx) => {
                const url = form.additionalImages[idx] || ''
                return (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs text-neutral-400">Imagen {idx + 2}</span>
                    <div className="flex items-center gap-2">
                      <ImageUpload
                        value={url}
                        onChange={(newUrl) => {
                          const updated = [...form.additionalImages]
                          updated[idx] = newUrl
                          setForm({ ...form, additionalImages: updated })
                        }}
                        storeSlug={user?.storeSlug || 'store'}
                        folder="products"
                        className="flex-1"
                      />
                      {url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-neutral-400 hover:text-red-600 shrink-0"
                          onClick={() => {
                            const updated = [...form.additionalImages]
                            updated[idx] = ''
                            setForm({ ...form, additionalImages: updated })
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Categoría *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => setForm({ ...form, categoryId: val })}
              >
                <SelectTrigger className="h-10 rounded-lg text-sm border-neutral-200">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Tallas <span className="text-neutral-400 font-normal">(separadas por coma)</span>
              </Label>
              <Input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="h-10 rounded-lg text-sm border-neutral-200"
              />
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Colores{' '}
                <span className="text-neutral-400 font-normal">(nombre:hex, separados por coma)</span>
              </Label>
              <Input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Negro:#000000, Blanco:#FFFFFF"
                className="h-10 rounded-lg text-sm border-neutral-200"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                <Label className="text-sm text-neutral-700">Destacado</Label>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                <Label className="text-sm text-neutral-700">Nuevo</Label>
                <Switch
                  checked={form.isNew}
                  onCheckedChange={(v) => setForm({ ...form, isNew: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                <Label className="text-sm text-neutral-700">En stock</Label>
                <Switch
                  checked={form.inStock}
                  onCheckedChange={(v) => setForm({ ...form, inStock: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="rounded-lg text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.price || !form.categoryId}
              className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm"
            >
              {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900">
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
