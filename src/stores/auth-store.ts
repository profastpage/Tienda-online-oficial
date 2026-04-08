import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  phone: string
  address: string
  role: 'admin' | 'customer' | 'super-admin'
  storeId: string
  storeName: string
  storeSlug?: string
}

interface AuthState {
  user: User | null
  token: string | null
  _hydrated: boolean
  setUser: (user: User | null, token?: string | null) => void
  logout: () => Promise<void>
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
  logout: async () => {
    // Clear client-side state immediately
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('auth-token')
    }
    set({ user: null, token: null })
    // Clear the httpOnly cookie via server endpoint (client JS can't delete httpOnly cookies)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Silently fail — the cookie will expire in 7 days anyway
    }
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
  getAuthHeaders: (): Record<string, string> => {
    const { token } = get()
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  },
}))
