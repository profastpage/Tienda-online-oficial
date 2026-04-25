import type { Product, Category, Testimonial, StoreContentData } from './storefront-types'

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS LOCALES
// ═══════════════════════════════════════════════════════════════
export const localCategories: Category[] = [
  {
    id: 'cat-calzado',
    name: 'Calzado',
    slug: 'calzado',
    image: 'https://picsum.photos/id/119/600/450',
    _count: { products: 4 },
  },
  {
    id: 'cat-ropa-superior',
    name: 'Ropa Superior',
    slug: 'ropa-superior',
    image: 'https://picsum.photos/id/399/600/450',
    _count: { products: 4 },
  },
  {
    id: 'cat-accesorios',
    name: 'Accesorios',
    slug: 'accesorios',
    image: 'https://picsum.photos/id/274/600/450',
    _count: { products: 4 },
  },
]

// ═══════════════════════════════════════════════════════════════
// PRODUCTOS LOCALES (12 únicos, sin repetición de imágenes)
// ═══════════════════════════════════════════════════════════════
export const localProducts: Product[] = [
  // ── CALZADO (1–4) ───────────────────────────────────────────
  {
    id: 'prod-zapatilla-urban-runner',
    name: 'Zapatilla Urban Runner',
    slug: 'zapatilla-urban-runner',
    description:
      'Zapatilla urbana con suela de gel para máxima comodidad. Diseño minimalista en negro mate, perfecta para el día a día. Material sintético de alta resistencia y plantilla ergonómica.',
    price: 189.90,
    comparePrice: 249.90,
    image: 'https://picsum.photos/id/29/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/29/600/800',
      'https://picsum.photos/id/374/600/800',
    ]),
    sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Gris', hex: '#6b7280' },
    ]),
    discount: 24,
    isNew: true,
    rating: 4.5,
    reviewCount: 124,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },
  {
    id: 'prod-zapatilla-sport-pro',
    name: 'Zapatilla Sport Pro',
    slug: 'zapatilla-sport-pro',
    description:
      'Zapatilla deportiva de alto rendimiento con tecnología de amortiguación avanzada. Upper en malla transpirable y suela antideslizante. Ideal para running y entrenamientos.',
    price: 219.90,
    comparePrice: null,
    image: 'https://picsum.photos/id/599/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/599/600/800',
      'https://picsum.photos/id/96/600/800',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Rojo', hex: '#dc2626' },
      { name: 'Azul', hex: '#2563eb' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },
  {
    id: 'prod-botin-cuero-classic',
    name: 'Botín Cuero Classic',
    slug: 'botin-cuero-classic',
    description:
      'Botín de cuero genuino con acabado premium. Costuras reforzadas y suela de goma antideslizante. Un clásico atemporal que combina elegancia y durabilidad.',
    price: 289.90,
    comparePrice: 349.90,
    image: 'https://picsum.photos/id/1073/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/1073/600/800',
      'https://picsum.photos/id/416/600/800',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Café', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 17,
    isNew: false,
    rating: 4.8,
    reviewCount: 203,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },
  {
    id: 'prod-zapatilla-street-style',
    name: 'Zapatilla Street Style',
    slug: 'zapatilla-street-style',
    description:
      'Zapatilla inspirada en el streetwear contemporáneo. Plataforma elevada, diseño chunky y detalles en colores contrastantes. Perfecta para lucir un look urbano y audaz.',
    price: 169.90,
    comparePrice: null,
    image: 'https://picsum.photos/id/674/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/674/600/800',
      'https://picsum.photos/id/429/600/800',
    ]),
    sizes: JSON.stringify(['37', '38', '39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Beige', hex: '#d4a574' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.3,
    reviewCount: 67,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // ── ROPA SUPERIOR (5–8) ─────────────────────────────────────
  {
    id: 'prod-polo-basico-premium',
    name: 'Polo Básico Premium',
    slug: 'polo-basico-premium',
    description:
      'Polo de algodón pima 100% peruano con corte regular. Tejido suave al tacto, ideal para uso diario. Cuello reforzado que mantiene su forma lavado tras lavado.',
    price: 79.90,
    comparePrice: null,
    image: 'https://picsum.photos/id/399/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/399/600/800',
      'https://picsum.photos/id/401/600/800',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
      { name: 'Gris', hex: '#6b7280' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.6,
    reviewCount: 312,
    inStock: true,
    category: { name: 'Ropa Superior', slug: 'ropa-superior' },
  },
  {
    id: 'prod-hoodie-oversize',
    name: 'Hoodie Oversize Urban',
    slug: 'hoodie-oversize-urban',
    description:
      'Sudadera con capucha estilo oversize en felpa premium. Bolsillo canguro frontal, cordones ajustables y interior suave cepillado. El esencial de tu guardarropa urbano.',
    price: 149.90,
    comparePrice: 189.90,
    image: 'https://picsum.photos/id/407/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/407/600/800',
      'https://picsum.photos/id/410/600/800',
    ]),
    sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Gris Oscuro', hex: '#374151' },
      { name: 'Verde Oliva', hex: '#556b2f' },
    ]),
    discount: 21,
    isNew: true,
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    category: { name: 'Ropa Superior', slug: 'ropa-superior' },
  },
  {
    id: 'prod-casaca-windbreaker',
    name: 'Casaca Windbreaker Pro',
    slug: 'casaca-windbreaker-pro',
    description:
      'Chaqueta rompevientos ligera e impermeable. Capucha retráctil, costuras selladas y bolsillos con cierre. Perfecta para actividades al aire libre y el día a día.',
    price: 199.90,
    comparePrice: 259.90,
    image: 'https://picsum.photos/id/425/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/425/600/800',
      'https://picsum.photos/id/431/600/800',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Azul', hex: '#2563eb' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Rojo', hex: '#dc2626' },
    ]),
    discount: 23,
    isNew: true,
    rating: 4.4,
    reviewCount: 98,
    inStock: true,
    category: { name: 'Ropa Superior', slug: 'ropa-superior' },
  },
  {
    id: 'prod-polo-estampado-urban',
    name: 'Polo Estampado Urban',
    slug: 'polo-estampado-urban',
    description:
      'Polo con estampado gráfico exclusivo inspirado en el arte urbano. Algodón peinado de alta calidad con estampación serigráfica de larga duración. Declaración de estilo garantizada.',
    price: 89.90,
    comparePrice: null,
    image: 'https://picsum.photos/id/447/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/447/600/800',
      'https://picsum.photos/id/449/600/800',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.2,
    reviewCount: 45,
    inStock: true,
    category: { name: 'Ropa Superior', slug: 'ropa-superior' },
  },

  // ── ACCESORIOS (9–12) ───────────────────────────────────────
  {
    id: 'prod-mochila-laptop-pro',
    name: 'Mochila Laptop Pro',
    slug: 'mochila-laptop-pro',
    description:
      'Mochila profesional con compartimento acolchado para laptops de hasta 15.6 pulgadas. Material resistente al agua, múltiples bolsillos organizadores y correas ergonómicas.',
    price: 159.90,
    comparePrice: 199.90,
    image: 'https://picsum.photos/id/163/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/163/600/800',
      'https://picsum.photos/id/174/600/800',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: 20,
    isNew: false,
    rating: 4.6,
    reviewCount: 178,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'prod-gorra-snapback-classic',
    name: 'Gorra Snapback Classic',
    slug: 'gorra-snapback-classic',
    description:
      'Gorra snapback con visera plana y cierre ajustable. Diseño clásico bordado en 3D. Tela de algodón durable y corona estructurada para un ajuste perfecto.',
    price: 59.90,
    comparePrice: null,
    image: 'https://picsum.photos/id/225/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/225/600/800',
      'https://picsum.photos/id/229/600/800',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Rojo', hex: '#dc2626' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.4,
    reviewCount: 92,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'prod-reloj-deportivo-x',
    name: 'Reloj Deportivo X',
    slug: 'reloj-deportivo-x',
    description:
      'Reloj deportivo con pantalla digital retroiluminada, resistencia al agua 50m y cronómetro integrado. Correa de silicona ajustable y diseño moderno y resistente.',
    price: 129.90,
    comparePrice: 169.90,
    image: 'https://picsum.photos/id/415/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/415/600/800',
      'https://picsum.photos/id/433/600/800',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro/Acero', hex: '#1a1a1a' },
      { name: 'Azul/Acero', hex: '#2563eb' },
    ]),
    discount: 24,
    isNew: true,
    rating: 4.5,
    reviewCount: 134,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'prod-cinturon-cuero-genuine',
    name: 'Cinturón Cuero Genuine',
    slug: 'cinturon-cuero-genuine',
    description:
      'Cinturón de cuero genuino con hebilla de acero inoxidable pulido. Ancho estándar de 3.5 cm, flexible y resistente. Un accesorio esencial que complementa cualquier outfit.',
    price: 89.90,
    comparePrice: null,
    image: 'https://picsum.photos/id/225/600/800',
    images: JSON.stringify([
      'https://picsum.photos/id/225/600/800',
      'https://picsum.photos/id/274/600/800',
    ]),
    sizes: JSON.stringify(['85cm', '90cm', '95cm', '100cm', '105cm']),
    colors: JSON.stringify([
      { name: 'Café', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.3,
    reviewCount: 67,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
]

// ═══════════════════════════════════════════════════════════════
// TESTIMONIOS LOCALES
// ═══════════════════════════════════════════════════════════════
export const localTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'María García',
    role: 'Cliente frecuente',
    content: 'Increíble calidad en cada producto. Las zapatillas Urban Runner son súper cómodas y el envío fue rapidísimo. ¡Ya es mi tercera compra!',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Carlos López',
    role: 'Comprador verificado',
    content: 'El hoodie oversize es exactamente lo que buscaba. Tela premium y el tamaño es perfecto. Muy recomendado para quienes gustan del estilo urbano.',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Ana Torres',
    role: 'Cliente nueva',
    content: 'Compré la mochila Laptop Pro y superó mis expectativas. Tiene espacio para todo y se ve muy profesional. El precio es justo por la calidad.',
    rating: 4,
  },
  {
    id: 'test-4',
    name: 'Luis Ramírez',
    role: 'Comprador verificado',
    content: 'Las gorras snapback tienen un acabado excelente. El bordado se ve de alta calidad y la talla es ajustable. Volveré por más colores.',
    rating: 5,
  },
  {
    id: 'test-5',
    name: 'Sofía Martínez',
    role: 'Cliente frecuente',
    content: 'Me encanta la casaca Windbreaker, es liviana pero abriga bien. La usé en la sierra y funcionó perfecto. Calidad premium sin duda.',
    rating: 4,
  },
  {
    id: 'test-6',
    name: 'Diego Flores',
    role: 'Comprador verificado',
    content: 'El botín de cuero es una pieza espectacular. Se nota que es cuero genuino. El café es un tono hermoso. Lo uso para trabajar y salir.',
    rating: 5,
  },
]

