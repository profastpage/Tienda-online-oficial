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
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
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
}))
