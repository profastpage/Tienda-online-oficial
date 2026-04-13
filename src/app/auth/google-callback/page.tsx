'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const processLogin = useCallback(async (sessionData: NonNullable<typeof session>) => {
    if (!sessionData?.user?.email) {
      const msg = 'No se recibió email de Google'
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
      setTimeout(() => router.push('/login'), 3000)
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
      setError(message)
      toast({
        title: 'Error al iniciar sesión',
        description: message,
        variant: 'destructive',
        duration: 6000,
      })
      setTimeout(() => router.push('/login'), 4000)
    }
  }, [searchParams, router, setUser, toast])

  useEffect(() => {
    if (hasProcessed.current) return

    // Wait for session to load
    if (status === 'loading') return

    // If unauthenticated and haven't retried yet, retry session fetch
    if (status === 'unauthenticated' && retryCount < maxRetries) {
      const retryDelay = 1000 * (retryCount + 1) // 1s, 2s, 3s
      console.log(`[GoogleCallback] No session yet, retry ${retryCount + 1}/${maxRetries} in ${retryDelay}ms`)
      const timer = setTimeout(() => setRetryCount(prev => prev + 1), retryDelay)
      return () => clearTimeout(timer)
    }

    // After all retries exhausted
    if (status === 'unauthenticated' || !session?.user) {
      hasProcessed.current = true
      const errorParam = searchParams.get('error')
      let msg = 'No se pudo completar la autenticación con Google'

      if (errorParam === 'AccessDenied') msg = 'Acceso denegado por Google'
      else if (errorParam === 'Configuration') msg = 'Error de configuración del servidor. Las credenciales de Google no están disponibles.'
      else if (errorParam === 'OAuthCallback') msg = 'Error en la respuesta de Google. Intenta de nuevo.'
      else if (errorParam === 'OAuthSignin') msg = 'Error al iniciar la conexión con Google.'
      else if (!errorParam) msg = 'La sesión de Google expiró o fue cancelada. Intenta de nuevo.'

      console.warn('[GoogleCallback] Not authenticated after retries:', { status, error: errorParam, retryCount })
      setError(msg)
      toast({ title: 'Error de autenticación', description: msg, variant: 'destructive', duration: 5000 })
      setTimeout(() => router.push('/login'), 4000)
      return
    }

    // Authenticated - process the login
    hasProcessed.current = true
    console.log('[GoogleCallback] Session found for:', session.user?.email)
    processLogin(session!)
  }, [status, session, searchParams, router, setUser, toast, processLogin, retryCount])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
          {error ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <ShoppingBag className="w-8 h-8 text-neutral-400" />
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {error ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-red-400" />
              <p className="text-sm font-medium text-red-600">Error</p>
              <p className="text-xs text-red-500 max-w-xs mx-auto">{error}</p>
              <p className="text-xs text-neutral-400">Redirigiendo al inicio de sesión...</p>
            </>
          ) : (
            <>
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-900" />
              <p className="text-sm font-medium text-neutral-700">Autenticando con Google...</p>
              <p className="text-xs text-neutral-400">Un momento por favor</p>
              {retryCount > 0 && (
                <p className="text-xs text-amber-500">Reintentando... ({retryCount}/{maxRetries})</p>
              )}
            </>
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
