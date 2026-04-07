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
  token: string | null
  _hydrated: boolean
  setUser: (user: User | null, token?: string | null) => void
  logout: () => void
  hydrate: () => void
  /** Get headers object with Authorization for fetch calls */
  getAuthHeaders: () => Record<string, string>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  _hydrated: false,
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        if (token) localStorage.setItem('auth-token', token)
      } else {
        localStorage.removeItem('user')
        localStorage.removeItem('auth-token')
      }
    }
    set({ user, token: token || null })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('auth-token')
      // Clear the HTTP-only cookie by expiring it
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
    set({ user: null, token: null })
  },
  hydrate: () => {
    try {
      const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
      set({ user: stored, token, _hydrated: true })
    } catch {
      set({ user: null, token: null, _hydrated: true })
    }
  },
  getAuthHeaders: () => {
    const { token } = get()
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  },
}))
