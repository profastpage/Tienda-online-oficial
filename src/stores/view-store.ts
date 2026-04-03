import { create } from 'zustand'

export type ViewType = 'landing' | 'auth' | 'admin' | 'customer'
export type AdminSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings'
export type CustomerSection = 'dashboard' | 'orders' | 'profile'

interface ViewState {
  view: ViewType
  adminSection: AdminSection
  customerSection: CustomerSection
  setView: (view: ViewType) => void
  setAdminSection: (section: AdminSection) => void
  setCustomerSection: (section: CustomerSection) => void
}

export const useViewStore = create<ViewState>((set) => ({
  view: (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || 'null')) : null)
    ? JSON.parse(localStorage.getItem('user') || 'null')?.role === 'admin' ? 'admin' : 'customer'
    : 'landing',
  adminSection: 'dashboard',
  customerSection: 'dashboard',
  setView: (view) => set({ view }),
  setAdminSection: (section) => set({ adminSection: section }),
  setCustomerSection: (section) => set({ customerSection: section }),
}))