// ═══════════════════════════════════════════════════════════════
// STORE CONTENT DEFAULT (hero, features, stats, FAQ, etc.)
// ═══════════════════════════════════════════════════════════════
export const localStoreContent: StoreContentData = {
  hero: {
    badge: 'Nueva Colección 2026',
    title1: 'Estilo urbano',
    title2: 'sin límites',
    subtitle: 'Descubre nuestra colección premium de streetwear. Calidad, diseño y comodidad en cada prenda.',
    btnText1: 'Ver Colección',
    btnText2: 'Ver Ofertas',
    trustText1: 'Envío gratis',
    trustText2: 'Pago contra entrega',
    stat1Icon: '⭐',
    stat1Value: '4.8/5',
    stat1Label: '+200 reseñas',
    stat2Icon: '🚚',
    stat2Value: 'Envío rápido',
    stat2Label: '1-3 días hábiles',
    image1: 'https://picsum.photos/id/1015/800/600',
    image2: 'https://picsum.photos/id/1018/800/600',
  },
  brands: {
    items: JSON.stringify(['URBAN STYLE', 'STREETWEAR', 'PREMIUM', 'ORIGINAL', 'PERU', 'LIMA', 'QUALITY', 'PRO']),
  },
  about: {
    badge: 'Nuestra Historia',
    title: 'Urban Style',
    description: 'Somos una marca peruana que nace de la pasión por el streetwear. Cada producto es cuidadosamente seleccionado para garantizar la mejor calidad, diseño y experiencia de compra. Desde zapatillas hasta accesorios, tenemos todo lo que necesitas para lucir tu estilo.',
    features: JSON.stringify([
      { icon: '✨', text: 'Calidad premium en cada producto' },
      { icon: '🧵', text: 'Materiales cuidadosamente seleccionados' },
      { icon: '🎨', text: 'Diseños exclusivos y originales' },
      { icon: '🚚', text: 'Envío a todo el país' },
    ]),
    btnText: 'Ver Catálogo',
    image: 'https://picsum.photos/id/1035/800/600',
  },
  categories: {
    title: 'Explora por Categoría',
    subtitle: 'Encuentra exactamente lo que buscas',
  },
  features: {
    items: JSON.stringify([
      { icon: '🚚', title: 'Envío Gratis', desc: 'En pedidos +S/199' },
      { icon: '💬', title: 'WhatsApp', desc: 'Pedidos directos' },
      { icon: '💰', title: '0% Comisión', desc: 'Sin cargos extra' },
      { icon: '🔄', title: 'Devolución', desc: '30 días garantía' },
    ]),
  },
  stats: {
    items: JSON.stringify([
      { value: '+120', label: 'Negocios activos' },
      { value: '24/7', label: 'Siempre vendiendo' },
      { value: '0%', label: 'Comisión por venta' },
      { value: '+2K', label: 'Clientes felices' },
    ]),
  },
  offers: {
    subtitle: 'Los mejores precios en productos seleccionados',
  },
  testimonials: {
    title: 'Lo que dicen nuestros clientes',
    subtitle: 'Reseñas verificadas de compradores reales',
  },
  faq: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre tu compra',
    items: JSON.stringify([
      { q: '¿Cuánto tarda el envío?', a: 'El envío es de 1 a 3 días hábiles a Lima y 3 a 7 días a provincias. Envío gratis en pedidos mayores a S/199.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos pago contra entrega, transferencia bancaria, y Yape/Plin. También puedes pagar con tarjeta a través de MercadoPago.' },
      { q: '¿Puedo devolver mi pedido?', a: 'Sí, tienes 30 días para devolver tu producto si no estás satisfecho. El producto debe estar en su estado original.' },
      { q: '¿Cómo hago mi pedido?', a: 'Puedes hacer tu pedido directamente por WhatsApp o a través de nuestra tienda online. Te guiaremos en cada paso.' },
      { q: '¿Las tallas son estándar?', a: 'Sí, nuestras tallas siguen la tabla de medidas peruanas estándar. Revisa nuestra guía de tallas para más detalles.' },
    ]),
  },
  newsletter: {
    title: 'Recibe ofertas exclusivas',
    subtitle: 'Suscríbete y obtén un 10% de descuento en tu primera compra',
    placeholder: 'tu@email.com',
    btnText: 'Suscribirme',
    footer: 'Sin spam. Puedes darte de baja cuando quieras.',
  },
  cta: {
    title: '¿Listo para encontrar tu estilo?',
    subtitle: 'Únete a cientos de clientes que ya confiaron en nosotros. Tu próxima prenda favorita te está esperando.',
    btnText: 'Ver Catálogo Completo',
    footer: 'Envío gratis desde S/199 · Pago contra entrega · Garantía de 30 días',
  },
}
