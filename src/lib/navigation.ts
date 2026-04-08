// URL-to-view mapping for migrating from Zustand state routing to URL-based routing

// View to URL mapping
export const VIEW_URLS: Record<string, string> = {
  landing: '/',
  auth: '/login',
  register: '/registro',
  'store-demo': '/demo',
  admin: '/admin',
  customer: '/cliente',
  'super-admin': '/super-admin',
}

// Admin section to URL mapping
export const ADMIN_SECTION_URLS: Record<string, string> = {
  dashboard: '/admin/dashboard',
  products: '/admin/productos',
  categories: '/admin/categorias',
  orders: '/admin/pedidos',
  settings: '/admin/configuracion',
  plan: '/admin/mi-plan',
  ai: '/admin/asistente-ia',
}

// Customer section to URL mapping
export const CUSTOMER_SECTION_URLS: Record<string, string> = {
  dashboard: '/cliente/dashboard',
  orders: '/cliente/pedidos',
  profile: '/cliente/perfil',
}

// URL to view reverse mapping (for page routes)
export const URL_TO_VIEW: Record<string, string> = {
  '/': 'landing',
  '/login': 'auth',
  '/registro': 'register',
  '/demo': 'store-demo',
  '/super-admin': 'super-admin',
}

// URL to admin section reverse mapping
export const URL_TO_ADMIN_SECTION: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/productos': 'products',
  '/admin/categorias': 'categories',
  '/admin/pedidos': 'orders',
  '/admin/configuracion': 'settings',
  '/admin/mi-plan': 'plan',
  '/admin/asistente-ia': 'ai',
}

// URL to customer section reverse mapping
export const URL_TO_CUSTOMER_SECTION: Record<string, string> = {
  '/cliente': 'dashboard',
  '/cliente/dashboard': 'dashboard',
  '/cliente/pedidos': 'orders',
  '/cliente/perfil': 'profile',
}
