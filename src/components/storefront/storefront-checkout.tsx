'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, ChevronRight, ChevronLeft, Check, Loader2, CreditCard, Truck, Banknote, Smartphone } from 'lucide-react'
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

// ═══════════════════════════════════════════════════════════════════
// PERUVIAN CHECKOUT — Contra Entrega + Yape/Plin + MercadoPago
// ═══════════════════════════════════════════════════════════════════
// Métodos de pago nativos (SIEMPRE disponibles, sin configuración):
//   💵 Contra Entrega Efectivo — Paga con billetes al recibir
//   💜 Contra Entrega Yape/Plin — Transferencia al recibir
//   💙 MercadoPago — Tarjeta, cuotas, transferencia online
//
// Métodos adicionales vienen de la DB (paymentMethods del admin).
// ═══════════════════════════════════════════════════════════════════

// Built-in payment methods that are ALWAYS available (no config needed)
const NATIVE_PAYMENT_METHODS = [
  {
    id: '__contra_efectivo',
    type: 'contra_entrega_efectivo',
    name: 'Contra Entrega — Efectivo',
    description: 'Pagas con billetes cuando llega tu pedido',
    emoji: '💵',
    color: 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/30',
  },
  {
    id: '__contra_yape',
    type: 'contra_entrega_yape',
    name: 'Contra Entrega — Yape / Plin',
    description: 'Haces la transferencia cuando llega tu pedido',
    emoji: '💜',
    color: 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/30',
  },
  {
    id: '__mercadopago',
    type: 'mercadopago',
    name: 'MercadoPago',
    description: 'Tarjeta, cuotas sin interés, transferencia',
    emoji: '💙',
    color: 'border-sky-300 bg-sky-50 dark:border-sky-600 dark:bg-sky-900/30',
  },
]

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
  const customerDistrict = useStorefrontStore((s) => s.customerAddress)
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

  // Determine which payment type is selected
  const selectedType = selectedPaymentMethod
    ? NATIVE_PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.type ||
      paymentMethods.find(m => m.id === selectedPaymentMethod)?.type ||
      ''
    : ''

  const isMercadoPagoSelected = selectedType === 'mercadopago'
  const isContraEntrega = selectedType === 'contra_entrega_efectivo' || selectedType === 'contra_entrega_yape'

  // Auto-select first payment method if none selected
  const allPaymentMethods = [...NATIVE_PAYMENT_METHODS, ...paymentMethods.map(m => ({
    id: m.id,
    type: m.type,
    name: m.name,
    description: '',
    emoji: {
      yape: '💜', plin: '💚', efectivo: '💵', transferencia: '🏦',
      tarjeta: '💳', niubiz: '🔴', otro: '💰',
    }[m.type] || '💰',
    color: {
      yape: 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/30',
      plin: 'border-teal-300 bg-teal-50 dark:border-teal-600 dark:bg-teal-900/30',
      efectivo: 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/30',
      transferencia: 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30',
      tarjeta: 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/30',
      niubiz: 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/30',
      otro: 'border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800',
    }[m.type] || 'border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800',
  }))]

  const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('51')) return digits
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
          paymentMethodId: null, // Will be set by MercadoPago
          paymentMethodLabel: 'MercadoPago',
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

      // Build payment label for contra entrega
      const paymentLabel = isContraEntrega
        ? (selectedType === 'contra_entrega_efectivo' ? 'Contra Entrega (Efectivo)' : 'Contra Entrega (Yape/Plin)')
        : paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Pago al entregar'

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
          // Only send paymentMethodId for non-built-in methods
          paymentMethodId: selectedPaymentMethod?.startsWith('__') ? null : (selectedPaymentMethod || null),
          paymentMethodLabel: paymentLabel,
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
    const paymentLabel = selectedType === 'contra_entrega_efectivo' ? 'Efectivo al recibir' : selectedType === 'contra_entrega_yape' ? 'Yape/Plin al recibir' : 'MercadoPago'
    const message = encodeURIComponent(`Hola! Acabo de realizar un pedido:

Pedido: #${createdOrder.orderNumber}
Total: S/ ${createdOrder.total.toFixed(2)}
Pago: ${paymentLabel}

Gracias!`)
    window.open(`https://wa.me/${storeWhatsApp}?text=${message}`, '_blank')
  }

  // ── Step indicator ──
  const stepLabels = ['Datos', 'Pago', 'Confirmado']

  return (
    <Dialog open={checkoutOpen} onOpenChange={(open) => { if (!open) closeCheckoutAndCleanup() }}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto p-0">
        {/* ── Step indicator bar ── */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-1 px-6">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1
            const isActive = checkoutStep >= stepNum
            const isCurrent = checkoutStep === stepNum
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-400'
                  }`}>
                    {isActive && checkoutStep > stepNum ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full transition-colors ${checkoutStep > stepNum ? 'bg-amber-500' : 'bg-neutral-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        <DialogHeader className="px-6 pb-2 pt-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-4.5 h-4.5" />
            {checkoutStep === 1 && 'Datos de Envío'}
            {checkoutStep === 2 && 'Método de Pago'}
            {checkoutStep === 3 && 'Pedido Confirmado'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {checkoutStep === 1 && 'Ingresa tus datos para el envío'}
            {checkoutStep === 2 && 'Elige cómo quieres pagar'}
            {checkoutStep === 3 && 'Tu pedido ha sido creado exitosamente'}
          </DialogDescription>
        </DialogHeader>

        {/* ═══ STEP 1 — Contact & Shipping ═══ */}
        {checkoutStep === 1 && (
          <div className="space-y-4 px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="customerName" className="text-xs font-medium">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="Juan Pérez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerEmail" className="text-xs font-medium">
                  Email
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone" className="text-xs font-medium">
                  WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  placeholder="999 999 999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  type="tel"
                  className="h-10 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerAddress" className="text-xs font-medium">
                Dirección de envío <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerAddress"
                placeholder="Av. Arequipa 1234, Lima Centro"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="h-10 rounded-lg text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Incluye calle, número y referencias si es posible</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orderNotes" className="text-xs font-medium">
                Notas del pedido <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="orderNotes"
                placeholder="Horario de entrega, punto de referencia, detalle de piso..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                className="rounded-lg text-sm"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-2">
              <Button variant="outline" onClick={closeCheckoutAndCleanup} className="rounded-lg h-10 text-sm">
                Cancelar
              </Button>
              <Button
                className="rounded-lg h-10 text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={() => setCheckoutStep(2)}
                disabled={!customerName.trim() || !customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 9 || !customerAddress.trim()}
              >
                Continuar al pago
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ═══ STEP 2 — Payment Method + Order Summary ═══ */}
        {checkoutStep === 2 && (
          <div className="space-y-4 px-6 pb-6">
            {/* Order summary (compact) */}
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {cart.items.length} producto{cart.items.length > 1 ? 's' : ''}
                </span>
                <span className="font-semibold">S/ {cart.totalPrice().toFixed(2)}</span>
              </div>
              {cart.items.slice(0, 3).map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-background flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-medium">x{item.quantity}</span>
                </div>
              ))}
              {cart.items.length > 3 && (
                <p className="text-[11px] text-muted-foreground">+ {cart.items.length - 3} producto{cart.items.length - 3 > 1 ? 's' : ''} más</p>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Envío</span>
                <span className={`text-xs font-semibold ${shippingCost === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {shippingCost === 0 ? 'GRATIS' : `S/ ${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Total</span>
                <span className="text-lg font-bold text-foreground">S/ {orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* ── Payment Method Selection ── */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Elige cómo pagar
              </Label>
              <div className="grid gap-2">
                {allPaymentMethods.map((method) => {
                  const isSelected = selectedPaymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? (method.color || 'border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/30') + ' ring-2 ring-offset-1 ring-amber-400'
                          : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0">{method.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{method.name}</p>
                        {method.description && (
                          <p className="text-[11px] text-muted-foreground">{method.description}</p>
                        )}
                        {/* DB methods extra info */}
                        {!method.id.startsWith('__') && paymentMethods.find(m => m.id === method.id) && (
                          <>
                            {paymentMethods.find(m => m.id === method.id)!.accountNumber && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {paymentMethods.find(m => m.id === method.id)!.accountNumber}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      {/* Recommended badges */}
                      {method.id === '__contra_efectivo' && (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          POPULAR
                        </span>
                      )}
                      {method.id === '__mercadopago' && (
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          SEGURO
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* QR code for DB payment methods */}
            {selectedPaymentMethod && !selectedPaymentMethod.startsWith('__') && paymentMethods.find(m => m.id === selectedPaymentMethod)?.qrCode && (
              <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl">
                <p className="text-xs font-medium text-muted-foreground">Escanea el QR para pagar</p>
                <img
                  src={paymentMethods.find(m => m.id === selectedPaymentMethod)!.qrCode}
                  alt="QR de pago"
                  className="w-36 h-36 object-contain rounded-lg"
                />
                <p className="text-sm font-bold text-foreground">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)!.accountNumber}
                </p>
              </div>
            )}

            {/* Contra Entrega info box */}
            {isContraEntrega && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                    Pago Contra Entrega
                  </p>
                  <p className="text-[11px] text-green-700 dark:text-green-400 mt-0.5">
                    {selectedType === 'contra_entrega_efectivo'
                      ? 'El repartidor llevará tu pedido y pagarás con efectivo al recibir. Ten listo el monto exacto: S/ ' + orderTotal.toFixed(2)
                      : 'Al llegar tu pedido, el repartidor te compartirá su Yape/Plin para hacer la transferencia. Monto: S/ ' + orderTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* MercadoPago info box */}
            {isMercadoPagoSelected && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
                <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                    Pago seguro con MercadoPago
                  </p>
                  <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">
                    Tarjeta de débito/crédito, cuotas sin interés, transferencia bancaria. Serás redirigido a la plataforma de pago más segura de Latinoamérica.
                  </p>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-xs font-normal cursor-pointer leading-snug text-muted-foreground">
                Acepto los{' '}
                <span className="text-amber-500 hover:underline cursor-pointer font-medium">términos y condiciones</span>
                {' '}y la{' '}
                <span className="text-amber-500 hover:underline cursor-pointer font-medium">política de privacidad</span>
              </Label>
            </div>

            <DialogFooter className="pt-1 flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setCheckoutStep(1)} className="rounded-lg h-10 text-sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Atrás
              </Button>
              {isMercadoPagoSelected ? (
                <Button
                  className="rounded-lg h-11 text-sm font-bold bg-[#009ee3] hover:bg-[#0086c1] text-white"
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
                      Pagar S/ {orderTotal.toFixed(2)} con MercadoPago
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="rounded-lg h-11 text-sm font-bold bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCheckout}
                  disabled={!termsAccepted || checkoutLoading || !selectedPaymentMethod}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 mr-2" />
                      Confirmar Pedido · S/ {orderTotal.toFixed(2)}
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* ═══ STEP 3 — Success ═══ */}
        {checkoutStep === 3 && createdOrder && (
          <div className="flex flex-col items-center text-center py-6 px-6 space-y-5">
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

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                ¡Pedido Confirmado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Te contactaremos por WhatsApp para coordinar
              </p>
            </div>

            <div className="bg-muted rounded-xl px-6 py-4 border w-full">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Número de pedido</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">#{createdOrder.orderNumber}</p>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-amber-500">S/ {createdOrder.total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Método de pago</p>
                  <p className="text-sm font-semibold text-foreground">
                    {isContraEntrega
                      ? selectedType === 'contra_entrega_efectivo' ? '💵 Efectivo' : '💜 Yape/Plin'
                      : '💙 MercadoPago'}
                  </p>
                </div>
              </div>
            </div>

            {isContraEntrega && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 w-full text-left">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                    Entrega en 1-3 días hábiles
                  </p>
                  <p className="text-[11px] text-green-700 dark:text-green-400 mt-0.5">
                    {selectedType === 'contra_entrega_efectivo'
                      ? 'Ten listo el monto exacto en efectivo: S/ ' + createdOrder.total.toFixed(2)
                      : 'Prepara tu Yape/Plin para transferir al repartidor: S/ ' + createdOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="w-full space-y-2 pt-2">
              <Button
                className="w-full rounded-lg h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
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
                  className="w-full rounded-lg font-semibold text-sm"
                  onClick={() => { closeCheckoutAndCleanup(); router.push('/cliente') }}
                >
                  Ver mis pedidos
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full rounded-lg text-sm text-muted-foreground"
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
