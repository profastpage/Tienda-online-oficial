export interface PortfolioProject {
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  category: string
  tags: string[]
  businessName: string
  businessType: string
  location: string
  techStack: string[]
  features: string[]
  results: { metric: string; value: string }[]
  image: string  // hero screenshot placeholder
  mobileImage: string  // mobile screenshot placeholder  
  desktopImage: string // desktop screenshot placeholder
  color: string  // primary brand color hex
  liveUrl?: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'urban-style',
    title: 'Urban Style',
    subtitle: 'Streetwear Premium Peru',
    description: 'Tienda de moda urbana con catálogo interactivo, carrito de compras y pedidos por WhatsApp.',
    longDescription: 'Urban Style es una marca de streetwear peruano que necesitaba una presencia digital impactante. Creamos una tienda online completa con catálogo de productos, carrito de compras, checkout integrado y pedidos directos por WhatsApp. El resultado fue un aumento del 300% en ventas online.',
    category: 'Moda',
    tags: ['Streetwear', 'Moda', 'Urban', 'Perú'],
    businessName: 'Urban Style EIRL',
    businessType: 'Retail - Moda Urbana',
    location: 'Lima, Perú',
    techStack: ['Next.js', 'Tailwind CSS', 'Payload CMS', 'Supabase', 'WhatsApp API'],
    features: ['Catálogo interactivo', 'Carrito de compras', 'Pedidos por WhatsApp', 'PWA instalable', 'Panel de administración', 'SEO optimizado'],
    results: [
      { metric: 'Aumento en ventas', value: '+300%' },
      { metric: 'Tiempo de carga', value: '1.2s' },
      { metric: 'Conversión', value: '4.8%' },
    ],
    image: '/portfolio/urban-style-hero.jpg',
    mobileImage: '/portfolio/urban-style-mobile.jpg',
    desktopImage: '/portfolio/urban-style-desktop.jpg',
    color: '#0f172a',
    liveUrl: '/demo',
  },
  {
    slug: 'naturalshop',
    title: 'NaturalShop',
    subtitle: 'Productos Naturales & Orgánicos',
    description: 'E-commerce de productos naturales con categorías, filtro avanzado y suscripción mensual.',
    longDescription: 'NaturalShop es una tienda de productos naturales y orgánicos que buscaba expandir su alcance digital. Implementamos un e-commerce completo con sistema de suscripción, categorías dinámicas, filtro avanzado por atributos y pasarela de pago integrada.',
    category: 'Salud & Bienestar',
    tags: ['Orgánico', 'Natural', 'Salud', 'Bienestar'],
    businessName: 'NaturalShop SAC',
    businessType: 'Retail - Productos Naturales',
    location: 'Cusco, Perú',
    techStack: ['Next.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'MercadoPago'],
    features: ['Suscripción mensual', 'Filtros avanzados', 'Reseñas de clientes', 'Blog integrado', 'Email marketing', 'Tracking de envíos'],
    results: [
      { metric: 'Suscriptores', value: '+500' },
      { metric: 'Ticket promedio', value: 'S/185' },
      { metric: 'Recompra', value: '67%' },
    ],
    image: '/portfolio/naturalshop-hero.jpg',
    mobileImage: '/portfolio/naturalshop-mobile.jpg',
    desktopImage: '/portfolio/naturalshop-desktop.jpg',
    color: '#166534',
  },
  {
    slug: 'techstore-peru',
    title: 'TechStore Perú',
    subtitle: 'Electrónica & Gadgets',
    description: 'Tienda de tecnología con comparador de productos, wishlist y notificaciones de stock.',
    longDescription: 'TechStore Perú es una retailer de tecnología que necesitaba modernizar su plataforma online. Desarrollamos una tienda con comparador de productos, lista de deseos, alertas de stock y un panel administrativo avanzado con métricas en tiempo real.',
    category: 'Tecnología',
    tags: ['Electrónica', 'Gadgets', 'Tecnología', 'Perú'],
    businessName: 'TechStore Perú SRL',
    businessType: 'Retail - Electrónica',
    location: 'Arequipa, Perú',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Redis'],
    features: ['Comparador de productos', 'Lista de deseos', 'Alertas de stock', 'Notificaciones push', 'Panel métricas', 'Integración Yape/Plin'],
    results: [
      { metric: 'Productos', value: '2,500+' },
      { metric: 'Velocidad GTM', value: '0.8s' },
      { metric: 'Satisfacción', value: '4.9/5' },
    ],
    image: '/portfolio/techstore-hero.jpg',
    mobileImage: '/portfolio/techstore-mobile.jpg',
    desktopImage: '/portfolio/techstore-desktop.jpg',
    color: '#1e40af',
  },
  {
    slug: 'mg-fashion',
    title: 'MG Fashion',
    subtitle: 'Moda Femenina Premium',
    description: 'Boutique online con lookbook, guía de tallas con IA y probador virtual.',
    longDescription: 'MG Fashion es una boutique de moda femenina que quería una experiencia de compra premium online. Creamos una tienda con lookbook interactivo, guía de tallas asistida por IA, probador virtual y programa de fidelización de clientes.',
    category: 'Moda',
    tags: ['Fashion', 'Premium', 'Femenino', 'Boutique'],
    businessName: 'MG Fashion EIRL',
    businessType: 'Retail - Moda Femenina',
    location: 'Miraflores, Lima',
    techStack: ['Next.js', 'Payload CMS', 'Supabase', 'OpenAI', 'Vercel'],
    features: ['Lookbook interactivo', 'Guía de tallas IA', 'Probador virtual', 'Programa fidelidad', 'Gift cards', 'Chat IA para clientes'],
    results: [
      { metric: 'Ventas online', value: '+450%' },
      { metric: 'Devoluciones', value: '-60%' },
      { metric: 'NPS', value: '92' },
    ],
    image: '/portfolio/mg-fashion-hero.jpg',
    mobileImage: '/portfolio/mg-fashion-mobile.jpg',
    desktopImage: '/portfolio/mg-fashion-desktop.jpg',
    color: '#be185d',
  },
  {
    slug: 'sabor-criollo',
    title: 'Sabor Criollo',
    subtitle: 'Restaurantes & Delivery',
    description: 'Plataforma de delivery con menú digital, tracking en tiempo real y reservas online.',
    longDescription: 'Sabor Criollo es una cadena de restaurantes de comida peruana que necesitaba un sistema de delivery propio. Desarrollamos una plataforma completa con menú digital interactivo, tracking de pedidos en tiempo real, sistema de reservas y programa de puntos.',
    category: 'Food & Beverage',
    tags: ['Restaurante', 'Delivery', 'Comida Peruana', 'Food'],
    businessName: 'Sabor Criollo SA',
    businessType: 'Food & Beverage - Restaurantes',
    location: 'Lima, Perú (múltiples sedes)',
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Google Maps API', 'WebSocket'],
    features: ['Menú digital', 'Tracking GPS', 'Reservas online', 'Programa de puntos', 'Multi-sede', 'Notificaciones Push'],
    results: [
      { metric: 'Pedidos diarios', value: '350+' },
      { metric: 'Tiempo delivery', value: '-25%' },
      { metric: 'Rating', value: '4.8★' },
    ],
    image: '/portfolio/sabor-criollo-hero.jpg',
    mobileImage: '/portfolio/sabor-criollo-mobile.jpg',
    desktopImage: '/portfolio/sabor-criollo-desktop.jpg',
    color: '#b45309',
  },
  {
    slug: 'fitzone-peru',
    title: 'FitZone Perú',
    subtitle: 'Gimnasios & Bienestar',
    description: 'Plataforma de gestión para gimnasios con planes, reservas de clases y seguimiento.',
    longDescription: 'FitZone Perú es una cadena de gimnasios que necesitaba digitalizar su operación completa. Creamos una plataforma web con gestión de planes, reservas de clases en vivo, seguimiento de progreso de clientes y tienda de suplementos integrada.',
    category: 'Fitness & Salud',
    tags: ['Gimnasio', 'Fitness', 'Salud', 'Bienestar'],
    businessName: 'FitZone Perú SAC',
    businessType: 'Servicios - Fitness',
    location: 'Lima & Trujillo, Perú',
    techStack: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe', 'Socket.io'],
    features: ['Reserva de clases', 'Seguimiento progreso', 'Pagos online', 'Tienda suplementos', 'App PWA', 'Notificaciones'],
    results: [
      { metric: 'Miembros activos', value: '3,200+' },
      { metric: 'Retención', value: '89%' },
      { metric: 'Revenue mensual', value: '+180%' },
    ],
    image: '/portfolio/fitzone-hero.jpg',
    mobileImage: '/portfolio/fitzone-mobile.jpg',
    desktopImage: '/portfolio/fitzone-desktop.jpg',
    color: '#7c3aed',
  },
]

export const categories = ['Todos', ...Array.from(new Set(portfolioProjects.map(p => p.category)))]
