import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  phone: string
  address: string
  role: 'admin' | 'customer'
  storeId: string
  storeName: string
  storeSlug?: string
}

interface AuthState {
  user: User | null
  _hydrated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  _hydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('user', JSON.stringify(user))
      else localStorage.removeItem('user')
    }
    set({ user })
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('user')
    set({ user: null })
  },
  hydrate: () => {
    try {
      const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
      set({ user: stored, _hydrated: true })
    } catch {
      set({ user: null, _hydrated: true })
    }
  },
}))
