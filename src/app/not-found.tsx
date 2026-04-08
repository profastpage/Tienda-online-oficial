import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Store } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Store className="w-8 h-8 text-neutral-400" />
        </div>
        <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-neutral-700 mb-2">
          Página no encontrada
        </h2>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          La página que buscas no existe o fue movida. Ve al inicio para continuar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-neutral-900 hover:bg-neutral-800 text-white">
            <Link href="/">
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">
              Iniciar sesión
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
