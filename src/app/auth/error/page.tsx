'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'Las credenciales de Google OAuth no están configuradas correctamente. Contacta al administrador.',
    AccessDenied: 'El acceso fue denegado. Intenta nuevamente.',
    Verification: 'El token de verificación ha expirado. Intenta nuevamente.',
    OAuthSignin: 'Error al iniciar el flujo de OAuth. Intenta nuevamente.',
    OAuthCallback: 'Error durante la autenticación con Google. Intenta nuevamente.',
    OAuthCreateAccount: 'No se pudo crear la cuenta con Google. Intenta de otra forma.',
    OAuthAccountNotLinked: 'Esta cuenta de Google ya está vinculada a otro usuario.',
    EmailSignin: 'Error al enviar el email de verificación.',
    SessionRequired: 'Se requiere iniciar sesión para acceder.',
    Default: 'Ocurrió un error inesperado durante la autenticación. Intenta nuevamente.',
  }

  const message = errorMessages[error || ''] || errorMessages.Default

  useEffect(() => {
    if (!error) {
      router.replace('/login')
    }
  }, [error, router])

  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-950 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Error de autenticación
          </h1>
          {error && (
            <span className="inline-block px-2.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 text-[10px] font-semibold rounded-full">
              {error}
            </span>
          )}
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {message}
        </p>

        {error === 'Configuration' && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
              ⚠️ Para el administrador:
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Agrega las variables <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">GOOGLE_CLIENT_ID</code> y{' '}
              <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">GOOGLE_CLIENT_SECRET</code> en Vercel → Settings → Environment Variables.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-2 h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </button>
      </motion.div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="w-6 h-6 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
