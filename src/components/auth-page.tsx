'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, EyeOff, ArrowRight, Store, User, Loader2, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

function AuthPageContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  // Check for reset token in URL params
  const urlResetToken = searchParams.get('reset')
  if (urlResetToken && !showResetPassword && !resetToken) {
    setResetToken(urlResetToken)
    setShowResetPassword(true)
    setShowForgotPassword(false)
  }

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

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setForgotSent(true)
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al enviar solicitud', variant: 'destructive' })
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetLoading(true)
    try {
      const form = e.currentTarget
      const newPassword = (form.elements.namedItem('resetNewPassword') as HTMLInputElement).value
      const confirmPassword = (form.elements.namedItem('resetConfirmPassword') as HTMLInputElement).value

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResetDone(true)
      toast({ title: '¡Contraseña actualizada!', description: 'Ya puedes iniciar sesión con tu nueva contraseña.' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al restablecer la contraseña', variant: 'destructive' })
    } finally {
      setResetLoading(false)
    }
  }

  const backToLogin = () => {
    setShowForgotPassword(false)
    setShowResetPassword(false)
    setForgotSent(false)
    setResetDone(false)
    setForgotEmail('')
    setResetToken('')
    // Clean URL param without reload
    window.history.replaceState({}, '', '/login')
  }

  // Forgot Password Screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <header className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">URBAN STYLE</span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Button variant="ghost" onClick={() => router.push('/demo')}>← Volver a la tienda</Button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                  {forgotSent ? <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" /> : <KeyRound className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />}
                </div>
                <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
                <CardDescription className="text-base mt-1">
                  {forgotSent ? 'Revisa tu bandeja de entrada' : 'Ingresa tu email para recibir un enlace de recuperación'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {forgotSent ? (
                  <>
                    <div className="text-center space-y-3">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Enviamos un enlace a <span className="font-semibold text-neutral-900 dark:text-neutral-100">{forgotEmail}</span>
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Si no lo encuentras, revisa tu carpeta de spam. El enlace expira en 15 minutos.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Button className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" onClick={backToLogin}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio de sesión
                      </Button>
                      <button
                        type="button"
                        onClick={() => { setForgotSent(false); setForgotEmail('') }}
                        className="w-full text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-4 transition-colors"
                      >
                        Enviar a otro email
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgotEmail">Email</Label>
                        <Input id="forgotEmail" name="forgotEmail" type="email" placeholder="tu@email.com" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" disabled={forgotLoading || !forgotEmail}>
                        {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>
                          Enviar enlace <ArrowRight className="w-4 h-4 ml-1" />
                        </>)}
                      </Button>
                    </form>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={backToLogin}
                        className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-4 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3 inline mr-1" /> Volver al inicio de sesión
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    )
  }

  // Reset Password Screen
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <header className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">URBAN STYLE</span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Button variant="ghost" onClick={() => router.push('/demo')}>← Volver a la tienda</Button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                  {resetDone ? <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" /> : <KeyRound className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />}
                </div>
                <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
                <CardDescription className="text-base mt-1">
                  {resetDone ? 'Tu contraseña ha sido actualizada' : 'Ingresa tu nueva contraseña'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {resetDone ? (
                  <>
                    <div className="text-center space-y-3">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Tu contraseña se ha actualizado correctamente.
                      </p>
                    </div>
                    <Button className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" onClick={backToLogin}>
                      Ir a iniciar sesión <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resetNewPassword">Nueva Contraseña</Label>
                        <Input id="resetNewPassword" name="resetNewPassword" type="password" placeholder="••••••••" required minLength={6} />
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">Mínimo 6 caracteres</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resetConfirmPassword">Confirmar Contraseña</Label>
                        <Input id="resetConfirmPassword" name="resetConfirmPassword" type="password" placeholder="••••••••" required minLength={6} />
                      </div>
                      <Button type="submit" className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" disabled={resetLoading}>
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>
                          Restablecer contraseña <ArrowRight className="w-4 h-4 ml-1" />
                        </>)}
                      </Button>
                    </form>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => { setShowResetPassword(false); setShowForgotPassword(true); setResetToken('') }}
                        className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-4 transition-colors"
                      >
                        Solicitar un nuevo enlace
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    )
  }

  // 2FA Verification Screen
  if (pending2FA) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <header className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">URBAN STYLE</span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Button variant="ghost" onClick={() => router.push('/demo')}>
                ← Volver a la tienda
              </Button>
            </div>
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
                <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />
                </div>
                <CardTitle className="text-2xl">Verificación en Dos Pasos</CardTitle>
                <CardDescription className="text-base mt-1">
                  Ingresa el código de 6 dígitos de tu aplicación de autenticación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Verificando cuenta: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{pending2FA.email}</span>
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
                        className="w-12 h-14 text-center text-xl font-bold text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
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
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-4 transition-colors"
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
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">URBAN STYLE</span>
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Button variant="ghost" onClick={() => router.push('/demo')}>
              ← Volver a la tienda
            </Button>
          </div>
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
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Bienvenido</h1>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">Accede a tu cuenta o crea una nueva</p>
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
                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={() => {
                      const baseUrl = window.location.origin
                      signIn('google', { callbackUrl: `${baseUrl}/auth/google-callback?action=login` })
                    }}
                    className="w-full flex items-center justify-center gap-3 h-11 px-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all font-medium text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuar con Google
                  </button>

                  {/* Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 font-medium">o continúa con tu email</span>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Email</Label>
                      <Input id="loginEmail" name="loginEmail" type="email" placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Contraseña</Label>
                      <div className="relative">
                        <Input id="loginPassword" name="loginPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••" required />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-4 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-semibold" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                        Ingresar <ArrowRight className="w-4 h-4 ml-1" />
                      </>}
                    </Button>
                  </form>

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
                    {/* Role selection - FIRST, before Google button */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">¿Cómo quieres registrarte?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRegRole('customer')}
                          className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${regRole === 'customer' ? 'border-neutral-900 bg-neutral-50 dark:bg-neutral-800 shadow-sm' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${regRole === 'customer' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
                            <User className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold">Cliente</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">Comprar productos</p>
                          </div>
                          {regRole === 'customer' && (
                            <div className="w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('admin')}
                          className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${regRole === 'admin' ? 'border-neutral-900 bg-neutral-50 dark:bg-neutral-800 shadow-sm' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${regRole === 'admin' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
                            <Store className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold">Vendedor</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">Crear mi tienda</p>
                          </div>
                          {regRole === 'admin' && (
                            <div className="w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Store name (admin only) - show before Google button */}
                    {regRole === 'admin' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="regStoreNameGoogle">Nombre de la Tienda</Label>
                        <Input id="regStoreNameGoogle" name="regStoreName" placeholder="Mi Tienda Online" required />
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">Se creará una tienda nueva con este nombre</p>
                      </motion.div>
                    )}

                    {/* Google Sign Up - AFTER role selection */}
                    <button
                      type="button"
                      onClick={() => {
                        const baseUrl = window.location.origin
                        const action = regRole === 'admin' ? 'register-admin' : 'register'
                        const storeNameInput = document.querySelector('input[name="regStoreName"]') as HTMLInputElement
                        const storeName = regRole === 'admin' && storeNameInput ? storeNameInput.value : ''
                        if (regRole === 'admin' && !storeName) {
                          toast({ title: 'Error', description: 'Ingresa el nombre de tu tienda', variant: 'destructive' })
                          return
                        }
                        signIn('google', { callbackUrl: `${baseUrl}/auth/google-callback?action=${action}${storeName ? `&storeName=${encodeURIComponent(storeName)}` : ''}` })
                      }}
                      className="w-full flex items-center justify-center gap-3 h-12 px-4 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all font-medium text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Registrarse con Google ({regRole === 'admin' ? 'Vendedor' : 'Cliente'})
                    </button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 font-medium">o regístrate con tu email</span>
                      </div>
                    </div>

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
