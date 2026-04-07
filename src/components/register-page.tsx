'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, ArrowLeft, Store, Check, Eye, EyeOff, Loader2, Shield, Zap, HeadphonesIcon, Smartphone, BarChart3, Bot, MessageCircle, Globe, Clock, Lock, Settings, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

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
    color: 'bg-neutral-100 text-neutral-900',
    border: 'border-neutral-200',
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
    color: 'bg-neutral-900 text-white',
    border: 'border-neutral-900',
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
    color: 'bg-amber-500 text-neutral-950',
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
      toast({ title: 'Tienda creada exitosamente!', description: `Bienvenido a ${data.storeName}. Configura tu tienda ahora.`, duration: 3000 })
      router.push('/admin')
    } catch (err: unknown) {
      toast({ title: 'Error al registrar', description: err instanceof Error ? err.message : 'Intenta de nuevo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedPlan = () => PLANS.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-4xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-neutral-900">TIENDA ONLINE</span>
          </div>
          <span className="text-xs text-neutral-400">Paso {step} de 3</span>
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
                  step >= s.num ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                {s.num < 3 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-neutral-900' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Elige tu plan</h1>
                <p className="text-neutral-500 text-center text-sm mb-8">Selecciona el plan que impulse tu negocio</p>

                {/* Setup info banner */}
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Settings className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Setup inicial incluido en todos los planes</p>
                      <p className="text-xs text-amber-700 mt-1">Te ayudamos a configurar tu tienda paso a paso. Sin costo adicional.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {PLANS.map((plan) => (
                    <Card key={plan.id} className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedPlan === plan.id ? `ring-2 ring-offset-2 ${plan.border}` : ''
                    } ${plan.recommended ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`} onClick={() => setSelectedPlan(plan.id)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-neutral-900">{plan.name}</h3>
                              {plan.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">POPULAR</span>}
                              {plan.recommended && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">RECOMENDADO</span>}
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">{plan.description}</p>
                            <p className="text-xl font-extrabold text-neutral-900 mt-2">{plan.price}<span className="text-sm font-normal text-neutral-500">/mes</span></p>
                            {plan.setupFee && (
                              <p className="text-xs text-neutral-500 mt-0.5">+ pago único instalación <span className="font-bold text-neutral-700">{plan.setupFee}</span></p>
                            )}
                            <p className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {plan.setupIncluded}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {plan.features.slice(0, 4).map((f) => (
                                <span key={f} className="text-[10px] px-2 py-0.5 bg-neutral-50 text-neutral-600 rounded-full border border-neutral-100">
                                  {f}
                                </span>
                              ))}
                              {plan.features.length > 4 && (
                                <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-medium">
                                  +{plan.features.length - 4} más
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedPlan === plan.id ? plan.color : 'bg-neutral-100'}`}>
                            {selectedPlan === plan.id ? <Check className="w-5 h-5" /> : <Store className="w-5 h-5 text-neutral-400" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button onClick={handleNext} disabled={!selectedPlan} className="w-full mt-6 h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
                  Continuar <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Tus datos</h1>
                <p className="text-neutral-500 text-center text-sm mb-8">Ingresa tu información personal</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Nombre completo *</label>
                    <Input placeholder="Juan Pérez" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Correo electrónico *</label>
                    <Input type="email" placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Teléfono / WhatsApp</label>
                    <Input placeholder="+51 999 999 999" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Contraseña *</label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordTooShort && (
                      <p className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Confirmar contraseña *</label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                    )}
                    {formData.confirmPassword && !passwordMismatch && formData.password === formData.confirmPassword && (
                      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Las contraseñas coinciden
                      </p>
                    )}
                  </div>
                </div>

                {/* Security notice */}
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500">Tu contraseña está protegida con encriptación de grado militar (bcrypt). Nunca compartimos tus datos.</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 flex-1">Anterior</Button>
                  <Button onClick={handleNext} disabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword || passwordMismatch || passwordTooShort} className="h-12 flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
                    Continuar <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Tu tienda</h1>
                <p className="text-neutral-500 text-center text-sm mb-8">Datos de tu nueva tienda online</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Nombre de la tienda *</label>
                    <Input placeholder="Mi Tienda Online" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="h-11" />
                    <p className="text-xs text-neutral-400 mt-1">Este nombre será visible para tus clientes</p>
                  </div>

                  {/* Plan summary */}
                  {getSelectedPlan() && (() => {
                    const plan = getSelectedPlan()!
                    return (
                    <Card className="bg-neutral-50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.color}`}>
                            {plan.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900">Plan {plan.name}</h3>
                            <p className="text-xs text-neutral-500">{plan.description}</p>
                          </div>
                        </div>

                        <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">Incluye:</h4>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {plan.features.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-2 text-xs">
                              <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-neutral-600">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                            <Settings className="w-3.5 h-3.5" />
                            Setup: {plan.setupIncluded}
                          </p>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-neutral-500">Plan</span><span className="font-medium">{plan.name}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500">Mensualidad</span><span className="font-bold text-amber-600">{plan.price}{plan.period}</span></div>
                          {plan.setupFee && <div className="flex justify-between"><span className="text-neutral-500">Instalación (pago único)</span><span className="font-bold text-neutral-700">{plan.setupFee}</span></div>}
                          <div className="flex justify-between"><span className="text-neutral-500">Nombre</span><span className="font-medium">{formData.name}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500">Email</span><span className="font-medium">{formData.email}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500">Tienda</span><span className="font-medium">{formData.storeName || '—'}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })()}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 flex-1">Anterior</Button>
                  <Button onClick={handleRegister} disabled={loading || !formData.storeName} className="h-12 flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold">
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
