'use client'

import { ShoppingBag } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useStorefrontStore } from './storefront-store'
import { sc, scJson } from './storefront-types'

export function StorefrontFooter() {
  const storeContent = useStorefrontStore((s) => s.storeContent)
  const storeName = useStorefrontStore((s) => s.storeName)
  const storeLogo = useStorefrontStore((s) => s.storeLogo)
  const storeDescription = useStorefrontStore((s) => s.storeDescription)
  const paymentMethods = useStorefrontStore((s) => s.paymentMethods)

  const handleSc = (section: string, key: string, fallback: string = '') =>
    sc(storeContent, section, key, fallback)

  return (
    <footer className="text-white border-t border-neutral-800" style={{ backgroundColor: 'var(--store-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-neutral-900 dark:text-white" />
                )}
              </div>
              <span className="text-xl font-bold tracking-tight">{storeName || 'Mi Tienda'}</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              {storeDescription || 'Tu tienda online de confianza. Compra fácil y seguro desde cualquier lugar.'}
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'tiktok'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-xs text-neutral-400 capitalize">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-sm mb-4 tracking-wider uppercase text-neutral-300">Tienda</h3>
            <ul className="space-y-2.5">
              {scJson<string[]>(storeContent, 'footer', 'shopLinks', ['Polos', 'Hoodies', 'Pantalones', 'Zapatos', 'Novedades']).map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 tracking-wider uppercase text-neutral-300">Ayuda</h3>
            <ul className="space-y-2.5">
              {scJson<string[]>(storeContent, 'footer', 'helpLinks', ['FAQ', 'Guía de tallas', 'Devoluciones', 'Contacto', 'Términos']).map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 tracking-wider uppercase text-neutral-300">Contacto</h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <p className="flex items-center gap-2">
                <span>{handleSc('footer', 'contactAddress', '📍 Lima, Perú')}</span>
              </p>
              <p className="flex items-center gap-2">
                <span>{handleSc('footer', 'contactPhone', '📞 +51 999 888 777')}</span>
              </p>
              <p className="flex items-center gap-2">
                <span>{handleSc('footer', 'contactWhatsapp', '💬 WhatsApp 24/7')}</span>
              </p>
              <p className="flex items-center gap-2">
                <span>{handleSc('footer', 'contactHours', '🕐 Lun-Sáb: 9am-8pm')}</span>
              </p>
            </div>
            {/* Payment methods */}
            <div className="mt-4">
              <h4 className="text-xs text-neutral-500 mb-2">Métodos de pago</h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => {
                    const typeColors: Record<string, string> = {
                      yape: 'bg-purple-100 text-purple-700',
                      plin: 'bg-teal-100 text-teal-700',
                      efectivo: 'bg-green-100 text-green-700',
                      transferencia: 'bg-blue-100 text-blue-700',
                      tarjeta: 'bg-orange-100 text-orange-700',
                      niubiz: 'bg-red-100 text-red-700',
                      mercadopago: 'bg-sky-100 text-sky-700',
                      otro: 'bg-neutral-100 text-neutral-700',
                    }
                    const colorClass = typeColors[method.type] || 'bg-neutral-100 text-neutral-700'
                    return (
                      <span key={method.id} className={`text-[10px] px-2 py-1 rounded font-medium ${colorClass}`}>
                        {method.name}
                      </span>
                    )
                  })
                ) : (
                  ['Efectivo', 'Yape', 'Plin', 'Transferencia'].map((method) => (
                    <span key={method} className="text-[10px] bg-muted text-neutral-400 px-2 py-1 rounded">
                      {method}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-neutral-800" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <p>{handleSc('footer', 'copyright', `© ${new Date().getFullYear()} ${storeName || 'Mi Tienda'}. Todos los derechos reservados.`)}</p>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <a href={handleSc('footer', 'creditsUrl', 'https://tienda-online-oficial.vercel.app/')} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
              {handleSc('footer', 'creditsText', 'Creado y desarrollado por Tienda Online')}
            </a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-400 transition-colors">Términos y condiciones</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Política de privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
