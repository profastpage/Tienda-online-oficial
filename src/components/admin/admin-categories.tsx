'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  FolderOpen,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ImageUpload } from '@/components/image-upload'
import { useAuthStore } from '@/stores/auth-store'

interface CategoryItem {
  id: string
  name: string
  slug: string
  image: string
  sortOrder: number
  _count: { products: number }
}

interface CategoryFormData {
  name: string
  slug: string
  image: string
  sortOrder: string
}

const emptyForm: CategoryFormData = {
  name: '',
  slug: '',
  image: '',
  sortOrder: '0',
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AdminCategories() {
  const user = useAuthStore((s) => s.user)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const storeId = user?.storeId || ''
  const isDemoStore = storeId === 'd1whgpglbzf8d42et5xp'

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories?storeId=${storeId}`)
      if (res.ok) setCategories(await res.json())
    } catch {
      // silent
    }
  }, [storeId])

  useEffect(() => {
    fetchCategories().finally(() => setLoading(false))
  }, [fetchCategories])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      sortOrder: cat.sortOrder.toString(),
    })
    setFormOpen(true)
  }

  const openDelete = (id: string) => {
    setDeletingId(id)
    setDeleteOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const slug = form.slug || generateSlug(form.name)
      const body = {
        storeId,
        name: form.name,
        slug,
        image: form.image,
        sortOrder: parseInt(form.sortOrder) || 0,
      }

      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { id: editingId, ...body } : body

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchCategories()
        setFormOpen(false)
      }
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/admin/categories?id=${deletingId}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== deletingId))
        setDeleteOpen(false)
        setDeletingId(null)
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end">
        {isDemoStore ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <Lock className="w-4 h-4" />
            <span>Demo — Categorías de solo lectura</span>
          </div>
        ) : (
          <Button
            onClick={openCreate}
            className="bg-neutral-900 hover:bg-neutral-800 text-white h-10 rounded-lg text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Categoría
          </Button>
        )}
      </div>

      {/* Categories table */}
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
                    Slug
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center hidden sm:table-cell">
                    Productos
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center hidden lg:table-cell">
                    Orden
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      className="border-neutral-50 hover:bg-neutral-50/50"
                    >
                      <TableCell>
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-neutral-300" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-neutral-900">{cat.name}</p>
                        <p className="text-xs text-neutral-400 md:hidden">{cat.slug}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-neutral-500 font-mono">{cat.slug}</span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                          {cat._count.products}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <span className="text-sm text-neutral-500">{cat.sortOrder}</span>
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
                              onClick={() => openEdit(cat)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-red-600"
                              onClick={() => openDelete(cat.id)}
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
                        <FolderOpen className="w-10 h-10 text-neutral-300" />
                        <p className="text-neutral-400 text-sm">No hay categorías aún</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-lg text-xs"
                          onClick={openCreate}
                        >
                          Crear primera categoría
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {categories.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">
                {categories.length} categor{categories.length !== 1 ? 'ías' : 'ía'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900">
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-2">
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
                placeholder="Nombre de la categoría"
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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Imagen de categoría</Label>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                storeSlug={user?.storeSlug || 'store'}
                folder="categories"
                className="w-full"
              />
              {!form.image && (
                <p className="text-xs text-neutral-400 mt-1">
                  O ingresa una URL directamente:
                </p>
              )}
              {!form.image || true && (
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="h-9 rounded-lg text-xs border-neutral-200"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">Orden de aparición</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                placeholder="0"
                className="h-10 rounded-lg text-sm border-neutral-200"
              />
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
              disabled={saving || !form.name}
              className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm"
            >
              {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900">
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              Esta acción eliminará la categoría permanentemente. Los productos asociados no se eliminarán.
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
