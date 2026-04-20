'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, ArrowLeft, Store, Check, Eye, EyeOff, Loader2, Shield, Zap, HeadphonesIcon, Smartphone, BarChart3, Bot, MessageCircle, Globe, Clock, Lock, Settings, CreditCard } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: 'S/49',
    period: '/mes',
    setupFee: 'S/200',
    description: 'Ideal para emprendedores que inician',
    features: [
      'Hasta 50 productos',
      '1 usuario administrador',
      'Catálogo digital con fotos',
      'Carrito de compras',
      'Pedidos por WhatsApp',
      'Panel de administración básico',
      'Tema personalizable',
      'Soporte por email (48h)',
      'SSL gratuito',
      'Responsive móvil',
      'Setup inicial incluido',
    ],
    setupIncluded: 'Asistente de configuración guiada',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
    border: 'border-neutral-200 dark:border-neutral-700',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'S/89',
    period: '/mes',
    setupFee: 'S/250',
    description: 'Para negocios en crecimiento',
    features: [
      'Hasta 200 productos',
      '3 usuarios administrador',
      'Catálogo digital con fotos',
      'Carrito de compras avanzado',
      'WhatsApp Business API',
      'Panel de métricas y reportes',
      '\uD83D\uDCF1 PWA App instalable',
      'Notificaciones de pedidos',
      'Control de inventario',
      'Categorías ilimitadas',
      'Tema premium personalizable',
      'Soporte prioritario (12h)',
      'SSL + backups automáticos',
      'Setup + capacitación video',
    ],
    setupIncluded: 'Configuración asistida + capacitación en video',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    border: 'border-neutral-900 dark:border-neutral-100',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'S/129',
    period: '/mes',
    setupFee: 'S/300',
    description: 'La mejor inversión para escalar',
    features: [
      'Productos ilimitados',
      '10 usuarios administrador',
      'Catálogo digital con fotos múltiples',
      'Carrito de compras avanzado',
      'WhatsApp Business Pro',
      'Panel avanzado con gráficos',
      '\uD83D\uDCF1 PWA App instalable',
      '\uD83D\uDD14 Notificaciones push reales (desde panel admin)',
      '\uD83E\uDD16 Cotizador IA integrado',
      '\uD83D\uDCAC Chat IA para clientes',
      'Reportes avanzados CSV/PDF',
      'Control de inventario con alertas',
      'Dominio personalizado',
      'Optimización SEO',
      'Integración Yape/Plin',
      'Soporte 24/7 (2h)',
      'SSL gratuito + backups diarios',
      'Setup personalizado + onboarding 1a1',
    ],
    setupIncluded: 'Setup completo personalizado + onboarding 1a1 + 30 días de acompañamiento',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-amber-500 text-neutral-950 dark:text-neutral-900',
    border: 'border-amber-500',
    recommended: true,
  },
]

