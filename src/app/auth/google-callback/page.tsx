'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { SessionProvider, useSession, signIn } from 'next-auth/react'
import { Suspense } from 'react'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [processing, setProcessing] = useState(false)
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (hasProcessed.current) return

    if (status === 'loading') return

    // If not authenticated after Google redirect, show helpful error
    if (status === 'unauthenticated' || !session?.user) {
      hasProcessed.current = true
      const errorParam = searchParams.get('error')
      let errorMsg = 'No se pudo autenticar con Google'
      if (errorParam === 'OAuthAccountNotLinked') {
        errorMsg = 'Esta cuenta de Google ya está vinculada a otra cuenta'
      } else if (errorParam === 'AccessDenied') {
        errorMsg = 'Acceso denegado. Intenta de nuevo.'
      } else if (errorParam === 'Configuration') {
        errorMsg = 'Error de configuración. Contacta al soporte.'
      }
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' })
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session.user && !processing && !hasProcessed.current) {
      hasProcessed.current = true
      setProcessing(true)

      // Process the Google sign-in
      const action = searchParams.get('action') || 'login'
      const storeName = searchParams.get('storeName') || ''

      async function processGoogleLogin() {
        try {
          const res = await fetch('/api/auth/google/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              picture: (session.user as Record<string, unknown>).image as string || '',
              googleId: (session.user as Record<string, unknown>).googleId as string || session.user.email || '',
              action,
              storeName,
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            // Surface the actual error from the API
            throw new Error(data.error || 'Error al autenticar con Google')
          }

          setUser(data, data.token)

          // Determine redirect target
          let targetUrl = data.role === 'admin' ? '/admin' : '/cliente'
          if (data.isNewUser && data.role === 'admin') {
            toast({
              title: 'Tienda creada exitosamente!',
              description: `Bienvenido a ${data.storeName}. Configura tu tienda ahora.`,
            })
          } else if (data.isNewUser) {
            toast({
              title: 'Cuenta creada!',
              description: `Bienvenido a ${data.storeName}`,
            })
          } else if (data.linked) {
            toast({
              title: 'Cuenta vinculada',
              description: 'Tu cuenta de Google ha sido vinculada exitosamente',
            })
          } else {
            toast({
              title: `Bienvenido, ${data.name}!`,
              description: data.role === 'admin' ? 'Panel de administración' : 'Tu panel de cliente',
            })
          }

          router.push(targetUrl)
        } catch (err: unknown) {
          console.error('[GoogleCallback] Error:', err)
          const message = err instanceof Error ? err.message : 'Error al autenticar con Google'
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
            duration: 5000,
          })
          // Sign out of NextAuth session to clean up
          try { await signIn('google', { callbackUrl: '/login', redirect: false }) } catch {}
          router.push('/login')
        }
      }

      processGoogleLogin()
    }
  }, [session, status, searchParams, router, setUser, toast, processing])

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
