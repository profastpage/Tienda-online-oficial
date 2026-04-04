'use client'

import { useState } from 'react'
import { useViewStore } from '@/stores/view-store'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, ArrowLeft, Store, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const PLANS = [
  {
    name: 'Básico',
    price: 'S/49',
    features: ['Hasta 20 productos', '1 imagen por producto', 'Carrito + WhatsApp', 'Panel básico'],
    color: 'bg-neutral-100 text-neutral-900',
    border: 'border-neutral-200',
  },
  {
    name: 'Pro',
    price: 'S/89',
    features: ['Hasta 50 productos', '3 imágenes por producto', 'Cotizador WhatsApp IA', 'Control de inventario', 'Chat IA integrado'],
    color: 'bg-neutral-900 text-white',
    border: 'border-neutral-900',
    popular: true,
  },
  {
    name: 'Premium',
    price: 'S/129',
    features: ['Hasta 200 productos', '5 imágenes por producto', 'PWA / App nativa', 'Notificaciones push', 'IA avanzada', 'Reportes avanzados', 'Soporte 24/7'],
    color: 'bg-amber-500 text-neutral-950',
    border: 'border-amber-500',
    recommended: true,
  },
]

export default function RegisterPage() {
  const { setView } = useViewStore()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', storeName: '' })

  const handleNext = () => {
    if (step === 1 && selectedPlan) setStep(2)
    if (step === 2 && formData.name && formData.email) setStep(3)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-4xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
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
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-neutral-900' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Elige tu plan</h1>
                <p className="text-neutral-500 text-center text-sm mb-8">Selecciona el plan que mejor se adapte a tu negocio</p>
                <div className="space-y-4">
                  {PLANS.map((plan) => (
                    <Card key={plan.name} className={`cursor-pointer transition-all hover:shadow-md ${selectedPlan === plan.name ? `ring-2 ring-offset-2 ${plan.border}` : ''} ${plan.recommended ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`} onClick={() => setSelectedPlan(plan.name)}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-neutral-900">{plan.name}</h3>
                              {plan.recommended && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">RECOMENDADO</span>}
                            </div>
                            <p className="text-xl font-extrabold text-neutral-900 mt-1">{plan.price}<span className="text-sm font-normal text-neutral-500">/mes</span></p>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPlan === plan.name ? plan.color : 'bg-neutral-100'}`}>
                            {selectedPlan === plan.name ? <Check className="w-5 h-5" /> : <Store className="w-5 h-5 text-neutral-400" />}
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
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Nombre completo</label>
                    <Input placeholder="Juan Pérez" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Correo electrónico</label>
                    <Input type="email" placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Teléfono / WhatsApp</label>
                    <Input placeholder="+51 999 999 999" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Contraseña</label>
                    <Input type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="h-11" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 flex-1">Anterior</Button>
                  <Button onClick={handleNext} disabled={!formData.name || !formData.email} className="h-12 flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
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
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Nombre de la tienda</label>
                    <Input placeholder="Mi Tienda Online" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="h-11" />
                  </div>
                  <Card className="bg-neutral-50">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-neutral-900 mb-3">Resumen</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-neutral-500">Plan</span><span className="font-medium">{selectedPlan}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Nombre</span><span className="font-medium">{formData.name}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Email</span><span className="font-medium">{formData.email}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Tienda</span><span className="font-medium">{formData.storeName || '—'}</span></div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold"><span>Total</span><span>Gratis 14 días</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 flex-1">Anterior</Button>
                  <Button onClick={() => setView('store-demo')} className="h-12 flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold">
                    Crear mi Tienda <ArrowRight className="ml-2 w-4 h-4" />
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
