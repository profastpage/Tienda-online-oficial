'use client'

import { Component, ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Error boundary to catch React #310 hydration errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Error de renderizado</h2>
            <p className="text-sm text-neutral-500 mb-4">Ocurrio un error inesperado al cargar el panel.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="ml-3 px-6 py-2.5 bg-white text-neutral-700 border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              Volver al login
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const SuperAdminPanel = dynamic(() => import('@/components/super-admin-panel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500">Cargando panel de administracion...</p>
      </div>
    </div>
  ),
})

export default function SuperAdminPage() {
  return (
    <ErrorBoundary>
      <SuperAdminPanel />
    </ErrorBoundary>
  )
}
