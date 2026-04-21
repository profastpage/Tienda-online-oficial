import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'customer']),
  storeName: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === 'admin') return !!data.storeName && data.storeName.length >= 2
    return true
  },
  { message: 'El nombre de la tienda es requerido para vendedores', path: ['storeName'] }
)

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200, 'Máximo 200 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  comparePrice: z.number().positive().optional().nullable(),
  description: z.string().max(5000).optional().default(''),
  categoryId: z.string().min(1, 'Categoría requerida'),
  slug: z.string().min(1),
  image: z.string().optional().default(''),
  images: z.string().optional().default('[]'),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  discount: z.number().int().min(0).max(100).optional().nullable(),
  sizes: z.string().optional().default('[]'),
  colors: z.string().optional().default('[]'),
  inStock: z.boolean().optional().default(true),
})

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Nombre requerido'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  customerPhone: z.string().min(8, 'Teléfono requerido'),
  customerAddress: z.string().optional().default(''),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    productImage: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
    size: z.string().optional().default(''),
    color: z.string().optional().default(''),
  })).min(1, 'Debe haber al menos un producto'),
  notes: z.string().optional().default(''),
  paymentMethodId: z.string().optional(),
})

export const superAdminActionsSchema = z.object({
  action: z.enum([
    'toggle-store', 'delete-store', 'change-plan', 'store-token',
    'create-coupon', 'toggle-coupon', 'delete-coupon',
    'send-notification', 'delete-lead', 'set-subscription', 'grant-trial',
  ]),
  storeId: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export function validateRequest<T>(schema: z.ZodType<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return { success: false, error: firstError?.message || 'Datos inválidos' }
  }
  return { success: true, data: result.data }
}
