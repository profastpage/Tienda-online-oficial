'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, EyeOff, ArrowRight, Store, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthPageContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer')
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const email = (form.elements.namedItem('loginEmail') as HTMLInputElement).value
    const password = (form.elements.namedItem('loginPassword') as HTMLInputElement).value

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUser(data, data.token)
      const targetUrl = redirectUrl || (data.role === 'admin' ? '/admin' : '/cliente')
      router.push(targetUrl)
      toast({ title: `¡Bienvenido, ${data.name}!`, description: data.role === 'admin' ? 'Panel de administración' : 'Tu panel de cliente' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al iniciar sesión', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const name = (form.elements.namedItem('regName') as HTMLInputElement).value
    const email = (form.elements.namedItem('regEmail') as HTMLInputElement).value
    const password = (form.elements.namedItem('regPassword') as HTMLInputElement).value
    const phone = (form.elements.namedItem('regPhone') as HTMLInputElement).value
    const storeName = (form.elements.namedItem('regStoreName') as HTMLInputElement)?.value

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, role: regRole, storeName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUser(data, data.token)
      const targetUrl = data.role === 'admin' ? '/admin' : '/cliente'
      router.push(targetUrl)
      toast({ title: `¡Cuenta creada!`, description: `Bienvenido a ${data.storeName}` })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al registrar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">URBAN STYLE</span>
          </a>
          <Button variant="ghost" onClick={() => router.push('/')}>
            ← Volver a la tienda
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Bienvenido</h1>
            <p className="mt-2 text-neutral-500">Accede a tu cuenta o crea una nueva</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Email</Label>
                      <Input id="loginEmail" name="loginEmail" type="email" placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Contraseña</Label>
                      <div className="relative">
                        <Input id="loginPassword" name="loginPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••" required />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                        Ingresar <ArrowRight className="w-4 h-4 ml-1" />
                      </>}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-neutral-50 rounded-xl border text-sm">
                    <p className="font-semibold text-neutral-700 mb-2">Cuentas de prueba:</p>
                    <div className="space-y-1.5 text-neutral-500">
                      <p>🔐 <strong>Admin:</strong> admin@urbanstyle.pe / admin123</p>
                      <p>👤 <strong>Cliente:</strong> cliente@email.com / cliente123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>Regístrate como cliente o crea tu tienda</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRegRole('customer')}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${regRole === 'customer' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                      >
                        <User className="w-5 h-5 text-neutral-600" />
                        <div className="text-left">
                          <p className="text-sm font-semibold">Cliente</p>
                          <p className="text-xs text-neutral-400">Comprar productos</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('admin')}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${regRole === 'admin' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                      >
                        <Store className="w-5 h-5 text-neutral-600" />
                        <div className="text-left">
                          <p className="text-sm font-semibold">Vendedor</p>
                          <p className="text-xs text-neutral-400">Crear mi tienda</p>
                        </div>
                      </button>
                    </div>

                    {/* Store name (admin only) */}
                    {regRole === 'admin' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="regStoreName">Nombre de la Tienda</Label>
                        <Input id="regStoreName" name="regStoreName" placeholder="Mi Tienda Online" required />
                        <p className="text-xs text-neutral-400">Se creará una tienda nueva con este nombre</p>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="regName">Nombre Completo</Label>
                      <Input id="regName" name="regName" placeholder="Juan Pérez" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regEmail">Email</Label>
                      <Input id="regEmail" name="regEmail" type="email" placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPhone">Teléfono / WhatsApp</Label>
                      <Input id="regPhone" name="regPhone" placeholder="+51 999 888 777" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Contraseña</Label>
                      <Input id="regPassword" name="regPassword" type="password" placeholder="••••••" required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                        Crear Cuenta <ArrowRight className="w-4 h-4 ml-1" />
                      </>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