function Star({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', storeName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordMismatch = Boolean(formData.confirmPassword && formData.password !== formData.confirmPassword)
  const passwordTooShort = Boolean(formData.password && formData.password.length < 6)

  const handleNext = () => {
    if (step === 1 && selectedPlan) setStep(2)
    if (step === 2 && formData.name && formData.email && formData.password && formData.confirmPassword && !passwordMismatch && !passwordTooShort) setStep(3)
  }

  const handleRegister = async () => {
    if (!selectedPlan || !formData.name || !formData.email || !formData.password || !formData.storeName) return
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }
    if (formData.password.length < 6) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: 'admin',
          storeName: formData.storeName,
          plan: selectedPlan,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUser(data, data.token)
      toast({ title: 'Tienda creada exitosamente!', description: `Bienvenido a ${data.storeName}. Configura tu tienda ahora.` })
      router.push('/admin')
    } catch (err: unknown) {
      toast({ title: 'Error al registrar', description: err instanceof Error ? err.message : 'Intenta de nuevo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedPlan = () => PLANS.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="mx-auto max-w-4xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">TIENDA ONLINE</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-neutral-400 dark:text-neutral-500">Paso {step} de 3</span>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[
              { num: 1, label: 'Plan' },
              { num: 2, label: 'Datos' },
              { num: 3, label: 'Tienda' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s.num ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                }`}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                {s.num < 3 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">Elige tu plan</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-center text-sm mb-8">Selecciona el plan que impulse tu negocio</p>

                {/* Setup info banner */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Setup inicial incluido en todos los planes</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Te ayudamos a configurar tu tienda paso a paso. Sin costo adicional.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {PLANS.map((plan) => (
                    <Card key={plan.id} className={`cursor-pointer transition-all hover:shadow-lg dark:shadow-neutral-900/50 ${
                      selectedPlan === plan.id ? `ring-2 ring-offset-2 dark:ring-offset-neutral-900 ${plan.border}` : ''
                    } ${plan.recommended ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-neutral-900' : ''}`} onClick={() => setSelectedPlan(plan.id)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</h3>
                              {plan.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">POPULAR</span>}
                              {plan.recommended && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">RECOMENDADO</span>}
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{plan.description}</p>
                            <p className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">{plan.price}<span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">/mes</span></p>
                            {plan.setupFee && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">+ pago único instalación <span className="font-bold text-neutral-700 dark:text-neutral-300">{plan.setupFee}</span></p>
                            )}
                            <p className="text-[11px] text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {plan.setupIncluded}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {plan.features.slice(0, 4).map((f) => (
                                <span key={f} className="text-[10px] px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full border border-neutral-100 dark:border-neutral-700">
                                  {f}
                                </span>
                              ))}
                              {plan.features.length > 4 && (
                                <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-full border border-amber-100 dark:border-amber-800/30 font-medium">
                                  +{plan.features.length - 4} más
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedPlan === plan.id ? plan.color : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                            {selectedPlan === plan.id ? <Check className="w-5 h-5" /> : <Store className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button onClick={handleNext} disabled={!selectedPlan} className="w-full mt-6 h-12 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold">
                  Continuar <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">Tus datos</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-center text-sm mb-8">Ingresa tu información personal</p>
                <div className="space-y-4">
                  {/* Google Sign Up Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const storeNameParam = formData.storeName || ''
                      signIn('google', { callbackUrl: `/auth/google-callback?action=register-admin&storeName=${encodeURIComponent(storeNameParam)}` })
                    }}
                    className="w-full flex items-center justify-center gap-3 h-11 px-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all font-medium text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Registrarse con Google
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 font-medium">o completa manualmente</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Nombre completo *</label>
                    <Input placeholder="Juan Pérez" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Correo electrónico *</label>
                    <Input type="email" placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Teléfono / WhatsApp</label>
                    <Input placeholder="+51 999 999 999" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Contraseña *</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordTooShort && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">La contraseña debe tener al menos 6 caracteres</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Confirmar contraseña *</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={`h-11 pr-10 ${passwordMismatch ? 'border-red-500 focus-visible:ring-red-500' : formData.confirmPassword && !passwordMismatch ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">Las contraseñas no coinciden</p>
                    )}
                    {formData.confirmPassword && !passwordMismatch && formData.password === formData.confirmPassword && (
                      <p className="text-xs text-green-500 dark:text-green-400 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Las contraseñas coinciden
                      </p>
                    )}
                  </div>
                </div>

                {/* Security notice */}
                <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-700 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Tu contraseña está protegida con encriptación de grado militar (bcrypt). Nunca compartimos tus datos.</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 flex-1">Anterior</Button>
                  <Button onClick={handleNext} disabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword || passwordMismatch || passwordTooShort} className="h-12 flex-1 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold">
                    Continuar <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">Tu tienda</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-center text-sm mb-8">Datos de tu nueva tienda online</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Nombre de la tienda *</label>
                    <Input placeholder="Mi Tienda Online" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="h-11" />
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Este nombre será visible para tus clientes</p>
                  </div>

                  {/* Plan summary */}
                  {getSelectedPlan() && (() => {
                    const plan = getSelectedPlan()!
                    return (
                    <Card className="bg-neutral-50 dark:bg-neutral-900">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.color}`}>
                            {plan.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Plan {plan.name}</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{plan.description}</p>
                          </div>
                        </div>

                        <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">Incluye:</h4>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {plan.features.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-2 text-xs">
                              <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                              <span className="text-neutral-600 dark:text-neutral-400">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-800/30">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1">
                            <Settings className="w-3.5 h-3.5" />
                            Setup: {plan.setupIncluded}
                          </p>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Plan</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{plan.name}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Mensualidad</span><span className="font-bold text-amber-600 dark:text-amber-400">{plan.price}{plan.period}</span></div>
                          {plan.setupFee && <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Instalación (pago único)</span><span className="font-bold text-neutral-700 dark:text-neutral-300">{plan.setupFee}</span></div>}
                          <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Nombre</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{formData.name}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Email</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{formData.email}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Tienda</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{formData.storeName || '—'}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })()}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 flex-1">Anterior</Button>
                  <Button onClick={handleRegister} disabled={loading || !formData.storeName} className="h-12 flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 dark:text-neutral-900 font-semibold">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</> : <>
                      Crear mi Tienda <ArrowRight className="ml-2 w-4 h-4" />
                    </>}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
