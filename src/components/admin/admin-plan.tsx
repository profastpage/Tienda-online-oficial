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
  limits: { products: string; categories: string; orders: string; users: string }
  features: { mercadopago: boolean; analytics: boolean; custom_domain: boolean; inventory: boolean; bulk_import: boolean; priority_support: boolean }
  popular?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Gratis',
    description: 'Para tiendas que recién empiezan',
    price: 'Gratis',
    limits: { products: '10', categories: '3', orders: '20/mes', users: '1' },
    features: { mercadopago: false, analytics: false, custom_domain: false, inventory: false, bulk_import: false, priority_support: false },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para tiendas en crecimiento',
    price: 'S/ 49/mes',
    popular: true,
    limits: { products: '100', categories: '15', orders: '200/mes', users: '5' },
    features: { mercadopago: true, analytics: false, custom_domain: false, inventory: true, bulk_import: false, priority_support: false },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para tiendas profesionales',
    price: 'S/ 99/mes',
    limits: { products: '∞', categories: '∞', orders: '∞', users: '∞' },
    features: { mercadopago: true, analytics: true, custom_domain: true, inventory: true, bulk_import: true, priority_support: true },
  },
]

const FEATURE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  mercadopago: { label: 'MercadoPago', icon: CreditCard },
  analytics: { label: 'Analíticas', icon: BarChart3 },
  custom_domain: { label: 'Dominio personalizado', icon: Globe },
  inventory: { label: 'Control de inventario', icon: Package },
  bulk_import: { label: 'Importación masiva', icon: Zap },
  priority_support: { label: 'Soporte prioritario', icon: Sparkles },
}

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  pro: 'bg-sky-100 text-sky-700 border-sky-200',
  premium: 'bg-amber-100 text-amber-700 border-amber-200',
}

const PLAN_BADGE_ICONS: Record<string, string> = {
  free: '🚀',
  pro: '⚡',
  premium: '👑',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLimit(val: number): string {
  return val === 0 ? '∞' : String(val)
}

function getProgressValue(current: number, max: number): number {
  if (max === 0) return 0 // unlimited
  return Math.min((current / max) * 100, 100)
}

function getProgressColor(current: number, max: number): string {
  if (max === 0) return 'bg-emerald-500'
  const pct = (current / max) * 100
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
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
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  if (!planData) return null

  const currentPlan = planData.plan

  return (
    <div className="max-w-4xl space-y-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Compara los planes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_TIERS.map((tier) => {
            const isCurrent = tier.id === currentPlan
            const isHigher = PLAN_TIERS.findIndex((t) => t.id === tier.id) > PLAN_TIERS.findIndex((t) => t.id === currentPlan)

            return (
              <Card
                key={tier.id}
                className={`rounded-xl overflow-hidden transition-all ${
                  isCurrent
                    ? 'border-2 border-amber-400 ring-2 ring-amber-100'
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
                <CardContent className="p-5">
                  {/* Plan header */}
                  <div className="text-center mb-5">
                    <div className="text-2xl mb-2">
                      {PLAN_BADGE_ICONS[tier.id]}
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900">{tier.name}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{tier.description}</p>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-neutral-900">{tier.price}</span>
                    </div>
                  </div>

                  <Separator className="bg-neutral-100 mb-5" />

                  {/* Limits */}
                  <div className="space-y-3 mb-5">
                    <h5 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Límites</h5>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Productos', val: tier.limits.products },
                        { label: 'Categorías', val: tier.limits.categories },
                        { label: 'Pedidos', val: tier.limits.orders },
                        { label: 'Usuarios', val: tier.limits.users },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">{item.label}</span>
                          <span className="text-sm font-semibold text-neutral-900">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-neutral-100 mb-5" />

                  {/* Features */}
                  <div className="space-y-3 mb-5">
                    <h5 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Funcionalidades</h5>
                    <div className="space-y-2.5">
                      {Object.entries(tier.features).map(([key, enabled]) => {
                        const info = FEATURE_LABELS[key]
                        if (!info) return null
                        return (
                          <div key={key} className="flex items-center gap-2.5">
                            {enabled ? (
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${enabled ? 'text-neutral-700' : 'text-neutral-400'}`}>
                              {info.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action button */}
                  {isCurrent ? (
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
                  <Badge className={`text-xs font-semibold px-3 py-1 rounded-full border ${PLAN_BADGE_STYLES[upgradeTarget]}`}>
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

              {/* Quick summary of what they get */}
              {upgradeTarget === 'pro' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Incluirás:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Hasta 100 productos
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Hasta 15 categorías
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Hasta 200 pedidos/mes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Integración con MercadoPago
                    </li>
                  </ul>
                </div>
              )}
              {upgradeTarget === 'premium' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Incluirás:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Productos, categorías, pedidos ilimitados
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Analíticas avanzadas
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Dominio personalizado
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Soporte prioritario
                    </li>
                  </ul>
                </div>
              )}
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
