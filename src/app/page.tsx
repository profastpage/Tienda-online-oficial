'use client'

import { useViewStore } from '@/stores/view-store'
import Storefront from '@/components/storefront'
import AuthPage from '@/components/auth-page'
import { AdminPanel } from '@/components/admin/admin-panel'
import { CustomerPanel } from '@/components/customer/customer-panel'

export default function Home() {
  const { view } = useViewStore()

  switch (view) {
    case 'auth':
      return <AuthPage />
    case 'admin':
      return <AdminPanel />
    case 'customer':
      return <CustomerPanel />
    default:
      return <Storefront />
  }
}
// trigger
