'use client'

import { useEffect } from 'react'
import { CustomerPanel } from '@/components/customer/customer-panel'
import { useViewStore } from '@/stores/view-store'

export default function ClientePage() {
  const setCustomerSection = useViewStore((s) => s.setCustomerSection)
  const setView = useViewStore((s) => s.setView)

  useEffect(() => {
    setView('customer')
    setCustomerSection('dashboard')
  }, [setCustomerSection, setView])

  return <CustomerPanel />
}
