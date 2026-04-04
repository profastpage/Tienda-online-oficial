'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Star,
  Shield,
  Smartphone,
  BarChart3,
  Globe,
  Bot,
  HeadphonesIcon,
  ChevronRight,
  Check,
  Menu,
  X,
  ArrowRight,
  Zap,
  Store,
  UserPlus,
  Settings,
  CreditCard,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useViewStore } from '@/stores/view-store'
import { useState, useEffect, useRef, type ReactNode } from 'react'

// ─── WhatsApp Icon SVG ─────────────────────────────────────────────
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Animated Counter ──────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const numericTarget = parseInt(target.replace(/\D/g, ''))
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const steps = 60
    const increment = numericTarget / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericTarget) {
        setCount(numericTarget)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericTarget, isInView])

  const prefix = target.match(/^[^0-9]*/)?.[0] || ''
  const postfix = target.match(/[^0-9]*$/)?.[0] || suffix

  return <span ref={ref}>{prefix}{count}{postfix}</span>
}

// ─── FadeInUp Animation Wrapper ────────────────────────────────────
function FadeInUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger Container ─────────────────────────────────────────────
function StaggerContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Constants ─────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '51933667414'
const HERO_IMAGE = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80&auto=format'

const brands = ['NIKE', 'ADIDAS', 'PUMA', 'NEW BALANCE', 'VANS', 'CONVERSE', 'JORDAN', 'REEBOK', 'UNDER ARMOUR', 'FILA']

const features = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Catálogo Digital',
    description: 'Gestiona tu inventario con fotos, precios, variantes y categorías. Actualización en tiempo real.',
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'WhatsApp Integrado',
    description: 'Recibe pedidos directamente por WhatsApp. Notificaciones automáticas para cada venta.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Panel de Admin',
    description: 'Dashboard completo con métricas de ventas, gestión de pedidos y reportes detallados.',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'PWA App',
    description: 'Tu tienda funciona como app móvil. Instalable, rápida y sin necesidad de Play Store.',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'Cotizador IA',
    description: 'Asistente inteligente que genera cotizaciones automáticas para tus clientes.',
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6" />,
    title: 'Soporte 24/7',
    description: 'Equipo dedicado de soporte técnico. Respuesta garantizada en menos de 2 horas.',
  },
]

const steps = [
  {
    icon: <UserPlus className="w-8 h-8" />,
    step: '01',
    title: 'Regístrate',
    description: 'Crea tu cuenta en 30 segundos. Sin tarjeta de crédito ni compromisos. Comienza gratis.',
  },
  {
    icon: <Settings className="w-8 h-8" />,
    step: '02',
    title: 'Configura',
    description: 'Personaliza tu tienda con logo, colores, productos y métodos de pago. Todo intuitivo.',
  },
  {
    icon: <Store className="w-8 h-8" />,
    step: '03',
    title: 'Vende',
    description: 'Comparte tu tienda y empieza a recibir pedidos por WhatsApp. ¡Es así de fácil!',
  },
]

const plans = [
  {
    name: 'Básico',
    price: 'S/49',
    period: '/mes',
    description: 'Perfecto para comenzar',
    features: [
      'Hasta 50 productos',
      '1 usuario admin',
      'Catálogo digital',
      'WhatsApp básico',
      'Soporte por email',
      'Tema personalizable',
    ],
    highlighted: false,
    cta: 'Comenzar Gratis',
  },
  {
    name: 'Pro',
    price: 'S/89',
    period: '/mes',
    description: 'Para negocios en crecimiento',
    features: [
      'Hasta 200 productos',
      '3 usuarios admin',
      'Catálogo digital',
      'WhatsApp Business',
      'Panel de métricas',
      'PWA App',
      'Soporte prioritario',
    ],
    highlighted: false,
    cta: 'Elegir Pro',
  },
  {
    name: 'Premium',
    price: 'S/129',
    period: '/mes',
    description: 'Recomendado para escalar',
    features: [
      'Productos ilimitados',
      '10 usuarios admin',
      'Catálogo digital',
      'WhatsApp Business Pro',
      'Panel avanzado',
      'PWA App',
      'Cotizador IA',
      'Soporte 24/7',
      'Dominio personalizado',
    ],
    highlighted: true,
    cta: 'Elegir Premium',
  },
  {
    name: 'Empresarial',
    price: 'Cotizar',
    period: '',
    description: 'Solución a medida',
    features: [
      'Todo en Premium',
      'Usuarios ilimitados',
      'API personalizada',
      'Integración ERP/CRM',
      'SLA garantizado',
      'Manager dedicado',
      'Capacitación incluida',
      'Multi-sucursal',
    ],
    highlighted: false,
    cta: 'Contactar Ventas',
  },
]

