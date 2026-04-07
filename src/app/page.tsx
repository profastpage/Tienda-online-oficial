'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useViewStore } from '@/stores/view-store'
import { useAuthStore } from '@/stores/auth-store'
import SaasLanding from '@/components/saas-landing'
import { VIEW_URLS } from '@/lib/navigation'

export default function Home() {
  const view = useViewStore((s) => s.view)
  const hydrateView = useViewStore((s) => s.hydrate)
  const hydrateAuth = useAuthStore((s) => s.hydrate)
  const hydrated = useViewStore((s) => s._hydrated)
  const router = useRouter()

  // Hydrate stores from localStorage on mount (client-side only)
  useEffect(() => {
    hydrateAuth()
    hydrateView()
  }, [])

  // Redirect to correct URL if Zustand view doesn't match current path
  // This handles backward compat (e.g. user was on /admin and refreshed)
  useEffect(() => {
    if (!hydrated) return
    if (view !== 'landing' && typeof window !== 'undefined' && window.location.pathname === '/') {
      const url = VIEW_URLS[view]
      if (url) {
        router.replace(url)
      }
    }
  }, [hydrated, view, router])

  // PWA: Open directly to store when installed as standalone app
  useEffect(() => {
    if (!hydrated) return
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
      if (isStandalone && view === 'landing') {
        router.push('/demo')
      }
    } catch {}
  }, [hydrated, view, router])

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

  // Root page is always the landing page
  // All other views are handled by their own route pages (admin, login, demo, etc.)
  return <SaasLanding />
}
