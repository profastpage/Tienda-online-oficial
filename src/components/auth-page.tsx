'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, EyeOff, ArrowRight, Store, User, Loader2, ShieldCheck } from 'lucide-react'
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

  // 2FA state
  const [pending2FA, setPending2FA] = useState<{
    email: string
    role: string
    storeId: string
    name: string
  } | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState<string[]>(['', '', '', '', '', ''])
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...twoFactorCode]
    newCode[index] = value
    setTwoFactorCode(newCode)

    // Auto-advance to next input
    if (value && index < 5) {
      digitRefs.current[index + 1]?.focus()
    }
  }, [twoFactorCode])

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    // Move to previous on backspace if current is empty
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      digitRefs.current[index - 1]?.focus()
    }
    // Handle paste
    if (e.key === 'Paste' || (e.ctrlKey && e.key === 'v')) {
      // Let the native paste handle it, but we need to handle it in onPaste
    }
  }, [twoFactorCode])

  const handleDigitPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newCode = [...twoFactorCode]
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setTwoFactorCode(newCode)

    // Focus the next empty input or the last one
    const nextEmpty = pasted.length < 6 ? pasted.length : 5
    digitRefs.current[nextEmpty]?.focus()
  }, [twoFactorCode])

  const resetTwoFactor = useCallback(() => {
    setPending2FA(null)
    setTwoFactorCode(['', '', '', '', '', ''])
    digitRefs.current[0]?.focus()
  }, [])

  const handleVerify2FA = async () => {
    const code = twoFactorCode.join('')
    if (code.length !== 6) {
      toast({ title: 'Error', description: 'Ingresa el código completo de 6 dígitos', variant: 'destructive' })
      return
    }

    if (!pending2FA) return

    setTwoFactorLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pending2FA.email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // On success, proceed with normal auth flow
      setUser(data, data.token)
      let targetUrl = redirectUrl || (data.role === 'admin' ? '/admin' : '/cliente')
      if (data.role === 'super-admin') {
        targetUrl = redirectUrl || '/super-admin'
      }
      router.push(targetUrl)
      toast({
        title: `¡Bienvenido, ${data.name}!`,
        description: data.role === 'super-admin' ? 'Panel de Super Administrador' : data.role === 'admin' ? 'Panel de administración' : 'Tu panel de cliente',
      })
    } catch (err: unknown) {
      toast({ title: 'Código inválido', description: err instanceof Error ? err.message : 'El código de verificación es incorrecto', variant: 'destructive' })
      setTwoFactorCode(['', '', '', '', '', ''])
      digitRefs.current[0]?.focus()
    } finally {
      setTwoFactorLoading(false)
    }
  }

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

      // Check if 2FA is required
      if (data.requires2FA) {
        setPending2FA({
          email: data.email,
          role: data.role,
          storeId: data.storeId,
          name: data.name,
        })
        // Focus first digit input after render
        setTimeout(() => digitRefs.current[0]?.focus(), 100)
        return
      }

      setUser(data, data.token)
      let targetUrl = redirectUrl || (data.role === 'admin' ? '/admin' : '/cliente')
      if (data.role === 'super-admin') {
        targetUrl = redirectUrl || '/super-admin'
      }
      router.push(targetUrl)
      toast({
        title: `¡Bienvenido, ${data.name}!`,
        description: data.role === 'super-admin' ? 'Panel de Super Administrador' : data.role === 'admin' ? 'Panel de administración' : 'Tu panel de cliente',
      })
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

  // 2FA Verification Screen
  if (pending2FA) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">URBAN STYLE</span>
            </a>
            <Button variant="ghost" onClick={() => router.push('/demo')}>
              ← Volver a la tienda
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-neutral-900" />
                </div>
                <CardTitle className="text-2xl">Verificación en Dos Pasos</CardTitle>
                <CardDescription className="text-base mt-1">
                  Ingresa el código de 6 dígitos de tu aplicación de autenticación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-500">
                    Verificando cuenta: <span className="font-semibold text-neutral-700">{pending2FA.email}</span>
                  </p>
                </div>

                {/* 6-digit input boxes */}
                <div className="flex justify-center gap-2.5" onPaste={handleDigitPaste}>
                  {twoFactorCode.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Input
                        ref={(el) => { digitRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold text-neutral-900 border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                        disabled={twoFactorLoading}
                      />
                    </motion.div>
                  ))}
                </div>

                <Button
                  className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold"
                  disabled={twoFactorLoading || twoFactorCode.join('').length !== 6}
                  onClick={handleVerify2FA}
                >
                  {twoFactorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                    Verificar <ArrowRight className="w-4 h-4 ml-1" />
                  </>}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetTwoFactor}
                    className="text-sm text-neutral-500 hover:text-neutral-700 underline underline-offset-4 transition-colors"
                  >
                    ← Volver al inicio de sesión
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    )
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
          <Button variant="ghost" onClick={() => router.push('/demo')}>
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
