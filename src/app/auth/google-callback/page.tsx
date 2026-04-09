'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { SessionProvider, useSession } from 'next-auth/react'
import { Suspense } from 'react'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const hasProcessed = useRef(false)
  const [debugInfo, setDebugInfo] = useState('')

  const processLogin = useCallback(async (sessionData: NonNullable<typeof session>) => {
    if (!sessionData?.user?.email) {
      toast({ title: 'Error', description: 'No se recibió email de Google', variant: 'destructive' })
      router.push('/login')
      return
    }

    const action = searchParams.get('action') || 'login'
    const storeName = searchParams.get('storeName') || ''

    try {
      const res = await fetch('/api/auth/google/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sessionData.user.email,
          name: sessionData.user.name || '',
          picture: (sessionData.user as Record<string, unknown>).image as string || '',
          googleId: (sessionData.user as Record<string, unknown>).googleId as string || sessionData.user.email,
          action,
          storeName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error del servidor')
      }

      // Set user in auth store AND localStorage
      setUser(data, data.token)

      // Redirect based on role
      const targetUrl = data.role === 'admin' ? '/admin' : '/cliente'

      if (data.isNewUser && data.role === 'admin') {
        toast({ title: 'Tienda creada!', description: `Bienvenido a ${data.storeName}` })
      } else if (data.isNewUser) {
        toast({ title: 'Cuenta creada!', description: `Bienvenido a ${data.storeName}` })
      } else if (data.linked) {
        toast({ title: 'Cuenta vinculada', description: 'Tu Google se vinculó correctamente' })
      } else {
        toast({ title: `Bienvenido, ${data.name}!` })
      }

      // Use window.location for a full page navigation to ensure cookies are set
      window.location.href = targetUrl
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('[GoogleCallback] processLogin error:', message)
      toast({
        title: 'Error al iniciar sesión',
        description: message,
        variant: 'destructive',
        duration: 6000,
      })
      router.push('/login')
    }
  }, [searchParams, router, setUser, toast])

  useEffect(() => {
    if (hasProcessed.current) return

    // Debug logging
    setDebugInfo(`status: ${status}`)

    // Wait for session to load (give it more time)
    if (status === 'loading') return

    hasProcessed.current = true
    setDebugInfo(prev => `${prev} -> resolved: ${status}`)

    if (status === 'unauthenticated' || !session?.user) {
      const error = searchParams.get('error')
      let msg = 'No se pudo completar la autenticación con Google'

      if (error === 'AccessDenied') msg = 'Acceso denegado por Google'
      else if (error === 'Configuration') msg = 'Error de configuración del servidor. Verifica Google OAuth.'
      else if (error === 'OAuthCallback') msg = 'Error en la respuesta de Google'
      else if (!error) msg = 'La sesión de Google expiró o fue cancelada. Intenta de nuevo.'

      console.warn('[GoogleCallback] Not authenticated:', { status, error, hasSession: !!session?.user })
      toast({ title: 'Error de autenticación', description: msg, variant: 'destructive', duration: 5000 })
      router.push('/login')
      return
    }

    // Authenticated - process the login
    setDebugInfo(prev => `${prev} -> processing login for ${session.user?.email}`)
    processLogin(session!)
  }, [status, session, searchParams, router, setUser, toast, processLogin])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-neutral-400" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-900" />
          <p className="text-sm font-medium text-neutral-700">Autenticando con Google...</p>
          <p className="text-xs text-neutral-400">Un momento por favor</p>
          {/* Debug info - hidden in production */}
          {debugInfo && process.env.NODE_ENV !== 'production' && (
            <p className="text-[10px] text-neutral-300 font-mono">{debugInfo}</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <GoogleCallbackContent />
      </Suspense>
    </SessionProvider>
  )
}
