'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react'

const POPUP_KEY = 'urban-style-welcome-dismissed'
const POPUP_DELAY = 3000 // 3 seconds

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Check if already dismissed in this session
    try {
      const dismissed = sessionStorage.getItem(POPUP_KEY)
      if (dismissed) return
    } catch {
      // sessionStorage not available
    }

    const timer = setTimeout(() => setIsVisible(true), POPUP_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const closePopup = useCallback(() => {
    setIsVisible(false)
    try {
      sessionStorage.setItem(POPUP_KEY, 'true')
    } catch {
      // ignore
    }
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) return
      setSubmitted(true)
      // Auto-close after 2 seconds
      setTimeout(closePopup, 2500)
    },
    [email, closePopup]
  )

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) closePopup()
    },
    [closePopup]
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Popup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 28,
            }}
            className="
              relative w-full max-w-md
              bg-white dark:bg-neutral-900
              rounded-3xl overflow-hidden
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closePopup}
              className="
                absolute top-4 right-4 z-10
                w-8 h-8 rounded-full
                bg-black/10 dark:bg-white/10
                flex items-center justify-center
                hover:bg-black/20 dark:hover:bg-white/20
                transition-colors duration-200
              "
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>

            {/* Top gradient banner */}
            <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 px-8 pt-10 pb-8 text-center overflow-hidden">
              {/* Decorative sparkles */}
              <div className="absolute inset-0 overflow-hidden">
                <Sparkles className="absolute top-4 left-8 w-5 h-5 text-amber-400/30 animate-pulse" />
                <Sparkles className="absolute top-12 right-12 w-4 h-4 text-amber-300/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute bottom-6 left-16 w-3 h-3 text-amber-400/25 animate-pulse" style={{ animationDelay: '1s' }} />
                <Sparkles className="absolute bottom-4 right-8 w-5 h-5 text-amber-300/20 animate-pulse" style={{ animationDelay: '1.5s' }} />
              </div>

              {/* Gift icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                className="relative mx-auto w-16 h-16 mb-4"
              >
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white leading-tight"
              >
                BIENVENIDO A URBAN STYLE
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-white/70 text-sm"
              >
                Tu cupon de bienvenida te espera
              </motion.p>
            </div>

            {/* Content area */}
            <div className="px-8 py-8">
              {!submitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-center text-foreground text-sm leading-relaxed mb-6">
                    Suscribete y obtén un{' '}
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-base">
                      10% DE DESCUENTO
                    </span>{' '}
                    en tu primera compra.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                          w-full h-12 px-4 pr-14
                          bg-neutral-100 dark:bg-neutral-800
                          border border-neutral-200 dark:border-neutral-700
                          rounded-xl text-sm text-foreground
                          placeholder:text-muted-foreground/60
                          focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500
                          transition-all duration-200
                        "
                      />
                      <button
                        type="submit"
                        className="
                          absolute right-1.5 top-1/2 -translate-y-1/2
                          h-9 px-4 bg-neutral-900 dark:bg-amber-500
                          text-white rounded-lg text-xs font-semibold
                          flex items-center gap-1.5
                          hover:bg-neutral-800 dark:hover:bg-amber-600
                          active:scale-95 transition-all duration-200
                        "
                      >
                        OK
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
                    Sin spam. Solo ofertas exclusivas.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  {/* Success animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mx-auto w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                  >
                    <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="font-bold text-foreground text-lg">Cupon Activado</h3>
                  <div className="mt-3 inline-block bg-amber-50 dark:bg-amber-900/20 border border-dashed border-amber-500 rounded-xl px-6 py-3">
                    <p className="text-amber-700 dark:text-amber-400 text-xs font-medium uppercase tracking-wider">Tu cupon es</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-wider mt-0.5">BIENVENIDO10</p>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Usalo en tu primera compra
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
