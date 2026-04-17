'use client'

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Error al cargar el panel</h2>
        <p className="text-sm text-neutral-500 mb-6">Ocurrio un error al renderizar el panel de administracion. Intenta recargar la pagina.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2.5 bg-white text-neutral-700 border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    </div>
  )
}