const testimonials = [
  {
    name: 'María García',
    role: 'Dueña de MG Fashion',
    content: 'Increíble plataforma. Pasé de vender por fotos en WhatsApp a tener una tienda profesional en minutos. Mis ventas aumentaron 300% en el primer mes.',
    rating: 5,
  },
  {
    name: 'Carlos Mendoza',
    role: 'CEO de TechStore Perú',
    content: 'El panel de administración es excelente. Puedo ver todas mis métricas y gestionar pedidos desde cualquier lugar. Soporte técnico de primera.',
    rating: 5,
  },
  {
    name: 'Ana Lucía Torres',
    role: 'Fundadora de NaturalShop',
    content: 'La integración con WhatsApp cambió todo. Ahora mis clientes hacen pedidos sin salir de la conversación. Espectacular experiencia.',
    rating: 5,
  },
  {
    name: 'Roberto Sánchez',
    role: 'Gerente de UrbanStyle',
    content: 'Probamos varias plataformas pero Tienda Online Oficial es la mejor. Rápida, confiable y con un precio justo. 100% recomendada.',
    rating: 4,
  },
]

// ─── Star Rating Component ─────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function SaasLanding() {
  const { setView } = useViewStore()
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero información sobre la plataforma Tienda Online Oficial. Gracias!')}`

  const navLinks = [
    { label: 'Características', href: '#features' },
    { label: 'Cómo Funciona', href: '#how-it-works' },
    { label: 'Precios', href: '#pricing' },
    { label: 'Testimonios', href: '#testimonials' },
    { label: 'Contacto', href: '#contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══ Fixed Header ═══ */}
      <AnimatePresence>
        {scrollY > 50 && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-md border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg tracking-tight">Tienda Online Oficial</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-300 hover:text-white hidden sm:inline-flex"
                    onClick={() => setView('auth')}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setView('register')}
                  >
                    Crear mi Tienda
                  </Button>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative h-screen min-h-[100dvh] flex items-center justify-center">
        {/* Full-bleed background image using <img> tag */}
        <img
          src={HERO_IMAGE}
          alt="Tienda Online Oficial - Plataforma e-commerce"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

        {/* Hero Content - centered */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge className="mb-6 px-4 py-1.5 bg-white/15 text-white hover:bg-white/15 border-white/20 text-sm backdrop-blur-sm">
              ✨ Plataforma #1 en Perú
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
          >
            Tu Tienda Online{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">
              Profesional
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-neutral-200 font-semibold">
              en Minutos
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Crea tu tienda online profesional sin conocimientos técnicos.
            Gestiona pedidos por WhatsApp, acepta pagos y haz crecer tu negocio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 h-13 text-base font-semibold shadow-lg shadow-amber-500/30"
              onClick={() => setView('register')}
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-13 text-base font-semibold border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              onClick={() => setView('store-demo')}
            >
              Ver Demo
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          {/* WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              ¿Tienes dudas? Escríbenos por WhatsApp
            </a>
          </motion.div>

          {/* Stats row - desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="hidden lg:flex items-center justify-center gap-10 mt-12"
          >
            {[
              { value: '500+', label: 'Tiendas Activas' },
              { value: 'S/2M+', label: 'Ventas Procesadas' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter target={stat.value} />
                </p>
                <p className="text-sm text-neutral-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative floating cards - desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="hidden xl:block absolute top-1/4 left-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">+32 ventas hoy</p>
              <p className="text-neutral-400 text-xs">↑ 18% vs ayer</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="hidden xl:block absolute bottom-1/3 right-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">4.9/5 estrellas</p>
              <p className="text-neutral-400 text-xs">+200 reseñas</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        {/* Mobile nav bar at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:hidden">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      Tienda Online Oficial
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-1">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                    <Separator className="my-3" />
                    <button
                      onClick={() => { setView('auth'); setMobileMenuOpen(false) }}
                      className="block w-full text-left px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 font-semibold"
              onClick={() => setView('register')}
            >
              Crear Tienda
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BRAND LOGOS MARQUEE ═══════════════════ */}
      <section className="py-8 bg-neutral-50 border-b border-neutral-200">
        <FadeInUp>
          <p className="text-center text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-6">
            Marcas que confían en nosotros
          </p>
        </FadeInUp>
        <div className="overflow-hidden">
          <div className="flex animate-marquee">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex shrink-0 items-center gap-12 px-6">
                {brands.map((brand) => (
                  <span
                    key={`${setIdx}-${brand}`}
                    className="text-2xl font-bold text-neutral-300 whitespace-nowrap tracking-wider select-none"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES SECTION ═══════════════════ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-700 hover:bg-amber-50">
              Características
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Todo lo que necesitas para vender online
            </h2>
            <p className="mt-4 text-neutral-500 text-lg max-w-2xl mx-auto">
              Herramientas profesionales diseñadas para que tu negocio destaque en el mundo digital.
            </p>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="group h-full border-neutral-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 py-0 gap-0">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-700 hover:bg-amber-50">
              Cómo Funciona
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Tu tienda lista en 3 simples pasos
            </h2>
            <p className="mt-4 text-neutral-500 text-lg max-w-2xl mx-auto">
              Sin complicaciones, sin código, sin esperas. Empieza a vender hoy mismo.
            </p>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <StaggerItem key={step.title}>
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10 border border-neutral-100">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-neutral-900">{step.title}</h3>
                  <p className="mt-3 text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex justify-center mt-4">
                      <ArrowRight className="w-5 h-5 text-neutral-300" />
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInUp delay={0.3} className="text-center mt-12">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 h-12 font-semibold shadow-lg shadow-amber-500/20"
              onClick={() => setView('register')}
            >
              Comenzar Ahora — Es Gratis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </FadeInUp>
        </div>
      </section>

      {/* ═══════════════════ PRICING SECTION ═══════════════════ */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-700 hover:bg-amber-50">
              Precios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Planes para cada etapa de tu negocio
            </h2>
            <p className="mt-4 text-neutral-500 text-lg max-w-2xl mx-auto">
              Comienza gratis y escala según creces. Sin contratos de permanencia.
            </p>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <StaggerItem key={plan.name}>
                <Card
                  className={`relative h-full flex flex-col ${
                    plan.highlighted
                      ? 'border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20'
                      : 'border-neutral-100 hover:border-neutral-200 hover:shadow-md'
                  } transition-all duration-300 py-0 gap-0`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                        ⭐ Recomendado
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-2">
                    <div className="mb-6">
                      <span className={`text-4xl font-bold ${plan.highlighted ? 'text-amber-600' : 'text-neutral-900'}`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-neutral-400 text-sm ml-1">{plan.period}</span>
                      )}
                    </div>
                    <Separator className="mb-6" />
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlighted ? 'bg-amber-100' : 'bg-green-100'}`}>
                            <Check className={`w-2.5 h-2.5 ${plan.highlighted ? 'text-amber-600' : 'text-green-600'}`} />
                          </div>
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className={`w-full rounded-full h-11 font-semibold ${
                        plan.highlighted
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      }`}
                      onClick={() => setView('register')}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInUp delay={0.3} className="text-center mt-10">
            <p className="text-sm text-neutral-400">
              Todos los planes incluyen <span className="text-neutral-600 font-medium">SSL gratuito</span>,{' '}
              <span className="text-neutral-600 font-medium">backups automáticos</span> y{' '}
              <span className="text-neutral-600 font-medium">actualizaciones</span>.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS SECTION ═══════════════════ */}
      <section id="testimonials" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-700 hover:bg-amber-50">
              Testimonios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Lo que dicen nuestros clientes
            </h2>
            <p className="mt-4 text-neutral-500 text-lg max-w-2xl mx-auto">
              Miles de emprendedores ya confían en nuestra plataforma para hacer crecer su negocio.
            </p>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.name}>
                <Card className="h-full border-neutral-100 hover:shadow-md transition-shadow duration-300 py-0 gap-0">
                  <CardContent className="p-6">
                    <StarRating rating={testimonial.rating} />
                    <p className="mt-4 text-neutral-600 text-sm leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm truncate">{testimonial.name}</p>
                        <p className="text-neutral-400 text-xs truncate">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ CONTACT / CTA SECTION ═══════════════════ */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="relative bg-neutral-900 rounded-3xl overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10 px-6 py-16 sm:px-12 lg:px-20 lg:py-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white/70 text-sm mb-6 backdrop-blur-sm border border-white/10">
                  <Shield className="w-4 h-4" />
                  Comienza sin compromiso
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto">
                  ¿Listo para crear tu tienda online?
                </h2>
                <p className="mt-5 text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  Únete a más de 500 tiendas que ya están vendiendo más con nuestra plataforma.
                  Comienza gratis hoy y escala sin límites.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-10 h-14 text-base font-semibold shadow-xl shadow-amber-500/25"
                    onClick={() => setView('register')}
                  >
                    Crear mi Tienda Gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 h-14 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-base font-medium"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    Hablar con Ventas
                  </a>
                </div>

                {/* Contact info */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+51 933 667 414</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>hola@tiendaonlineoficial.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Lima, Perú</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-neutral-900 text-neutral-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">Tienda Online</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                La plataforma #1 en Perú para crear tu tienda online profesional. Simple, rápida y poderosa.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Producto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Actualizaciones</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Empresa</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Soporte</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <Separator className="bg-white/10" />
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>&copy; {new Date().getFullYear()} Tienda Online Oficial. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════ FLOATING WHATSAPP ═══════════════════ */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>
    </div>
  )
}
