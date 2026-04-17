'use client'

import dynamic from 'next/dynamic'

const SuperAdminPanel = dynamic(() => import('@/components/super-admin-panel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500">Cargando panel de administración...</p>
      </div>
    </div>
  ),
})

export default function SuperAdminPage() {
  return <SuperAdminPanel />
}
