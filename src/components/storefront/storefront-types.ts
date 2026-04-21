export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  images?: string
  sizes: string
  colors: string
  discount: number | null
  isNew: boolean
  rating: number
  reviewCount: number
  inStock?: boolean
  category: { name: string; slug: string }
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  _count: { products: number }
}

export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
}

export interface StoreInfo {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  whatsappNumber: string
  address: string
  plan: string
  isActive: boolean
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  customCSS?: string
  favicon?: string
}

export interface StoreContentData {
  [section: string]: Record<string, string>
}

export interface PaymentMethod {
  id: string
  type: string
  name: string
  qrCode: string
  accountNumber: string
  accountHolder: string
  bankName: string
}

export interface CreatedOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  items: any[]
}

export const testimonialPhotos: Record<string, string> = {
  'María García': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&h=100&q=80',
  'Carlos López': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
  'Ana Torres': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80',
  'Luis Ramírez': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
  'Sofía Martínez': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
  'Diego Flores': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80',
}

/** Parse product images JSON into string array, with fallback to single image */
export function getProductImages(product: Product): string[] {
  try {
    const extra = JSON.parse(product.images || '[]') as string[]
    if (extra.length > 0) {
      return [product.image, ...extra.filter(Boolean)]
    }
  } catch {
    // ignore parse errors
  }
  return [product.image]
}

/** Get store content value with fallback */
export function sc(storeContent: StoreContentData, section: string, key: string, fallback: string = ''): string {
  return storeContent?.[section]?.[key] || fallback
}

/** Parse JSON content with fallback */
export function scJson<T>(storeContent: StoreContentData, section: string, key: string, fallback: T): T {
  try {
    const val = storeContent?.[section]?.[key]
    if (val) return JSON.parse(val) as T
  } catch { /* ignore parse errors */ }
  return fallback
}
