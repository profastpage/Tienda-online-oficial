'use client'

import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ShoppingBag, Loader2, ArrowLeft, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'

const StoreEditor = dynamic(() => import('@/components/store-editor'), { ssr: false })

export default function EditorDeTiendaPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [mounted, setMounted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [checkingOwner, setCheckingOwner] = useState(true)
  const user = useAuthStore((s) => s.user)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current user owns this store (or is an admin)
  useEffect(() => {
    if (!mounted || !user) {
      setIsOwner(false)
      setCheckingOwner(false)
      return
    }

    // Admins can always access the editor
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Acceso Requerido</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Debes iniciar sesion para acceder al editor de tienda.
          </p>
          <Link href={`/login?redirect=/${slug}/editordetienda`}>
            <Button className="gap-2">
              <LogIn className="w-4 h-4" />
              Iniciar Sesion
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Not owner - show access denied
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Acceso Denegado</h2>
          <p className="text-sm text-neutral-500 mb-6">
            No tienes permisos para editar esta tienda. Si eres el propietario, asegurate de iniciar sesion con la cuenta correcta.
          </p>
          <div className="flex flex-col gap-2">
            <Link href={`/${slug}`}>
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Ver Tienda
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full text-neutral-500">
                Cambiar Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show editor - stays on this route after saving
  return (
    <StoreEditor
      storeSlug={slug}
      stayOnEditor={true}
    />
  )
}
