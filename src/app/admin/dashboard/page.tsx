'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AdminPanel } from '@/components/admin/admin-panel'
import { useViewStore } from '@/stores/view-store'
import { URL_TO_ADMIN_SECTION } from '@/lib/navigation'

export default function AdminDashboardPage() {
  const pathname = usePathname()
  const setAdminSection = useViewStore((s) => s.setAdminSection)
  const setView = useViewStore((s) => s.setView)

  useEffect(() => {
    setView('admin')
    const section = URL_TO_ADMIN_SECTION[pathname] || 'dashboard'
    setAdminSection(section as 'dashboard')
  }, [pathname, setAdminSection, setView])

  return <AdminPanel />
}
