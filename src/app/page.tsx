'use client'

import { useEffect } from 'react'
import { useViewStore } from '@/stores/view-store'
import { useAuthStore } from '@/stores/auth-store'
import SaasLanding from '@/components/saas-landing'
import Storefront from '@/components/storefront'
import AuthPage from '@/components/auth-page'
import RegisterPage from '@/components/register-page'
import { AdminPanel } from '@/components/admin/admin-panel'
import { CustomerPanel } from '@/components/customer/customer-panel'
import SuperAdminPanel from '@/components/super-admin-panel'

export default function Home() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const hydrateView = useViewStore((s) => s.hydrate)
  const hydrateAuth = useAuthStore((s) => s.hydrate)
  const hydrated = useViewStore((s) => s._hydrated)

  // Hydrate stores from localStorage on mount (client-side only)
  useEffect(() => {
    hydrateAuth()
    hydrateView()
  }, [])

  // PWA: Open directly to store when installed as standalone app
  useEffect(() => {
    if (!hydrated) return
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
      if (isStandalone && view === 'landing') {
        setView('store-demo')
      }
    } catch {}
  }, [hydrated, view, setView])

  // Prevent hydration mismatch - render loading until client-side hydrated
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  switch (view) {
    case 'landing':
      return <SaasLanding />
    case 'register':
      return <RegisterPage />
    case 'auth':
      return <AuthPage />
    case 'admin':
      return <AdminPanel />
    case 'super-admin':
      return <SuperAdminPanel />
    case 'customer':
      return <CustomerPanel />
    case 'store-demo':
      return <Storefront />
    default:
      return <Storefront />
  }
}
