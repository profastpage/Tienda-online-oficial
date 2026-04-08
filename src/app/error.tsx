'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[Error] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Algo salió mal
        </h1>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
