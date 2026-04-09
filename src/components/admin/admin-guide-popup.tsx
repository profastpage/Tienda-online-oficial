'use client'

import { useState } from 'react'
import { BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, Package, FolderOpen, Settings, CreditCard, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface GuideStep {
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

const guideSteps: GuideStep[] = [
  {
    title: 'Bienvenido al Panel de Administración',
    icon: BookOpen,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">Desde aquí puedes gestionar todos los aspectos de tu tienda online. Te guiaremos paso a paso.</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg">
            <Package className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-700">Productos</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg">
            <FolderOpen className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-700">Categorías</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg">
            <Settings className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-700">Configuración</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg">
            <CreditCard className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-700">Pagos</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Agregar Productos',
    icon: Package,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">En la sección <strong>Productos</strong> del menú lateral:</p>
        <ol className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span> Haz clic en <strong>&quot;Agregar Producto&quot;</strong></li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span> Ingresa el <strong>nombre</strong> y <strong>descripción</strong> del producto</li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span> Sube la <strong>imagen principal</strong> desde tu dispositivo</li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span> Define el <strong>precio</strong>, <strong>tallas</strong>, <strong>colores</strong> y <strong>categoría</strong></li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">5</span> Guarda y tu producto aparecerá en la tienda automáticamente</li>
        </ol>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">La cantidad de imágenes por producto depende de tu plan (Básico: 1, Pro: 2, Premium: 4)</p>
      </div>
    ),
  },
  {
    title: 'Organizar Categorías',
    icon: FolderOpen,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">Las categorías ayudan a tus clientes a encontrar productos fácilmente:</p>
        <ol className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span> Ve a <strong>&quot;Categorías&quot;</strong> en el menú</li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span> Crea categorías como: Polos, Pantalones, Accesorios, etc.</li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span> Sube una imagen para cada categoría (opcional)</li>
          <li className="flex items-start gap-2"><span className="bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span> Asigna productos a cada categoría al crearlos o editarlos</li>
        </ol>
      </div>
    ),
  },
  {
    title: 'Configurar tu Tienda',
    icon: Settings,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">En <strong>&quot;Configuración&quot;</strong> puedes personalizar:</p>
        <ul className="space-y-1.5 text-sm text-neutral-600">
          <li className="flex items-center gap-2">• <strong>Nombre y logo</strong> de tu tienda</li>
          <li className="flex items-center gap-2">• <strong>Número de WhatsApp</strong> para pedidos</li>
          <li className="flex items-center gap-2">• <strong>Dirección</strong> del negocio</li>
          <li className="flex items-center gap-2">• <strong>Descripción</strong> que aparece en la tienda</li>
          <li className="flex items-center gap-2">• <strong>Métodos de pago</strong> (Yape, Plin, transferencia, MercadoPago)</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Ver tu Tienda en Vivo',
    icon: Eye,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">¡Tu tienda ya está en línea! Tus clientes pueden ver y comprar tus productos las 24 horas.</p>
        <p className="text-sm text-neutral-600">Los pedidos llegan a tu sección <strong>&quot;Pedidos&quot;</strong> y también puedes recibirlos directamente por <strong>WhatsApp</strong>.</p>
        <p className="text-sm text-neutral-600">Si tienes el plan <strong>Pro o Premium</strong>, también puedes recibir pagos por <strong>MercadoPago</strong>.</p>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">¡Todo listo! Empieza a agregar productos y vende online.</p>
        </div>
      </div>
    ),
  },
]

export function AdminGuidePopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)

  if (!open) return null

  const currentStep = guideSteps[step]
  const Icon = currentStep.icon
  const isLast = step === guideSteps.length - 1
  const isFirst = step === 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-lg shadow-2xl">
        <CardContent className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-5">
            {guideSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-neutral-900 w-8' : 'bg-neutral-200 w-4'
                }`}
              />
            ))}
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">{currentStep.title}</h2>
          </div>

          {/* Content */}
          <div className="mb-6">{currentStep.content}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(s => s - 1)}
              disabled={isFirst}
              className="gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <span className="text-xs text-neutral-400">
              {step + 1} / {guideSteps.length}
            </span>

            {isLast ? (
              <Button
                onClick={onClose}
                className="bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Entendido
              </Button>
            ) : (
              <Button
                onClick={() => setStep(s => s + 1)}
                className="bg-neutral-900 hover:bg-neutral-800 text-white gap-1 text-sm"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
