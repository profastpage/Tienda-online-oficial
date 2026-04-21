'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, ChevronRight, ChevronLeft, Check, Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { useStorefrontStore } from './storefront-store'

export function StorefrontCheckout() {
  const cart = useCartStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  const checkoutOpen = useStorefrontStore((s) => s.checkoutOpen)
  const checkoutStep = useStorefrontStore((s) => s.checkoutStep)
  const checkoutLoading = useStorefrontStore((s) => s.checkoutLoading)
  const customerName = useStorefrontStore((s) => s.customerName)
  const customerEmail = useStorefrontStore((s) => s.customerEmail)
  const customerPhone = useStorefrontStore((s) => s.customerPhone)
  const customerAddress = useStorefrontStore((s) => s.customerAddress)
  const orderNotes = useStorefrontStore((s) => s.orderNotes)
  const termsAccepted = useStorefrontStore((s) => s.termsAccepted)
  const paymentMethods = useStorefrontStore((s) => s.paymentMethods)
  const selectedPaymentMethod = useStorefrontStore((s) => s.selectedPaymentMethod)
  const createdOrder = useStorefrontStore((s) => s.createdOrder)
  const storeWhatsApp = useStorefrontStore((s) => s.storeWhatsApp)

  const setCheckoutOpen = useStorefrontStore((s) => s.setCheckoutOpen)
  const setCheckoutStep = useStorefrontStore((s) => s.setCheckoutStep)
  const setCheckoutLoading = useStorefrontStore((s) => s.setCheckoutLoading)
  const setCustomerName = useStorefrontStore((s) => s.setCustomerName)
  const setCustomerEmail = useStorefrontStore((s) => s.setCustomerEmail)
  const setCustomerPhone = useStorefrontStore((s) => s.setCustomerPhone)
  const setCustomerAddress = useStorefrontStore((s) => s.setCustomerAddress)
  const setOrderNotes = useStorefrontStore((s) => s.setOrderNotes)
  const setTermsAccepted = useStorefrontStore((s) => s.setTermsAccepted)
  const setSelectedPaymentMethod = useStorefrontStore((s) => s.setSelectedPaymentMethod)
  const setCreatedOrder = useStorefrontStore((s) => s.setCreatedOrder)

  const shippingCost = cart.totalPrice() > 199 ? 0 : 15
  const orderTotal = cart.totalPrice() + shippingCost

  const isMercadoPagoSelected = selectedPaymentMethod
    ? paymentMethods.find((m) => m.id === selectedPaymentMethod)?.type === 'mercadopago'
    : false

  const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('51')) return digits
    if (digits.length === 9) return '51' + digits
    return '51' + digits
  }

  const closeCheckoutAndCleanup = () => {
    setCheckoutOpen(false)
    setCreatedOrder(null)
    setCheckoutStep(1)
  }

  const handleMercadoPagoCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const formattedPhone = formatPhone(customerPhone)
      const checkoutResponse = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: user?.storeId || 'kmpw0h5ig4o518kg4zsm5huo3',
          customerName,
          customerEmail,
          customerPhone: formattedPhone,
          customerAddress,
          items: cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          notes: orderNotes,
          paymentMethodId: selectedPaymentMethod || null,
          userId: user?.id || null,
        }),
      })
      const checkoutData = await checkoutResponse.json()
      if (!checkoutResponse.ok || !checkoutData.id) {
        throw new Error(checkoutData.message || checkoutData.error || 'Error al crear el pedido')
      }

      const mpResponse = await fetch('/api/payments/mercadopago/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: checkoutData.id,
          storeId: user?.storeId || 'kmpw0h5ig4o518kg4zsm5huo3',
          items: cart.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customerName,
          customerEmail: user?.email || undefined,
        }),
      })
      const mpData = await mpResponse.json()
      if (!mpResponse.ok || !mpData.initPoint) {
        throw new Error(mpData.error || 'Error al crear la preferencia de pago')
      }

      toast({
        title: 'Redirigiendo a MercadoPago...',
        description: 'Serás redirigido para completar el pago de forma segura.',
        duration: 1000,
      })
      setCreatedOrder(checkoutData)
      cart.clearCart()
      window.location.href = mpData.initPoint
    } catch (error: any) {
      console.error('[MercadoPago Checkout] Error:', error)
      toast({ title: 'Error con MercadoPago', description: error.message || 'Intenta de nuevo.', variant: 'destructive' })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (isMercadoPagoSelected) {
      await handleMercadoPagoCheckout()
      return
    }
    setCheckoutLoading(true)
    try {
      const formattedPhone = formatPhone(customerPhone)
      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: user?.storeId || 'kmpw0h5ig4o518kg4zsm5huo3',
          customerName,
          customerEmail,
          customerPhone: formattedPhone,
          customerAddress,
          items: cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          notes: orderNotes,
          paymentMethodId: selectedPaymentMethod || null,
          userId: user?.id || null,
        }),
      })
      const data = await response.json()
      if (response.ok && data.orderNumber) {
        setCreatedOrder(data)
        setCheckoutStep(3)
        cart.clearCart()
        toast({ title: 'Pedido creado exitosamente', description: `Pedido #${data.orderNumber}`, variant: 'default' })
      } else {
        throw new Error(data.message || 'Error creating order')
      }
    } catch (error: any) {
      console.error('[Checkout] Error:', error)
      toast({ title: 'Error al crear el pedido', description: error.message || 'Intenta de nuevo.', variant: 'destructive' })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const shareOrderByWhatsApp = () => {
    if (!createdOrder) return
    const message = encodeURIComponent(`Hola! Acabo de realizar un pedido:

Pedido: #${createdOrder.orderNumber}
Total: S/ ${createdOrder.total.toFixed(2)}
Estado: ${createdOrder.status}

Gracias!`)
    window.open(`https://wa.me/${storeWhatsApp}?text=${message}`, '_blank')
  }

  return (
    <Dialog open={checkoutOpen} onOpenChange={(open) => { if (!open) closeCheckoutAndCleanup() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {checkoutStep === 1 && 'Datos de Contacto'}
            {checkoutStep === 2 && 'Resumen del Pedido'}
            {checkoutStep === 3 && '¡Pedido Confirmado!'}
          </DialogTitle>
          <DialogDescription>
            {checkoutStep === 1 && 'Completa tus datos para finalizar la compra'}
            {checkoutStep === 2 && 'Revisa tu pedido antes de confirmar'}
            {checkoutStep === 3 && 'Tu pedido ha sido creado exitosamente'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 - Contact Info */}
        {checkoutStep === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre completo <span className="text-red-500">*</span></Label>
              <Input
                id="customerName"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email (para recibir confirmación)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="tu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Teléfono / WhatsApp <span className="text-red-500">*</span></Label>
              <Input
                id="customerPhone"
                placeholder="51 999 999 999"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                type="tel"
              />
              <p className="text-xs text-muted-foreground/70">Formato: 51 999 999 999</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Dirección de envío</Label>
              <Input
                id="customerAddress"
                placeholder="Tu dirección (opcional)"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderNotes">Notas del pedido</Label>
              <Textarea
                id="orderNotes"
                placeholder="Instrucciones especiales, horario de entrega, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={closeCheckoutAndCleanup}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setCheckoutStep(2)}
                disabled={!customerName.trim() || !customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 9}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2 - Order Summary */}
        {checkoutStep === 2 && (
          <div className="space-y-4 py-2">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Talla: {item.size} · Color: {item.color}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">S/ {cart.totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className={`font-medium ${shippingCost === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {shippingCost === 0 ? 'GRATIS' : `S/ ${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">S/ {orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method selection */}
            {paymentMethods.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Método de Pago</Label>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentMethod === method.id
                    const typeColors: Record<string, string> = {
                      yape: 'border-purple-300 bg-purple-50',
                      plin: 'border-teal-300 bg-teal-50',
                      efectivo: 'border-green-300 bg-green-50',
                      transferencia: 'border-blue-300 bg-blue-50',
                      tarjeta: 'border-orange-300 bg-orange-50',
                      niubiz: 'border-red-300 bg-red-50',
                      mercadopago: 'border-sky-300 bg-sky-50',
                      otro: 'border-neutral-300 bg-neutral-50',
                    }
                    const selectedColor = typeColors[method.type] || 'border-amber-300 bg-amber-50'
                    const typeEmojis: Record<string, string> = {
                      yape: '💜', plin: '💚', efectivo: '💵', transferencia: '🏦',
                      tarjeta: '💳', niubiz: '🔴', mercadopago: '💙', otro: '💰',
                    }
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected ? selectedColor + ' ring-2 ring-offset-1 ring-amber-400' : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-lg">{typeEmojis[method.type] || '💰'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{method.name}</p>
                          {method.accountNumber && (
                            <p className="text-xs text-muted-foreground truncate">{method.accountNumber}</p>
                          )}
                          {method.accountHolder && (
                            <p className="text-xs text-muted-foreground truncate">{method.accountHolder}</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {/* Show QR code if selected method has one */}
                {selectedPaymentMethod && paymentMethods.find(m => m.id === selectedPaymentMethod)?.qrCode && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground">Escanea el QR para pagar</p>
                    <img
                      src={paymentMethods.find(m => m.id === selectedPaymentMethod)!.qrCode}
                      alt="QR de pago"
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                    <p className="text-sm font-bold text-foreground">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)!.accountNumber}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-snug">
                  Acepto los{' '}
                  <span className="text-amber-500 hover:underline cursor-pointer">términos y condiciones</span>
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-2 flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setCheckoutStep(1)}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Atrás
              </Button>
              {isMercadoPagoSelected ? (
                <Button
                  className="rounded-xl bg-[#009ee3] hover:bg-[#0086c1] text-white font-semibold"
                  onClick={handleCheckout}
                  disabled={!termsAccepted || checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirigiendo...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagar con MercadoPago · S/ {orderTotal.toFixed(2)}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleCheckout}
                  disabled={!termsAccepted || checkoutLoading || (paymentMethods.length > 0 && !selectedPaymentMethod)}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar Pedido · S/ {orderTotal.toFixed(2)}
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* Step 3 - Success */}
        {checkoutStep === 3 && createdOrder && (
          <div className="flex flex-col items-center text-center py-6 space-y-5">
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                ¡Pedido Confirmado!
              </h3>
              <p className="text-muted-foreground">
                Tu pedido ha sido creado exitosamente
              </p>
            </div>

            <div className="bg-muted rounded-xl px-6 py-4 border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Número de pedido</p>
              <p className="text-2xl font-bold text-foreground mt-1">#{createdOrder.orderNumber}</p>
              <Separator className="my-3" />
              <p className="text-sm text-muted-foreground">Total pagado</p>
              <p className="text-xl font-bold text-amber-500">S/ {createdOrder.total.toFixed(2)}</p>
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Te contactaremos por WhatsApp para confirmar
            </p>

            <div className="w-full space-y-2 pt-2">
              <Button
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={shareOrderByWhatsApp}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Compartir por WhatsApp
              </Button>
              {user && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-semibold"
                  onClick={() => { closeCheckoutAndCleanup(); router.push('/cliente') }}
                >
                  Ver mis pedidos
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full rounded-xl font-semibold text-muted-foreground"
                onClick={closeCheckoutAndCleanup}
              >
                Seguir comprando
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
