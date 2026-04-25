'use client'

import { ShoppingBag, Heart, ShoppingCart, MessageCircle, Trash2, Minus, Plus, Flame, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useToast } from '@/hooks/use-toast'
import { useStorefrontStore } from './storefront-store'

interface StorefrontCartProps {
  openCheckout: () => void
  hasOffers: boolean
  getWhatsAppOrderUrl: () => string
  orderTotal: number
}

export function StorefrontCart({ openCheckout, hasOffers, getWhatsAppOrderUrl, orderTotal }: StorefrontCartProps) {
  const cart = useCartStore()
  const wishlist = useWishlistStore()
  const { toast } = useToast()

  const storeWhatsApp = useStorefrontStore((s) => s.storeWhatsApp)
  const products = useStorefrontStore((s) => s.products)
  const openProduct = useStorefrontStore((s) => s.openProduct)

  return (
    <>
      {/* Shopping Cart Sheet */}
      <Sheet open={cart.isOpen} onOpenChange={(open) => !open && cart.closeCart()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Tu Carrito ({cart.totalItems()})
            </SheetTitle>
          </SheetHeader>

          {cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Tu carrito está vacío</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Explora nuestro catálogo y encuentra tu estilo</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={cart.closeCart}
              >
                Seguir comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-1">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">Talla: {item.size} · Color: {item.color}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border rounded-full">
                            <button
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => cart.updateQuantity(item.id, item.size, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => cart.updateQuantity(item.id, item.size, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-sm">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                        onClick={() => cart.removeItem(item.id, item.size)}
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter className="border-t pt-4 px-1 flex-col gap-3">
                <div className="w-full flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold text-foreground">S/ {cart.totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground/70 w-full text-left">
                  {cart.totalPrice() > 199 ? '🎉 Envío gratis en tu pedido' : `Envío S/15 · Gratis en pedidos +S/199`}
                </p>
                <Button
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm"
                  onClick={openCheckout}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Finalizar Compra · S/ {orderTotal.toFixed(2)}
                </Button>
                {/* WhatsApp Direct Order */}
                <button
                  onClick={() => {
                    window.open(getWhatsAppOrderUrl(), '_blank')
                    toast({ title: 'Pedido enviado por WhatsApp', duration: 800 })
                  }}
                  className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Pedir por WhatsApp
                </button>
                <Button
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
                  onClick={() => {
                    cart.closeCart()
                    if (hasOffers) {
                      document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {hasOffers ? (
                    <><Flame className="w-5 h-5 mr-2" /> Ver Ofertas</>
                  ) : (
                    <><LayoutGrid className="w-5 h-5 mr-2" /> Ver Categorías</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold text-sm"
                  onClick={cart.clearCart}
                >
                  Vaciar carrito
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Wishlist Sheet */}
      <Sheet open={wishlist.isOpen} onOpenChange={(open) => !open && wishlist.closeWishlist()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              Mi Lista de Deseos ({wishlist.totalItems()})
            </SheetTitle>
          </SheetHeader>

          {wishlist.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Tu lista está vacía</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Guarda tus productos favoritos aquí</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={wishlist.closeWishlist}
              >
                Explorar productos
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
                <div className="space-y-4">
                  {wishlist.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {/* Product image - clickable to view */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                        onClick={() => {
                          const prod = products.find((p) => p.id === item.id)
                          if (prod) { openProduct(prod); wishlist.closeWishlist() }
                        }}
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                        <p className="text-sm font-bold text-foreground mt-0.5">S/ {item.price.toFixed(2)}</p>
                      </div>
                      {/* Action icons - minimal row */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 transition-colors"
                          onClick={() => {
                            cart.addItem({ id: item.id, name: item.name, price: item.price, image: item.image, size: '', color: '' })
                            toast({ title: 'Agregado al carrito', description: item.name, duration: 800 })
                          }}
                          title="Agregar al carrito"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-950/30 text-neutral-500 hover:text-green-600 transition-colors"
                          onClick={() => {
                            const waMsg = encodeURIComponent(`¡Hola! Me interesa:\n📦 ${item.name}\n💰 S/ ${item.price.toFixed(2)}`)
                            window.open(`https://wa.me/${storeWhatsApp}?text=${waMsg}`, '_blank')
                          }}
                          title="Pedir por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-500 hover:text-red-500 transition-colors"
                          onClick={() => wishlist.removeItem(item.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter className="border-t pt-3">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-red-500"
                  onClick={() => wishlist.clearWishlist()}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Limpiar lista
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
