'use client'

import { Clock, MessageCircle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-500 dark:text-amber-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Tu tienda está en revisión
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
            Tu solicitud de registro ha sido recibida. Un administrador revisará tu tienda y te notificará por email una vez que sea aprobada.
          </p>
        </div>

        {/* Info cards */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Plan Gratuito</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                Comienzas con un plan gratuito. Una vez aprobada, el administrador puede asignarte el plan que necesites.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <MessageCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">¿Quieres un plan superior?</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Contacta por WhatsApp al administrador para coordinar el upgrade de plan y el pago correspondiente.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Si tienes dudas, contacta al soporte por WhatsApp.
        </p>
      </div>
    </div>
  )
}
