'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Crown,
  Check,
  X,
  Zap,
  Users,
  Package,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  BarChart3,
  Globe,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Building2,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth-store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LimitInfo {
  current: number
  max: number
  monthly?: boolean
}

interface PlanData {
  plan: string
  planName: string
  limits: {
    products: LimitInfo
    categories: LimitInfo
    orders: LimitInfo
    users: LimitInfo
  }
  features: {
    mercadopago: boolean
    analytics: boolean
    custom_domain: boolean
  }
  canUpgrade: boolean
}

interface PlanTier {
  id: string
  name: string
  description: string
  price: string
  setupFee: string | null
  limits: { products: string; categories: string; orders: string; users: string }
  features: Record<string, boolean>
  popular?: boolean
  recommended?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_TIERS: PlanTier[] = [
  {
    id: 'basico',
    name: 'Básico',
    description: 'Ideal para emprendedores',
    price: 'S/ 49/mes',
    setupFee: 'Setup: S/ 200',
    limits: { products: '50', categories: '5', orders: '50/mes', users: '1' },
    features: {
      catalogo: true,
      carrito: true,
      whatsapp: true,
      tema: true,
      ssl: true,
      responsive: true,
      mercadopago: false,
      analytics: false,
      custom_domain: false,
      inventory: false,
      bulk_import: false,
      priority_support: false,
      ai_assistant: false,
      push_notifications: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Negocios en crecimiento',
    price: 'S/ 89/mes',
    setupFee: 'Setup: S/ 250',
    popular: true,
    limits: { products: '200', categories: '15', orders: '200/mes', users: '3' },
    features: {
      catalogo: true,
      carrito: true,
      whatsapp: true,
      tema: true,
      ssl: true,
      responsive: true,
      mercadopago: true,
      analytics: false,
      custom_domain: false,
      inventory: true,
      bulk_import: false,
      priority_support: false,
      ai_assistant: false,
      push_notifications: true,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'La mejor inversión',
    price: 'S/ 129/mes',
    setupFee: 'Setup: S/ 300',
    recommended: true,
    limits: { products: '∞', categories: '∞', orders: '∞', users: '10' },
    features: {
      catalogo: true,
      carrito: true,
      whatsapp: true,
      tema: true,
      ssl: true,
      responsive: true,
      mercadopago: true,
      analytics: true,
      custom_domain: true,
      inventory: true,
      bulk_import: true,
      priority_support: true,
      ai_assistant: true,
      push_notifications: true,
    },
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    description: 'Solución a medida',
    price: 'Cotizar',
    setupFee: null,
    limits: { products: '∞', categories: '∞', orders: '∞', users: '∞' },
    features: {
      catalogo: true,
      carrito: true,
      whatsapp: true,
      tema: true,
      ssl: true,
      responsive: true,
      mercadopago: true,
      analytics: true,
      custom_domain: true,
      inventory: true,
      bulk_import: true,
      priority_support: true,
      ai_assistant: true,
      push_notifications: true,
      api_custom: true,
      erp_crm: true,
      white_label: true,
      multi_sucursal: true,
    },
  },
]

const FEATURE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  catalogo: { label: 'Catálogo digital', icon: Package },
  carrito: { label: 'Carrito de compras', icon: ShoppingCart },
  whatsapp: { label: 'Pedidos por WhatsApp', icon: CreditCard },
  tema: { label: 'Tema personalizable', icon: Sparkles },
  ssl: { label: 'SSL gratuito', icon: Globe },
  responsive: { label: 'Responsive móvil', icon: Zap },
  mercadopago: { label: 'MercadoPago', icon: CreditCard },
  analytics: { label: 'Analíticas avanzadas', icon: BarChart3 },
  custom_domain: { label: 'Dominio personalizado', icon: Globe },
  inventory: { label: 'Control de inventario', icon: Package },
  bulk_import: { label: 'Importación masiva', icon: Zap },
  priority_support: { label: 'Soporte prioritario', icon: Sparkles },
  ai_assistant: { label: 'Cotizador IA', icon: Sparkles },
  push_notifications: { label: 'Notificaciones Push', icon: Zap },
  api_custom: { label: 'API personalizada', icon: Globe },
  erp_crm: { label: 'Integración ERP/CRM', icon: Building2 },
  white_label: { label: 'White label', icon: Building2 },
  multi_sucursal: { label: 'Multi-sucursal', icon: Building2 },
}

// Only show key features in the admin plan comparison
const KEY_FEATURES = ['mercadopago', 'analytics', 'custom_domain', 'inventory', 'bulk_import', 'priority_support', 'ai_assistant', 'push_notifications']

const PLAN_BADGE_STYLES: Record<string, string> = {
  basico: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  pro: 'bg-sky-100 text-sky-700 border-sky-200',
  premium: 'bg-amber-100 text-amber-700 border-amber-200',
  empresarial: 'bg-purple-100 text-purple-700 border-purple-200',
}

const PLAN_BADGE_ICONS: Record<string, string> = {
  basico: '🚀',
  pro: '⚡',
  premium: '👑',
  empresarial: '🏢',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLimit(val: number): string {
  return val === 0 ? '∞' : String(val)
}

function getProgressValue(current: number, max: number): number {
  if (max === 0) return 0 // unlimited
  return Math.min((current / max) * 100, 100)
}

function getLimitTextColor(current: number, max: number): string {
  if (max === 0) return 'text-emerald-600'
  const pct = (current / max) * 100
  if (pct >= 100) return 'text-red-600 font-semibold'
  if (pct >= 80) return 'text-amber-600'
  return 'text-neutral-600'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPlan() {
  const user = useAuthStore((s) => s.user)
  const [planData, setPlanData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  const storeId = user?.storeId || ''

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/plan?storeId=${storeId}`)
      if (res.ok) {
        const data = await res.json()
        setPlanData(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    if (storeId) fetchPlan()
  }, [storeId, fetchPlan])

  const handleUpgrade = async () => {
    if (!upgradeTarget) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/admin/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: upgradeTarget }),
      })
      if (res.ok) {
        setUpgradeSuccess(true)
        setShowUpgradeDialog(false)
        await fetchPlan()
        setTimeout(() => setUpgradeSuccess(false), 4000)
      }
    } catch {
      // silent
    } finally {
      setUpgrading(false)
      setUpgradeTarget(null)
    }
  }

  const openUpgradeDialog = (planId: string) => {
    setUpgradeTarget(planId)
    setShowUpgradeDialog(true)
  }

  // ─── Loading skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!planData) return null

  const currentPlan = planData.plan
  const currentTier = PLAN_TIERS.find((t) => t.id === currentPlan)
  const isDemoStore = storeId === 'kmpw0h5ig4o518kg4zsm5huo3'

  return (
    <div className="max-w-5xl space-y-8">
      {/* ─── Demo Store Banner ──────────────────────────────────────────────── */}
      {isDemoStore && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Tienda Demo — Plan Premium</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Esta es la tienda de demostración oficial de Tienda Online Oficial. Tiene acceso a todas las funcionalidades Premium habilitadas.
            </p>
          </div>
        </div>
      )}

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Mi Plan</h2>
          </div>
          <p className="text-sm text-neutral-500 ml-12">
            Administra tu suscripción y revisa los límites de uso
          </p>
        </div>
        <Badge
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border self-start sm:self-auto ${PLAN_BADGE_STYLES[currentPlan]}`}
        >
          <span className="mr-1">{PLAN_BADGE_ICONS[currentPlan]}</span>
          Plan {planData.planName}
        </Badge>
      </div>

      {/* ─── Current Plan Summary ─────────────────────────────────────────────── */}
      {currentTier && (
        <Card className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                  {PLAN_BADGE_ICONS[currentPlan]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Plan {currentTier.name}</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">{currentTier.description}</p>
                  {currentTier.price !== 'Cotizar' && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-amber-600">{currentTier.price}</span>
                      {currentTier.setupFee && (
                        <span className="text-xs text-neutral-400">{currentTier.setupFee}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-neutral-400">Estado</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {upgradeSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium text-emerald-700">
            ¡Plan actualizado exitosamente!
          </span>
        </div>
      )}

      {/* ─── Usage Meters ────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Uso actual</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Products */}
          <Card className="rounded-xl border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-sky-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Productos</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-xl font-bold ${getLimitTextColor(planData.limits.products.current, planData.limits.products.max)}`}>
                  {planData.limits.products.current}
                </span>
                <span className="text-xs text-neutral-400">
                  de {formatLimit(planData.limits.products.max)}
                </span>
              </div>
              <Progress
                value={getProgressValue(planData.limits.products.current, planData.limits.products.max)}
                className="h-1.5"
              />
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="rounded-xl border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Categorías</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-xl font-bold ${getLimitTextColor(planData.limits.categories.current, planData.limits.categories.max)}`}>
                  {planData.limits.categories.current}
                </span>
                <span className="text-xs text-neutral-400">
                  de {formatLimit(planData.limits.categories.max)}
                </span>
              </div>
              <Progress
                value={getProgressValue(planData.limits.categories.current, planData.limits.categories.max)}
                className="h-1.5"
              />
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="rounded-xl border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Pedidos <span className="text-neutral-400 normal-case">(mes)</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-xl font-bold ${getLimitTextColor(planData.limits.orders.current, planData.limits.orders.max)}`}>
                  {planData.limits.orders.current}
                </span>
                <span className="text-xs text-neutral-400">
                  de {formatLimit(planData.limits.orders.max)}
                </span>
              </div>
              <Progress
                value={getProgressValue(planData.limits.orders.current, planData.limits.orders.max)}
                className="h-1.5"
              />
            </CardContent>
          </Card>

          {/* Users */}
          <Card className="rounded-xl border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Usuarios</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-xl font-bold ${getLimitTextColor(planData.limits.users.current, planData.limits.users.max)}`}>
                  {planData.limits.users.current}
                </span>
                <span className="text-xs text-neutral-400">
                  de {formatLimit(planData.limits.users.max)}
                </span>
              </div>
              <Progress
                value={getProgressValue(planData.limits.users.current, planData.limits.users.max)}
                className="h-1.5"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Features Status ─────────────────────────────────────────────────── */}
      <Card className="rounded-xl border-neutral-200">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Funcionalidades del plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(planData.features).map(([key, enabled]) => {
              const info = FEATURE_LABELS[key]
              if (!info) return null
              const Icon = info.icon
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    enabled
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-neutral-50 border-neutral-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      enabled ? 'bg-emerald-100' : 'bg-neutral-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${enabled ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${enabled ? 'text-emerald-700' : 'text-neutral-500'}`}>
                      {info.label}
                    </p>
                    <p className={`text-[11px] ${enabled ? 'text-emerald-500' : 'text-neutral-400'}`}>
                      {enabled ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    {enabled ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-300" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Plan Comparison Cards ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-900">Compara los planes</h3>
          <span className="text-xs text-neutral-400">Precios en soles peruanos (S/)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_TIERS.map((tier) => {
            const isCurrent = tier.id === currentPlan
            const isHigher = PLAN_TIERS.findIndex((t) => t.id === tier.id) > PLAN_TIERS.findIndex((t) => t.id === currentPlan)

            return (
              <Card
                key={tier.id}
                className={`rounded-xl overflow-hidden transition-all ${
                  isCurrent
                    ? 'border-2 border-amber-400 ring-2 ring-amber-100'
                    : tier.recommended
                      ? 'border-2 border-amber-200'
                      : tier.popular
                        ? 'border-2 border-sky-200'
                        : 'border-neutral-200'
                }`}
              >
                {tier.popular && (
                  <div className="bg-sky-500 text-white text-center py-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Más popular</span>
                  </div>
                )}
                {tier.recommended && (
                  <div className="bg-amber-500 text-white text-center py-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Recomendado</span>
                  </div>
                )}
                <CardContent className="p-5">
                  {/* Plan header */}
                  <div className="text-center mb-4">
                    <div className="text-2xl mb-2">
                      {PLAN_BADGE_ICONS[tier.id]}
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900">{tier.name}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{tier.description}</p>
                    <div className="mt-2">
                      <span className={`text-xl font-bold ${tier.price === 'Cotizar' ? 'text-purple-600' : 'text-neutral-900'}`}>
                        {tier.price}
                      </span>
                    </div>
                    {tier.setupFee && (
                      <p className="text-[10px] text-neutral-400 mt-1">{tier.setupFee}</p>
                    )}
                  </div>

                  <Separator className="bg-neutral-100 mb-4" />

                  {/* Limits */}
                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Productos', val: tier.limits.products },
                      { label: 'Categorías', val: tier.limits.categories },
                      { label: 'Pedidos', val: tier.limits.orders },
                      { label: 'Usuarios', val: tier.limits.users },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-neutral-600">{item.label}</span>
                        <span className="text-xs font-semibold text-neutral-900">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-neutral-100 mb-4" />

                  {/* Key Features */}
                  <div className="space-y-2 mb-4">
                    {KEY_FEATURES.map((key) => {
                      const enabled = tier.features[key] === true
                      const info = FEATURE_LABELS[key]
                      if (!info) return null
                      return (
                        <div key={key} className="flex items-center gap-2">
                          {enabled ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${enabled ? 'text-neutral-700' : 'text-neutral-400'}`}>
                            {info.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Action button */}
                  {tier.id === 'empresarial' ? (
                    <Button
                      className="w-full h-10 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        const msg = encodeURIComponent('Hola! Me interesa el plan Empresarial para Tienda Online Oficial.')
                        window.open(`https://wa.me/51933667414?text=${msg}`, '_blank')
                      }}
                    >
                      <Building2 className="w-4 h-4 mr-1.5" />
                      Contactar Ventas
                    </Button>
                  ) : isCurrent ? (
                    <Button
                      className="w-full h-10 rounded-lg text-sm font-medium border-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      disabled
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Plan actual
                    </Button>
                  ) : isHigher ? (
                    <Button
                      className="w-full h-10 rounded-lg text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white"
                      onClick={() => openUpgradeDialog(tier.id)}
                    >
                      <Crown className="w-4 h-4 mr-1.5" />
                      Actualizar a {tier.name}
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-10 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-400"
                      disabled
                    >
                      Plan inferior
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ─── Upgrade Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={showUpgradeDialog} onOpenChange={(open) => !open && setShowUpgradeDialog(false)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Actualizar Plan
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Confirma la actualización de tu plan de suscripción
            </DialogDescription>
          </DialogHeader>

          {upgradeTarget && (
            <div className="space-y-4 py-2">
              {/* Current → New plan indicator */}
              <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-center">
                  <span className="text-xs text-neutral-400 block mb-1">Actual</span>
                  <Badge className={`text-xs font-semibold px-3 py-1 rounded-full border ${PLAN_BADGE_STYLES[currentPlan]}`}>
                    {PLAN_BADGE_ICONS[currentPlan]} {planData.planName}
                  </Badge>
                </div>
                <div className="text-neutral-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
                <div className="text-center">
                  <span className="text-xs text-neutral-400 block mb-1">Nuevo</span>
                  <Badge className={`text-xs font-semibold px-3 py-1 rounded-full border ${PLAN_BADGE_STYLES[upgradeTarget] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                    {PLAN_BADGE_ICONS[upgradeTarget]} {PLAN_TIERS.find((t) => t.id === upgradeTarget)?.name}
                  </Badge>
                </div>
              </div>

              {/* Warning note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Esta es una demostración. En producción, el cambio de plan requerirá un proceso de pago con MercadoPago.
                </p>
              </div>

              {/* Quick summary */}
              {upgradeTarget && (() => {
                const target = PLAN_TIERS.find((t) => t.id === upgradeTarget)
                if (!target) return null
                return (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Incluirás:</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> {target.limits.products} productos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> {target.limits.categories} categorías
                      </li>
                      <li className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> {target.limits.orders} pedidos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> {target.price} por mes
                      </li>
                    </ul>
                  </div>
                )
              })()}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowUpgradeDialog(false)}
              disabled={upgrading}
              className="h-10 rounded-lg text-sm text-neutral-500 hover:text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="h-10 rounded-lg text-sm font-medium gap-2 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {upgrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  Confirmar actualización
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
