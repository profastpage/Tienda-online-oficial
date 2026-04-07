'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { CustomerPanel } from '@/components/customer/customer-panel'
import { useViewStore } from '@/stores/view-store'
import { URL_TO_CUSTOMER_SECTION } from '@/lib/navigation'

export default function ClientePedidosPage() {
  const pathname = usePathname()
  const setCustomerSection = useViewStore((s) => s.setCustomerSection)
  const setView = useViewStore((s) => s.setView)

  useEffect(() => {
    setView('customer')
    const section = URL_TO_CUSTOMER_SECTION[pathname] || 'dashboard'
    setCustomerSection(section as 'orders')
  }, [pathname, setCustomerSection, setView])

  return <CustomerPanel />
}
