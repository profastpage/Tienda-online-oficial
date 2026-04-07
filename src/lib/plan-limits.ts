import { PrismaClient } from '@prisma/client'

// ─── Plan Configuration ───────────────────────────────────────────────────────

interface PlanLimits {
  products: number      // 0 = unlimited
  categories: number    // 0 = unlimited
  ordersMonthly: number // 0 = unlimited
  users: number         // 0 = unlimited
  imagesPerProduct: number // max images per product
}

interface PlanConfig {
  id: string
  name: string
  description: string
  limits: PlanLimits
  features: Record<string, boolean>
  price: number
  priceLabel: string
}

export const PLANS: Record<string, PlanConfig> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    description: 'Para tiendas que recién empiezan',
    limits: {
      products: 20,
      categories: 3,
      ordersMonthly: 20,
      users: 1,
      imagesPerProduct: 1,
    },
    features: {
      mercadopago: false,
      analytics: false,
      custom_domain: false,
      inventory: false,
      bulk_import: false,
      priority_support: false,
      whatsapp_orders: true,
      favorites: true,
      ai_assistant: false,
    },
    price: 0,
    priceLabel: 'Gratis',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para tiendas en crecimiento',
    limits: {
      products: 100,
      categories: 15,
      ordersMonthly: 200,
      users: 5,
      imagesPerProduct: 2,
    },
    features: {
      mercadopago: true,
      analytics: false,
      custom_domain: false,
      inventory: true,
      bulk_import: false,
      priority_support: false,
      whatsapp_orders: true,
      favorites: true,
      ai_assistant: false,
    },
    price: 49,
    priceLabel: 'S/ 49/mes',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Para tiendas profesionales',
    limits: {
      products: 200,
      categories: 0,
      ordersMonthly: 0,
      users: 0,
      imagesPerProduct: 4,
    },
    features: {
      mercadopago: true,
      analytics: true,
      custom_domain: true,
      inventory: true,
      bulk_import: true,
      priority_support: true,
      whatsapp_orders: true,
      favorites: true,
      ai_assistant: true,
    },
    price: 99,
    priceLabel: 'S/ 99/mes',
  },
}

// Ordered plan tiers for upgrade flow
export const PLAN_ORDER = ['basico', 'pro', 'premium'] as const

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Get full config for a given plan
 */
export function getPlanConfig(plan: string): PlanConfig {
  return PLANS[plan] || PLANS.basico
}

/**
 * Get limits for a given plan
 */
export function getPlanLimits(plan: string): PlanLimits {
  return getPlanConfig(plan).limits
}

/**
 * Check if a store has reached a plan limit for a specific resource.
 * Returns { allowed, current, limit, plan }
 */
export async function checkPlanLimit(
  db: PrismaClient,
  storeId: string,
  resource: 'products' | 'categories' | 'orders' | 'users',
  plan: string
): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
  const limits = getPlanLimits(plan)
  const limit = limits[resource] === 0 ? Infinity : limits[resource]

  let current = 0

  switch (resource) {
    case 'products':
      current = await db.product.count({ where: { storeId } })
      break
    case 'categories':
      current = await db.category.count({ where: { storeId } })
      break
    case 'orders': {
      // Count orders from the 1st of the current month
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      current = await db.order.count({
        where: {
          storeId,
          createdAt: { gte: firstOfMonth },
        },
      })
      break
    }
    case 'users':
      current = await db.storeUser.count({ where: { storeId } })
      break
  }

  return {
    allowed: current < limit,
    current,
    limit: limits[resource],
    plan,
  }
}

/**
 * Check if a plan has access to a specific feature.
 */
export function canUseFeature(plan: string, feature: string): boolean {
  const config = getPlanConfig(plan)
  return config.features[feature] === true
}

/**
 * Check if upgrading from one plan to another is valid (must be higher tier)
 */
export function canUpgradeTo(currentPlan: string, targetPlan: string): boolean {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan as typeof PLAN_ORDER[number])
  const targetIndex = PLAN_ORDER.indexOf(targetPlan as typeof PLAN_ORDER[number])
  return targetIndex > currentIndex
}
