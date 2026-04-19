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
  setupFee: string | null
}

export const PLANS: Record<string, PlanConfig> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    description: 'Ideal para emprendedores',
    limits: {
      products: 50,
      categories: 5,
      ordersMonthly: 50,
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
      push_notifications: false,
    },
    price: 49,
    priceLabel: 'S/ 49/mes',
    setupFee: 'S/ 200',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Negocios en crecimiento',
    limits: {
      products: 200,
      categories: 15,
      ordersMonthly: 200,
      users: 3,
      imagesPerProduct: 3,
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
      push_notifications: true,
    },
    price: 89,
    priceLabel: 'S/ 89/mes',
    setupFee: 'S/ 250',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'La mejor inversión',
    limits: {
      products: 0,  // unlimited
      categories: 0, // unlimited
      ordersMonthly: 0, // unlimited
      users: 10,
      imagesPerProduct: 8,
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
      push_notifications: true,
    },
    price: 129,
    priceLabel: 'S/ 129/mes',
    setupFee: 'S/ 300',
  },
  empresarial: {
    id: 'empresarial',
    name: 'Empresarial',
    description: 'Solución a medida',
    limits: {
      products: 0,  // unlimited
      categories: 0, // unlimited
      ordersMonthly: 0, // unlimited
      users: 0, // unlimited
      imagesPerProduct: 20,
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
      push_notifications: true,
    },
    price: 0, // custom pricing
    priceLabel: 'Cotizar',
    setupFee: null,
  },
}

// Ordered plan tiers for upgrade flow
export const PLAN_ORDER = ['basico', 'pro', 'premium', 'empresarial'] as const

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
 * 
 * Uses RAW SQL to avoid schema mismatch issues with Prisma ORM.
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

  try {
    switch (resource) {
      case 'products': {
        const result = await db.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM Product WHERE storeId = ?`,
          [storeId]
        )
        current = result[0]?.count || 0
        break
      }
      case 'categories': {
        const result = await db.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM Category WHERE storeId = ?`,
          [storeId]
        )
        current = result[0]?.count || 0
        break
      }
      case 'orders': {
        // Count orders from the 1st of the current month
        const now = new Date()
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const result = await db.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM "Order" WHERE storeId = ? AND createdAt >= ?`,
          [storeId, firstOfMonth]
        )
        current = result[0]?.count || 0
        break
      }
      case 'users': {
        const result = await db.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM StoreUser WHERE storeId = ?`,
          [storeId]
        )
        current = result[0]?.count || 0
        break
      }
    }
  } catch (error) {
    console.error('[plan-limits] Error counting:', resource, error instanceof Error ? error.message : error)
    // If count fails, allow the action (fail open)
    return {
      allowed: true,
      current: 0,
      limit: limits[resource],
      plan,
    }
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
