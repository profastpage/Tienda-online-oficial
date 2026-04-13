'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, Volume2, VolumeX, X, Check } from 'lucide-react'

interface NotificationState {
  permission: NotificationPermission
  soundEnabled: boolean
  lastNotification: string | null
}

export function UpdateNotifier() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    soundEnabled: true,
    lastNotification: null,
  })
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setState((s) => ({ ...s, permission: Notification.permission }))
    }
    const saved = localStorage.getItem('update-notifier-sound')
    if (saved !== null) {
      setState((s) => ({ ...s, soundEnabled: saved === 'true' }))
    }
    const dismissed = localStorage.getItem('update-notifier-dismissed')
    if (!dismissed && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setState((s) => ({ ...s, permission }))
    if (permission === 'granted') {
      new Notification('🔔 Notificaciones Activadas', {
        body: 'Recibirás alertas cuando se actualice la tienda.',
        icon: '/icon.svg',
      })
    }
    setShowBanner(false)
    localStorage.setItem('update-notifier-dismissed', 'true')
  }, [])

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem('update-notifier-dismissed', 'true')
  }

  const toggleSound = () => {
    const newVal = !state.soundEnabled
    setState((s) => ({ ...s, soundEnabled: newVal }))
    localStorage.setItem('update-notifier-sound', String(newVal))
  }

  // Play notification sound
  const playSound = useCallback(() => {
    if (!state.soundEnabled) return
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)

      // Second beep
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.frequency.value = 1100
      osc2.type = 'sine'
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65)
      osc2.start(ctx.currentTime + 0.15)
      osc2.stop(ctx.currentTime + 0.65)
    } catch {
      // Audio not supported
    }
  }, [state.soundEnabled])

  // Expose notify function globally for programmatic use
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__notifyUpdate = (message: string) => {
      setState((s) => ({ ...s, lastNotification: new Date().toLocaleTimeString() }))

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚀 Actualización Completa', {
          body: message,
          icon: '/icon.svg',
          tag: `update-${Date.now()}`,
        })
      }

      playSound()
    }
  }, [playSound])

  return (
    <>
      {/* Enable notifications banner */}
      {showBanner && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300">
          <button
            onClick={dismissBanner}
            className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900">Activar notificaciones</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Recibe alertas con sonido cuando se actualice tu tienda.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={requestPermission}
                  className="h-8 px-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Activar
                </button>
                <button
                  onClick={dismissBanner}
                  className="h-8 px-3 text-neutral-500 text-xs font-medium rounded-lg hover:text-neutral-700 transition-colors"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      {state.permission === 'granted' && (
        <button
          onClick={toggleSound}
          className="fixed bottom-4 right-4 z-40 w-10 h-10 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title={state.soundEnabled ? 'Silenciar notificaciones' : 'Activar sonido'}
        >
          {state.soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Last notification indicator */}
      {state.lastNotification && (
        <div className="fixed bottom-4 right-16 z-40 flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-full shadow-lg text-xs font-medium animate-in slide-in-from-bottom-2 fade-in duration-300">
          <Check className="w-3.5 h-3.5" />
          {state.lastNotification}
        </div>
      )}
    </>
  )
}
