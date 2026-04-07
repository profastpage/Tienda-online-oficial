'use client'

import { useEffect } from 'react'
import { AdminPanel } from '@/components/admin/admin-panel'
import { useViewStore } from '@/stores/view-store'
import { URL_TO_ADMIN_SECTION } from '@/lib/navigation'

export default function AdminPage() {
  const setAdminSection = useViewStore((s) => s.setAdminSection)
  const setView = useViewStore((s) => s.setView)

  useEffect(() => {
    setView('admin')
    setAdminSection('dashboard')
  }, [setAdminSection, setView])

  return <AdminPanel />
}
