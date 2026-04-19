import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { checkPlanLimit, canUseFeature, getPlanConfig, canUpgradeTo } from '@/lib/plan-limits'
import { ensureStoreExists } from '@/lib/store-helpers'

const VALID_PLANS = ['basico', 'pro', 'premium', 'empresarial']

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const storeId = auth.user.storeId

    // Ensure store exists
    await ensureStoreExists(db, storeId)

    // Get store plan
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { plan: true },
    })
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const plan = store.plan || 'basico'
    const config = getPlanConfig(plan)

    // Check all limits in parallel
    const [products, categories, orders, users] = await Promise.all([
      checkPlanLimit(db, storeId, 'products', plan),
      checkPlanLimit(db, storeId, 'categories', plan),
      checkPlanLimit(db, storeId, 'orders', plan),
      checkPlanLimit(db, storeId, 'users', plan),
    ])

    const limits = {
      products: { current: products.current, max: products.limit },
      categories: { current: categories.current, max: categories.limit },
      orders: { current: orders.current, max: orders.limit, monthly: true },
      users: { current: users.current, max: users.limit },
    }

    const features = {
      mercadopago: canUseFeature(plan, 'mercadopago'),
      analytics: canUseFeature(plan, 'analytics'),
      custom_domain: canUseFeature(plan, 'custom_domain'),
    }

    // Can upgrade if not already premium
    const canUpgrade = plan !== 'premium'

    return NextResponse.json({
      plan,
      planName: config.name,
      limits,
      features,
      canUpgrade,
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener información del plan' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { plan } = body as { plan: string }

    // Validate plan value
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: 'Plan inválido. Los planes disponibles son: basico, pro, premium' },
        { status: 400 }
      )
    }

    // Get current store plan
    const storeId = auth.user.storeId
    
    // Ensure store exists
    await ensureStoreExists(db, storeId)
    
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { plan: true },
    })
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const currentPlan = store.plan || 'basico'

    // Check if the target plan is actually an upgrade
    if (!canUpgradeTo(currentPlan, plan)) {
      return NextResponse.json(
        { error: `No puedes cambiar al plan ${plan} desde el plan ${currentPlan}` },
        { status: 400 }
      )
    }

    // Update store plan
    const updatedStore = await db.store.update({
      where: { id: storeId },
      data: { plan },
      select: { id: true, plan: true },
    })

    const newConfig = getPlanConfig(plan)

    return NextResponse.json({
      plan: updatedStore.plan,
      planName: newConfig.name,
      message: `Plan actualizado a ${newConfig.name} exitosamente`,
    })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el plan' }, { status: 500 })
  }
}
