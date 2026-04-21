'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu, Bell, Bot, ChevronUp, Download, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useCartStore } from '@/stores/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useStorefrontStore } from './storefront-store'
import AiChat from '@/components/ai-chat'

interface StorefrontFabProps {
  getWhatsAppOrderUrl: () => string
}

export function StorefrontFab({ getWhatsAppOrderUrl }: StorefrontFabProps) {
  const cart = useCartStore()
  const { toast } = useToast()

  const fabOpen = useStorefrontStore((s) => s.fabOpen)
  const showAiChat = useStorefrontStore((s) => s.showAiChat)
  const scrollY = useStorefrontStore((s) => s.scrollY)
  const storeWhatsApp = useStorefrontStore((s) => s.storeWhatsApp)
  const showInstallDialog = useStorefrontStore((s) => s.showInstallDialog)

  const setFabOpen = useStorefrontStore((s) => s.setFabOpen)
  const setShowAiChat = useStorefrontStore((s) => s.setShowAiChat)
  const setShowInstallDialog = useStorefrontStore((s) => s.setShowInstallDialog)

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-fab-menu]')) setFabOpen(false)
    }
    if (fabOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [fabOpen, setFabOpen])

  return (
    <>
      {/* Install App Instructions Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Instalar App
            </DialogTitle>
            <DialogDescription>Instala Urban Style en tu dispositivo para una experiencia más rápida</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                  <Smartphone className="w-6 h-6 text-amber-600 shrink-0" />
                  <div className="text-sm text-foreground">
                    <p className="font-semibold">Desde Safari (iOS)</p>
                    <p className="text-muted-foreground mt-1">Toca el botón <strong>Compartir</strong> (cuadrado con flecha ↑) → <strong>Agregar a pantalla de inicio</strong></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <Monitor className="w-6 h-6 text-blue-600 shrink-0" />
                  <div className="text-sm text-foreground">
                    <p className="font-semibold">Desde Chrome (Android)</p>
                    <p className="text-muted-foreground mt-1">Toca los tres puntos <strong>⋮</strong> → <strong>Instalar aplicación</strong></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <Monitor className="w-6 h-6 text-neutral-500 shrink-0" />
                  <div className="text-sm text-foreground">
                    <p className="font-semibold">Otra opción</p>
                    <p className="text-muted-foreground mt-1">Toca el menú del navegador → <strong>Agregar a pantalla de inicio</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => setShowInstallDialog(false)} className="w-full mt-2">
            Entendido
          </Button>
        </DialogContent>
      </Dialog>

      {/* Unified FAB Menu */}
      <div data-fab-menu className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Expanded action buttons - fan out above */}
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end gap-2.5"
            >
              {/* Notification Bell */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                onClick={async (e) => {
                  e.stopPropagation()
                  if (!('Notification' in window)) {
                    toast({ title: 'No soportado', variant: 'destructive', duration: 800 })
                    return
                  }
                  if (Notification.permission === 'default') {
                    const perm = await Notification.requestPermission()
                    if (perm !== 'granted') return
                  }
                  if (Notification.permission === 'granted') {
                    const notifications = [
                      { title: '🛍️ Nueva oferta', body: '20% de descuento en toda la tienda. Solo por hoy.' },
                      { title: '📦 Tu pedido está en camino', body: 'El pedido fue enviado. Llega mañana.' },
                      { title: '⭐ Nuevo producto', body: 'Productos nuevos que te pueden interesar.' },
                      { title: '💰 Precio especial', body: 'Tus favoritos tienen descuento ahora.' },
                      { title: '🎉 ¡Bienvenido!', body: 'Gracias por instalar nuestra app.' },
                      { title: '🚚 Envío gratis', body: 'Pedidos mayores a S/199 esta semana.' },
                    ]
                    const notif = notifications[Math.floor(Math.random() * notifications.length)]
                    new Notification(notif.title, { body: notif.body, icon: '/icon.svg', badge: '/icon.svg', tag: 'test-notification' })
                    toast({ title: 'Notificación enviada', description: notif.title, duration: 800 })
                  }
                }}
                className="flex items-center gap-2.5 group"
                title="Probar notificación"
              >
                <span className="hidden sm:block text-xs font-medium text-foreground/80 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-border/50 whitespace-nowrap">
                  Notificaciones
                </span>
                <span className="sm:hidden text-[10px] font-medium text-foreground/80 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-border/50">
                  🔔
                </span>
                <div className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110">
                  <Bell className="w-4.5 h-4.5" />
                </div>
              </motion.button>

              {/* AI Chat */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={(e) => { e.stopPropagation(); setShowAiChat(true); setFabOpen(false) }}
                className="flex items-center gap-2.5 group"
                title="Chat con IA"
              >
                <span className="hidden sm:block text-xs font-medium text-foreground/80 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-border/50 whitespace-nowrap">
                  Asistente IA
                </span>
                <span className="sm:hidden text-[10px] font-medium text-foreground/80 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-border/50">
                  🤖
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              </motion.button>

              {/* WhatsApp */}
              <motion.a
                href={getWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 group"
                title="Pedir por WhatsApp"
              >
                <span className="hidden sm:block text-xs font-medium text-foreground/80 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-border/50 whitespace-nowrap">
                  WhatsApp
                </span>
                <span className="sm:hidden text-[10px] font-medium text-foreground/80 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-border/50">
                  💬
                </span>
                <div className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 relative">
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {cart.totalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center px-1">
                      {cart.totalItems()}
                    </span>
                  )}
                </div>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Back to Top - only arrow, no background */}
        {scrollY > 400 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute -top-10 right-2 w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
            aria-label="Volver arriba"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}

        {/* Main FAB Button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); setFabOpen(!fabOpen) }}
          className="w-14 h-14 rounded-full bg-white dark:bg-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-200 text-neutral-900 shadow-xl shadow-neutral-900/20 dark:shadow-white/10 flex items-center justify-center transition-all hover:scale-105 relative"
          whileTap={{ scale: 0.92 }}
          aria-label="Menú de acciones"
        >
          <AnimatePresence mode="wait">
            {fabOpen ? (
              <motion.div key="close" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }} transition={{ duration: 0.15 }}>
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          {!fabOpen && cart.totalItems() > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
              {cart.totalItems()}
            </span>
          )}
        </motion.button>
      </div>

      {showAiChat && <AiChat onClose={() => setShowAiChat(false)} />}
    </>
  )
}
