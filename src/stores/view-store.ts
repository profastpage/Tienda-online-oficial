import { create } from 'zustand'

export type ViewType = 'landing' | 'register' | 'auth' | 'admin' | 'customer' | 'store-demo' | 'super-admin'
export type AdminSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'plan' | 'ai'
export type CustomerSection = 'dashboard' | 'orders' | 'profile'

interface ViewState {
  view: ViewType
  adminSection: AdminSection
  customerSection: CustomerSection
  _hydrated: boolean
  setView: (view: ViewType) => void
  setAdminSection: (section: AdminSection) => void
  setCustomerSection: (section: CustomerSection) => void
  hydrate: () => void
}

export const useViewStore = create<ViewState>((set) => ({
  view: 'landing',
  adminSection: 'dashboard',
  customerSection: 'dashboard',
  _hydrated: false,
  setView: (view) => set({ view }),
  setAdminSection: (section) => set({ adminSection: section }),
  setCustomerSection: (section) => set({ customerSection: section }),
  hydrate: () => {
    try {
      const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
      const view = stored?.role === 'admin' ? 'admin' : stored?.role === 'customer' ? 'customer' : 'landing'
      set({ view, _hydrated: true })
    } catch {
      set({ view: 'landing', _hydrated: true })
    }
  },
}))
