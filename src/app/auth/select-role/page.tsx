'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { ShoppingBag, Store, User, Loader2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  googleId: string
}

function SelectRoleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin' | null>(null)
  const [storeName, setStoreName] = useState('')
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null)

  useEffect(() => {
    // Get user info from URL params (passed from google-callback)
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const picture = searchParams.get('picture')
    const googleId = searchParams.get('googleId')

    if (!email || !googleId) {
      toast({ title: 'Error', description: 'Información de Google incompleta', variant: 'destructive' })
      router.push('/login')
      return
    }

    setUserInfo({
      email,
      name: name || email.split('@')[0],
      picture: picture || '',
      googleId,
    })
  }, [searchParams, router, toast])

  const handleSelectRole = async (role: 'customer' | 'admin') => {
    if (!userInfo) return

    if (role === 'admin' && !storeName.trim()) {
      toast({ title: 'Error', description: 'Ingresa el nombre de tu tienda', variant: 'destructive' })
      return
    }

    setLoading(true)
    setSelectedRole(role)

    try {
      const res = await fetch('/api/auth/google/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          googleId: userInfo.googleId,
          action: role === 'admin' ? 'register-admin' : 'register-customer',
          storeName: role === 'admin' ? storeName.trim() : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error del servidor')
      }

      setUser(data, data.token)

      if (data.isNewUser && data.role === 'admin') {
        toast({ title: 'Tienda creada!', description: `Bienvenido a ${data.storeName}` })
      } else if (data.isNewUser) {
        toast({ title: 'Cuenta creada!', description: 'Bienvenido a nuestra plataforma' })
      } else {
        toast({ title: `Bienvenido, ${data.name}!` })
      }

      // Redirect based on role
      const targetUrl = data.role === 'admin' ? '/admin' : '/cliente'
      window.location.href = targetUrl
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      toast({ title: 'Error', description: message, variant: 'destructive' })
      setLoading(false)
      setSelectedRole(null)
    }
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push('/login')}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex items-center justify-center ring-4 ring-white dark:ring-neutral-800 shadow-lg">
            {userInfo.picture ? (
              <img src={userInfo.picture} alt={userInfo.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">{userInfo.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Hola, {userInfo.name}!</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{userInfo.email}</p>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">¿Cómo deseas usar la plataforma?</p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-3">
          {/* Vendedor Option */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedRole('admin')}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'admin'
                ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedRole === 'admin' ? 'bg-white/20 dark:bg-neutral-900/20' : 'bg-neutral-100 dark:bg-neutral-800'
              }`}>
                <Store className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${selectedRole === 'admin' ? 'text-white dark:text-neutral-900' : 'text-neutral-900 dark:text-neutral-100'}`}>
                  Soy Vendedor
                </h3>
                <p className={`text-sm ${selectedRole === 'admin' ? 'text-white/70 dark:text-neutral-900/70' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  Quiero crear mi tienda y vender productos online
                </p>
              </div>
            </div>
          </motion.button>

          {/* Store name input for admin */}
          {selectedRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-1"
            >
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Nombre de tu tienda
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ej: Fashion Store, Mi Tienda..."
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Este nombre aparecerá en tu URL: tienda-online-oficial.vercel.app/tu-tienda
              </p>
            </motion.div>
          )}

          {/* Cliente Option */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedRole('customer')}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'customer'
                ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedRole === 'customer' ? 'bg-white/20 dark:bg-neutral-900/20' : 'bg-neutral-100 dark:bg-neutral-800'
              }`}>
                <User className={`w-5 h-5 ${selectedRole === 'customer' ? 'text-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${selectedRole === 'customer' ? 'text-white dark:text-neutral-900' : 'text-neutral-900 dark:text-neutral-100'}`}>
                  Soy Cliente
                </h3>
                <p className={`text-sm ${selectedRole === 'customer' ? 'text-white/70 dark:text-neutral-900/70' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  Quiero comprar productos y explorar tiendas
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => selectedRole && handleSelectRole(selectedRole)}
          disabled={!selectedRole || loading || (selectedRole === 'admin' && !storeName.trim())}
          className="w-full h-12 rounded-xl font-semibold text-sm gap-2 bg-neutral-900 hover:bg-neutral-800 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              Continuar
            </>
          )}
        </Button>

        <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
        </div>
      }
    >
      <SelectRoleContent />
    </Suspense>
  )
}
