'use client'

import { useEffect } from 'react'
import { useViewStore } from '@/stores/view-store'
import SaasLanding from '@/components/saas-landing'
import Storefront from '@/components/storefront'
import AuthPage from '@/components/auth-page'
import RegisterPage from '@/components/register-page'
import { AdminPanel } from '@/components/admin/admin-panel'
import { CustomerPanel } from '@/components/customer/customer-panel'
import SuperAdminPanel from '@/components/super-admin-panel'

export default function Home() {
  const { view, setView } = useViewStore()

  // PWA: Open directly to store when installed as standalone app
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    if (isStandalone && view === 'landing') {
      setView('store-demo')
    }
  }, [])

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
      return <SaasLanding />
  }
}
