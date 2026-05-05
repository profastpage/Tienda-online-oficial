'use client'

import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Loader2, LogIn, ArrowLeft, Eye, Monitor, Smartphone, Tablet, Save, Plus, GripVertical, Trash2, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'

const VisualEditorCore = dynamic(() => import('@/components/visual-editor/visual-editor-core'), { ssr: false })

// ═══════════════════════════════════════════════════════════
// Visual Inline Editor Page
// Payload CMS 3.0 - Live Preview with iframe + postMessage
// ═══════════════════════════════════════════════════════════

export default function VisualEditorPage() {
  const params = useParams()
  const slug = params.slug as string
  const [mounted, setMounted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [checkingOwner, setCheckingOwner] = useState(true)
  const user = useAuthStore((s) => s.user)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !user) {
      setIsOwner(false)
      setCheckingOwner(false)
      return
    }
    if (user.role === 'admin' || user.role === 'super-admin') {
      setIsOwner(true)
      setCheckingOwner(false)
      return
    }
    async function checkOwnership() {
      try {
        const res = await fetch(`/api/store/info?slug=${slug}`)
        if (res.ok) {
          const storeData = await res.json()
          setIsOwner(storeData.id === user.storeId)
        } else {
          setIsOwner(false)
        }
      } catch {
        setIsOwner(false)
      } finally {
        setCheckingOwner(false)
      }
    }
    checkOwnership()
  }, [mounted, user, slug])

  // Loading state
  if (!mounted || checkingOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-neutral-400">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Acceso Requerido</h2>
          <p className="text-sm text-neutral-400 mb-6">Debes iniciar sesion para acceder al editor visual.</p>
          <Link href={`/login?redirect=/${slug}/visual-editor`}>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <LogIn className="w-4 h-4" /> Iniciar Sesion
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings2 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-sm text-neutral-400 mb-6">No tienes permisos para editar esta tienda.</p>
          <Link href={`/${slug}`}>
            <Button variant="outline" className="w-full gap-2 text-white border-neutral-700 hover:bg-neutral-800">
              <ArrowLeft className="w-4 h-4" /> Ver Tienda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <VisualEditorCore storeSlug={slug} user={user} />
}
