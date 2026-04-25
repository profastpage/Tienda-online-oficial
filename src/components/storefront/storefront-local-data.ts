import type { Product, Category, Testimonial, StoreContentData } from './storefront-types'

// ═══════════════════════════════════════════════════════════════
// MARCAS FICTICIAS (libres de derechos, seguras para anuncios)
//   Urban Vibe      → streetwear, casual, moda urbana
//   Stellar Sport   → athletic, performance, running
//   Everest Outdoor → outdoor, aventura, trekking
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS LOCALES
// ═══════════════════════════════════════════════════════════════
export const localCategories: Category[] = [
  {
    id: 'cat-calzado',
    name: 'Calzado',
    slug: 'calzado',
    image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop',
    _count: { products: 10 },
  },
  {
    id: 'cat-ropa',
    name: 'Ropa',
    slug: 'ropa-superior',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=450&fit=crop&auto=format&q=80',
    _count: { products: 10 },
  },
  {
    id: 'cat-accesorios',
    name: 'Accesorios',
    slug: 'accesorios',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop&auto=format&q=80',
    _count: { products: 10 },
  },
]

// ═══════════════════════════════════════════════════════════════
// PRODUCTOS LOCALES — 30 únicos, imágenes Unsplash coherentes
// IDs 1–10  → CALZADO
// IDs 11–20 → ROPA
// IDs 21–30 → ACCESORIOS
//
// Distribución de marcas:
//   Urban Vibe      → 15 productos (streetwear, casual, moda)
//   Stellar Sport   →  8 productos (athletic, performance)
//   Everest Outdoor →  7 productos (outdoor, aventura)
//
// Precisión visual: cada nombre describe exactamente la foto.
// Sin marcas registradas: nombres genéricos de alta gama.
// ═══════════════════════════════════════════════════════════════
export const localProducts: Product[] = [
  // ────────────────────────────────────────────────────────────
  // CALZADO (IDs 1–10)
  // ────────────────────────────────────────────────────────────

  // 1 · Stellar Sport — Zapatilla Runner Rojo Naranja
  //    Imagen: sneaker rojo-naranja vibrante con suela blanca
  {
    id: '1',
    name: 'Stellar Sport | Aero Racer Rojo',
    slug: 'stellar-sport-aero-racer-rojo',
    description: 'Zapatilla runner de alto rendimiento en rojo vibrante con suela amortiguada de gel y upper en malla transpirable. Diseño aerodinámico con líneas dinámicas que optimizan cada zancada. Plantilla ergonómica extraíble y suela antideslizante multidireccional.',
    price: 189.90,
    comparePrice: 249.90,
    image: 'https://images.pexels.com/photos/1174470/pexels-photo-1174470.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/1174470/pexels-photo-1174470.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/966058/pexels-photo-966058.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    ]),
    sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Rojo Naranja', hex: '#ea580c' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 24,
    isNew: true,
    rating: 4.7,
    reviewCount: 234,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 2 · Stellar Sport — Zapatilla Running Borgoña
  //    Imagen: running shoe borgoña sobre fondo blanco
  {
    id: '2',
    name: 'Stellar Sport | Cloud Speed Borgoña',
    slug: 'stellar-sport-cloud-speed-borgona',
    description: 'Zapatilla de running con tecnología de amortiguación avanzada en tono borgoña profundo. Upper en mesh de alta transpirabilidad con overlays sintéticos de soporte. Suela antideslizante con patrón de tracción multidireccional para entrenamientos intensos.',
    price: 219.90,
    comparePrice: 289.90,
    image: 'https://images.pexels.com/photos/3766219/pexels-photo-3766219.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/3766219/pexels-photo-3766219.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/3766219/pexels-photo-3766219.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Borgoña', hex: '#991b1b' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Azul', hex: '#2563eb' },
    ]),
    discount: 24,
    isNew: true,
    rating: 4.8,
    reviewCount: 178,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 3 · Everest Outdoor — Botas Cuero Negro
  //    Imagen: botas negras de cuero con suela gruesa
  {
    id: '3',
    name: 'Everest Outdoor | Noir Leather Boot',
    slug: 'everest-outdoor-noir-leather-boot',
    description: 'Botas de cuero genuino negro con acabado premium y suela de goma antideslizante. Costuras decorativas y hebilla lateral metálica. Construcción robusta para el terreno urbano con estilo que transita del trabajo a la noche.',
    price: 299.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/9241620/pexels-photo-9241620.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/9241620/pexels-photo-9241620.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/9241620/pexels-photo-9241620.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Café Oscuro', hex: '#78350f' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 4 · Urban Vibe — Zapatilla Retro Beige
  //    Imagen: sneaker beige retro con suela clásica
  {
    id: '4',
    name: 'Urban Vibe | Vintage Court Beige',
    slug: 'urban-vibe-vintage-court-beige',
    description: 'Zapatilla retro estilo court en tono beige con suela de goma clásica y upper en piel sintética. Diseño inspirado en los courts de los años 70 con líneas limpias y atemporales. Comodidad de todo el día con plantilla acolchada y costuras reforzadas. Un clásico que nunca pasa de moda.',
    price: 189.90,
    comparePrice: 239.90,
    image: 'https://images.pexels.com/photos/15830674/pexels-photo-15830674.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/15830674/pexels-photo-15830674.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/15830674/pexels-photo-15830674.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['37', '38', '39', '40', '41', '42']),
    colors: JSON.stringify([
      { name: 'Beige', hex: '#d4a574' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 21,
    isNew: true,
    rating: 4.4,
    reviewCount: 145,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 5 · Urban Vibe — Mocasín Cuero Marrón
  //    Imagen: mocasín marrón de cuero con suela oscura
  {
    id: '5',
    name: 'Urban Vibe | Classic Mocasín Marrón',
    slug: 'urban-vibe-classic-mocasin-marron',
    description: 'Mocasín clásico de cuero genuino marrón con suela flexible y bordado decorativo en el empeine. Construcción artesanal con plantilla acolchada de espuma viscoelástica. Acabado pulido que mejora con el uso. Perfecto para un look smart-casual elegante.',
    price: 249.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/18054235/pexels-photo-18054235.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/18054235/pexels-photo-18054235.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/18054235/pexels-photo-18054235.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Marrón', hex: '#92400e' },
      { name: 'Borgoña', hex: '#7f1d1d' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.5,
    reviewCount: 89,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 6 · Stellar Sport — Zapatilla LED High Top Negra
  //    Imagen: zapatilla negra con suela LED iluminada
  {
    id: '6',
    name: 'Stellar Sport | Neon Court LED Negro',
    slug: 'stellar-sport-neon-court-led-negro',
    description: 'Zapatilla basketball con caña alta en cuero sintético negro y suela con tecnología LED iluminada. Tobillera acolchada con soporte lateral reforzado. Suela de goma con luces LED recargables por USB con múltiples modos de color. Detalles perforados para ventilación y cierre de cordones reforzado.',
    price: 199.90,
    comparePrice: 259.90,
    image: 'https://images.pexels.com/photos/373924/pexels-photo-373924.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/373924/pexels-photo-373924.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/373924/pexels-photo-373924.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Blanco', hex: '#f5f5f5' },
    ]),
    discount: 23,
    isNew: true,
    rating: 4.3,
    reviewCount: 67,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 7 · Everest Outdoor — Chelsea Boots Café
  //    Imagen: botas Chelsea color café con elásticos laterales
  {
    id: '7',
    name: 'Everest Outdoor | Chelsea Explorer Café',
    slug: 'everest-outdoor-chelsea-explorer-cafe',
    description: 'Chelsea boots de cuero genuino en tono café con elásticos laterales de alta resistencia. Suela de goma track antideslizante e interior forrado en microfibra. Un clásico británico reinventado con acabado premium para el estilo urbano.',
    price: 279.90,
    comparePrice: 349.90,
    image: 'https://images.pexels.com/photos/26856060/pexels-photo-26856060.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/26856060/pexels-photo-26856060.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/26856060/pexels-photo-26856060.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Café', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 20,
    isNew: false,
    rating: 4.9,
    reviewCount: 198,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 8 · Urban Vibe — Sneaker Suede Chunky Gris
  //    Imagen: zapatilla suede gris con suela chunky
  {
    id: '8',
    name: 'Urban Vibe | Suede Chunky Gris',
    slug: 'urban-vibe-suede-chunky-gris',
    description: 'Sneaker chunky en ante (suede) gris con suela extragrande de goma y detalles blancos. Upper en suede premium con overlays sintéticos de soporte. Plantilla acolchada con tecnología de retorno de energía. Suela chunky de última generación para el ritmo urbano sin esfuerzo.',
    price: 159.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/8373049/pexels-photo-8373049.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/8373049/pexels-photo-8373049.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/8373049/pexels-photo-8373049.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['38', '39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Menta', hex: '#34d399' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.2,
    reviewCount: 156,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 9 · Urban Vibe — Zapatilla Skate Negra
  //    Imagen: zapatilla skate negra con suela blanca y puntera de goma
  {
    id: '9',
    name: 'Urban Vibe | Skate Classic Negro',
    slug: 'urban-vibe-skate-classic-negro',
    description: 'Zapatilla de skate con suela vulcanizada plana y upper en lona negra resistente. Diseño retro con puntera reforzada en goma blanca y costuras contrastantes. Suela Waffle de tracción superior. Ideal para skateboarding o un look casual auténtico.',
    price: 149.90,
    comparePrice: 189.90,
    image: 'https://images.pexels.com/photos/8079829/pexels-photo-8079829.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/8079829/pexels-photo-8079829.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/8079829/pexels-photo-8079829.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['37', '38', '39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Rojo', hex: '#dc2626' },
    ]),
    discount: 21,
    isNew: true,
    rating: 4.5,
    reviewCount: 203,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 10 · Everest Outdoor — Botas Trekking Gris Impermeable
  //    Imagen: botas de trekking grises con suela antideslizante
  {
    id: '10',
    name: 'Everest Outdoor | Trek Pro Gris',
    slug: 'everest-outdoor-trek-pro-gris',
    description: 'Botas de trekking con membrana impermeable y suela antideslizante de alta adherencia. Upper en nylon gris con refuerzos de piel sintética en talón y puntera. Tobillera alta con soporte de tobillo integrado. Ventilación superior para aventuras en cualquier terreno.',
    price: 329.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/9160315/pexels-photo-9160315.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/9160315/pexels-photo-9160315.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/9160315/pexels-photo-9160315.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Gris', hex: '#4b5563' },
      { name: 'Verde Oliva', hex: '#365314' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.8,
    reviewCount: 87,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // ────────────────────────────────────────────────────────────
  // ROPA (IDs 11–20)
  // ────────────────────────────────────────────────────────────

  // 11 · Urban Vibe — Hoodie Oversize Negro
  //    Imagen: sudadera negra con capucha sobre fondo oscuro
  {
    id: '11',
    name: 'Urban Vibe | Oversize Hoodie Negro',
    slug: 'urban-vibe-oversize-hoodie-negro',
    description: 'Sudadera con capucha oversize en felpa premium de 380gsm color negro. Bolsillo canguro frontal, cordones ajustables metálicos y interior cepillado ultra suave. Corte amplio con hombros caídos. El básico esencial del streetwear premium.',
    price: 139.90,
    comparePrice: 179.90,
    image: 'https://images.pexels.com/photos/8410838/pexels-photo-8410838.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/8410838/pexels-photo-8410838.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/8410838/pexels-photo-8410838.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Gris Oscuro', hex: '#374151' },
      { name: 'Verde Oliva', hex: '#556b2f' },
    ]),
    discount: 22,
    isNew: true,
    rating: 4.7,
    reviewCount: 345,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 12 · Everest Outdoor — Casaca Denim Vintage Azul
  //    Imagen: chaqueta de mezclilla azul con lavado desgastado
  {
    id: '12',
    name: 'Everest Outdoor | Denim Trail Azul',
    slug: 'everest-outdoor-denim-trail-azul',
    description: 'Chaqueta de mezclilla azul con lavado vintage artesanal y detalles desgastados. Cierre de botones de metal, bolsillos con solapa y ajuste regular. Tela denim de 12oz con prelavado enzimático. Un clásico atemporal que mejora con cada uso.',
    price: 189.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/114996/pexels-photo-114996.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/114996/pexels-photo-114996.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/114996/pexels-photo-114996.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Azul Claro', hex: '#60a5fa' },
      { name: 'Azul Oscuro', hex: '#1e3a5f' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.6,
    reviewCount: 267,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 13 · Everest Outdoor — Bomber Verde Oliva
  //    Imagen: chaqueta bomber verde oliva militar con bolsillos
  {
    id: '13',
    name: 'Everest Outdoor | Bomber Tactical Oliva',
    slug: 'everest-outdoor-bomber-tactical-oliva',
    description: 'Bomber jacket en nylon verde oliva con forro interior satinado. Ribetes elásticos en mangas, cintura y cuello. Bolsillos con cierre YKK y parche bordado en el pecho. Estilo militar moderno con acabados premium de resistencia al agua.',
    price: 209.90,
    comparePrice: 269.90,
    image: 'https://images.pexels.com/photos/5592267/pexels-photo-5592267.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/5592267/pexels-photo-5592267.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/5592267/pexels-photo-5592267.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Verde Oliva', hex: '#556b2f' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Burdeos', hex: '#7f1d1d' },
    ]),
    discount: 22,
    isNew: true,
    rating: 4.5,
    reviewCount: 134,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 14 · Urban Vibe — Tee Pima Blanco
  //    Imagen: camiseta blanca doblada sobre fondo neutro
  {
    id: '14',
    name: 'Urban Vibe | Essential Tee Blanco',
    slug: 'urban-vibe-essential-tee-blanco',
    description: 'Camiseta de algodón pima 100% peruano en blanco con acabado reforzado. Tejido 30/1 suave al tacto con ajuste regular. Costuras planas anti-irritación y acabado pre-encogido. La base perfecta para cualquier look casual o smart.',
    price: 69.90,
    comparePrice: 89.90,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
      { name: 'Gris', hex: '#6b7280' },
    ]),
    discount: 22,
    isNew: false,
    rating: 4.8,
    reviewCount: 523,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 15 · Urban Vibe — Camisa Flannel Cuadros Rojo
  //    Imagen: camisa de cuadros rojos y negros estilo escocés
  {
    id: '15',
    name: 'Urban Vibe | Flannel Check Rojo',
    slug: 'urban-vibe-flannel-check-rojo',
    description: 'Camisa de franela en algodón brushed con patrón de cuadros escoceses rojo y negro. Botones de concha natural, bolsillo en el pecho y mangas ajustables a la muñeca. Tela de gramaje medio con interior aterciopelado para máxima comodidad.',
    price: 99.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/30713830/pexels-photo-30713830.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/30713830/pexels-photo-30713830.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/30713830/pexels-photo-30713830.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Rojo/Negro', hex: '#b91c1c' },
      { name: 'Azul/Gris', hex: '#1e3a5f' },
      { name: 'Verde/Tierra', hex: '#556b2f' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.4,
    reviewCount: 178,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 16 · Stellar Sport — Windbreaker Azul Deportivo
  //    Imagen: chaqueta rompevientos azul con cierre central
  {
    id: '16',
    name: 'Stellar Sport | Wind Shield Azul',
    slug: 'stellar-sport-wind-shield-azul',
    description: 'Rompevientos ultraligero en azul con tecnología impermeable y costuras termo-selladas. Capucha retráctil, bolsillos con cierre y reflectores de seguridad. Tela ripstop de alta durabilidad con ventilation zips. Para entrenar sin importar el clima.',
    price: 159.90,
    comparePrice: 199.90,
    image: 'https://images.pexels.com/photos/11482937/pexels-photo-11482937.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/11482937/pexels-photo-11482937.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/11482937/pexels-photo-11482937.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Azul', hex: '#2563eb' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Rojo', hex: '#dc2626' },
    ]),
    discount: 20,
    isNew: true,
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 17 · Urban Vibe — Jogger Cargo Negro
  //    Imagen: pantalón cargo negro con bolsillos laterales
  {
    id: '17',
    name: 'Urban Vibe | Cargo Tech Negro',
    slug: 'urban-vibe-cargo-tech-negro',
    description: 'Pantalón jogger cargo en algodón twill negro con bolsillos laterales de gran capacidad. Cintura elástica con cordón ajustable, puños en ribete y caída relajada. Bolsillos con solapa y cierre de velcro. Comodidad táctica para la ciudad.',
    price: 119.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/19751093/pexels-photo-19751093.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/19751093/pexels-photo-19751093.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/19751093/pexels-photo-19751093.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Verde Oliva', hex: '#556b2f' },
      { name: 'Caqui', hex: '#92702c' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.3,
    reviewCount: 212,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 18 · Urban Vibe — Camisa Oxford Celeste
  //    Imagen: camisa celeste pálida con cuello formal
  {
    id: '18',
    name: 'Urban Vibe | Oxford Fit Celeste',
    slug: 'urban-vibe-oxford-fit-celeste',
    description: 'Camisa oxford en algodón premium celeste pálido con tejido basket weave de alta densidad. Cuello botón down, puños con botones y ajuste slim fit. Costuras de refuerzo en lateral y acabado antiarrugas para un look formal relajado.',
    price: 109.90,
    comparePrice: 139.90,
    image: 'https://images.pexels.com/photos/4427902/pexels-photo-4427902.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/4427902/pexels-photo-4427902.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/4427902/pexels-photo-4427902.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Celeste', hex: '#7dd3fc' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Rosa Pálido', hex: '#fda4af' },
    ]),
    discount: 21,
    isNew: false,
    rating: 4.7,
    reviewCount: 189,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 19 · Urban Vibe — Suéter Punto Cable Crema
  //    Imagen: suéter de punto con textura cable en tono crema
  {
    id: '19',
    name: 'Urban Vibe | Cable Knit Crema',
    slug: 'urban-vibe-cable-knit-crema',
    description: 'Suéter tejido en punto cable color crema con cuello redondo. Mezcla de algodón y acrílico para calidez sin peso excesivo. Patrón textil clásico de trenzado que aporta textura y elegancia. Ideal para outfits de temporada fría con estilo.',
    price: 149.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/14641437/pexels-photo-14641437.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/14641437/pexels-photo-14641437.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/14641437/pexels-photo-14641437.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Crema', hex: '#fef3c7' },
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.5,
    reviewCount: 156,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 20 · Everest Outdoor — Parka Puffer Negro
  //    Imagen: chaqueta acolchada negra tipo parka con capucha
  {
    id: '20',
    name: 'Everest Outdoor | Puffer Shield Negro',
    slug: 'everest-outdoor-puffer-shield-negro',
    description: 'Parka acolchada negra con relleno de plumón sintético de alta densidad 300gsm. Capucha con borla desmontable, forro polar interior y bolsillos con cierre. Resistente al viento y al agua con costuras termo-selladas para temperaturas extremas.',
    price: 279.90,
    comparePrice: 359.90,
    image: 'https://images.pexels.com/photos/4275569/pexels-photo-4275569.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/4275569/pexels-photo-4275569.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/4275569/pexels-photo-4275569.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Verde Oliva', hex: '#556b2f' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: 22,
    isNew: true,
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // ────────────────────────────────────────────────────────────
  // ACCESORIOS (IDs 21–30)
  // ────────────────────────────────────────────────────────────

  // 21 · Stellar Sport — Mochila Técnica Laptop Negra
  //    Imagen: mochila negra con compartimentos y correas
  {
    id: '21',
    name: 'Stellar Sport | Tech Pack Negro',
    slug: 'stellar-sport-tech-pack-negro',
    description: 'Mochila profesional negra con compartimento acolchado para laptops hasta 15.6 pulgadas. Material Cordura resistente al agua, organización interna con bolsillos multipropósito y correas ergonómicas ventiladas. Puerto USB lateral integrado.',
    price: 169.90,
    comparePrice: 219.90,
    image: 'https://images.pexels.com/photos/3731256/pexels-photo-3731256.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/3731256/pexels-photo-3731256.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/3731256/pexels-photo-3731256.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: 23,
    isNew: true,
    rating: 4.6,
    reviewCount: 278,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 22 · Everest Outdoor — Reloj Analógico Minimal
  //    Imagen: reloj con esfera blanca, correas de cuero y metal
  {
    id: '22',
    name: 'Everest Outdoor | Field Watch Blanco',
    slug: 'everest-outdoor-field-watch-blanco',
    description: 'Reloj analógico con caja de acero inoxidable de 40mm y esfera blanca minimalista. Cristal de zafiro resistente a rayones, correa de cuero intercambiable y movimiento japonés de alta precisión. Resistente al agua 50m.',
    price: 249.90,
    comparePrice: 329.90,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Acero/Cuero', hex: '#d4d4d8' },
      { name: 'Acero/Rosa', hex: '#e879a0' },
    ]),
    discount: 24,
    isNew: true,
    rating: 4.8,
    reviewCount: 345,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 23 · Urban Vibe — Gafas de Sol Aviador Doradas
  //    Imagen: gafas aviador con montura dorada y lentes oscuros
  {
    id: '23',
    name: 'Urban Vibe | Aviator Gold',
    slug: 'urban-vibe-aviator-gold',
    description: 'Gafas de sol estilo aviador con montura metálica dorada y lentes polarizadas UV400. Protección superior contra rayos UVA/UVB con nitidez óptica premium. Brazos flexibles de acetato con puente nasal ajustable. Incluye estuche rígido.',
    price: 129.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Dorado', hex: '#d4a574' },
      { name: 'Plateado', hex: '#d4d4d8' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.5,
    reviewCount: 167,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 24 · Urban Vibe — Gorra Snapback Negra
  //    Imagen: gorra snapback negra con bordado y visera plana
  {
    id: '24',
    name: 'Urban Vibe | Snapback Edge Negro',
    slug: 'urban-vibe-snapback-edge-negro',
    description: 'Gorra snapback negra con visera plana y cierre ajustable metálico. Bordado 3D de alta densidad, corona estructurada de 6 paneles y badana interior absorbente. Costuras reforzadas y ojaleres de ventilación.',
    price: 59.90,
    comparePrice: 79.90,
    image: 'https://images.pexels.com/photos/6963097/pexels-photo-6963097.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/6963097/pexels-photo-6963097.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/6963097/pexels-photo-6963097.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Rojo', hex: '#dc2626' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: 25,
    isNew: true,
    rating: 4.3,
    reviewCount: 234,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 25 · Urban Vibe — Cinturón Cuero Café
  //    Imagen: cinturón de cuero café con hebilla metálica
  {
    id: '25',
    name: 'Urban Vibe | Heritage Belt Café',
    slug: 'urban-vibe-heritage-belt-cafe',
    description: 'Cinturón de cuero genuino de 3.5 cm color café con hebilla de acero inoxidable pulido. Trabajo artesanal peruano con acabado envejecido natural. Flexibilidad óptima y costuras de refuerzo. Duradero y con personalidad propia.',
    price: 89.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['85cm', '90cm', '95cm', '100cm', '105cm']),
    colors: JSON.stringify([
      { name: 'Café', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.6,
    reviewCount: 145,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 26 · Urban Vibe — Billetera Cuero Café Slim
  //    Imagen: billetera de cuero café con RFID blocking
  {
    id: '26',
    name: 'Urban Vibe | Slim Wallet Café',
    slug: 'urban-vibe-slim-wallet-cafe',
    description: 'Billetera slim en cuero nappa color café con RFID blocking integrado. 6 ranuras para tarjetas, compartimento para billetes y bolsillo con cierre para monedas. Acabado pulido con bordes biselados. Diseño compacto que cabe en cualquier bolsillo.',
    price: 79.90,
    comparePrice: 99.90,
    image: 'https://images.pexels.com/photos/12444594/pexels-photo-12444594.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/12444594/pexels-photo-12444594.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/12444594/pexels-photo-12444594.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Café', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: 20,
    isNew: true,
    rating: 4.4,
    reviewCount: 198,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 27 · Stellar Sport — Reloj Deportivo Digital Negro
  //    Imagen: reloj digital negro con pantalla LCD y botones
  {
    id: '27',
    name: 'Stellar Sport | Sport Watch Digital Negro',
    slug: 'stellar-sport-sport-watch-digital-negro',
    description: 'Reloj deportivo digital negro con pantalla LCD retroiluminada. Resistencia al agua 50m, cronómetro, alarma, cuenta pasos y modo entrenamiento. Correa de resina ajustable y carcasa robusta en policarbonato. Para cualquier aventura.',
    price: 149.90,
    comparePrice: 189.90,
    image: 'https://images.pexels.com/photos/9036176/pexels-photo-9036176.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/9036176/pexels-photo-9036176.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/9036176/pexels-photo-9036176.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Verde Militar', hex: '#556b2f' },
    ]),
    discount: 21,
    isNew: true,
    rating: 4.5,
    reviewCount: 267,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 28 · Urban Vibe — Gafas de Sol Round Tortuga
  //    Imagen: gafas redondas estilo retro con montura tortuga
  {
    id: '28',
    name: 'Urban Vibe | Retro Round Tortuga',
    slug: 'urban-vibe-retro-round-tortuga',
    description: 'Gafas de sol redondas estilo retro con montura de acetato en tono tortuga y lentes gradientes ámbar. Protección UV400 completa, brazos flexibles de metal y puente nasal ajustable con plaquetas de silicona. Vintage con protección moderna.',
    price: 109.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/28194052/pexels-photo-28194052.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/28194052/pexels-photo-28194052.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/28194052/pexels-photo-28194052.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Tortuga', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Transparente', hex: '#e5e7eb' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.2,
    reviewCount: 89,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 29 · Urban Vibe — Gorra Bucket Negra
  //    Imagen: gorra bucket negra estilo pescador con ala corta
  {
    id: '29',
    name: 'Urban Vibe | Bucket Flow Negro',
    slug: 'urban-vibe-bucket-flow-negro',
    description: 'Gorra bucket negra reversible con dos diseños en uno. Lado A: liso minimalista mate. Lado B: print exclusivo urbano geométrico. Tela de algodón orgánico resistente y ala corta para protección solar casual. Badana absorbente.',
    price: 49.90,
    comparePrice: null,
    image: 'https://images.pexels.com/photos/11022095/pexels-photo-11022095.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/11022095/pexels-photo-11022095.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/11022095/pexels-photo-11022095.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro/Blanco', hex: '#1a1a1a' },
      { name: 'Arena/Verde', hex: '#d4a574' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.1,
    reviewCount: 123,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 30 · Stellar Sport — Mochila Messenger Cuero Café
  //    Imagen: bolso messenger de cuero café con correa ajustable
  {
    id: '30',
    name: 'Stellar Sport | Cross Pack Café',
    slug: 'stellar-sport-cross-pack-cafe',
    description: 'Bolso messenger de cuero genuino café con cierre de hebilla y correa ajustable. Compartimento acolchado para tablet de 11 pulgadas, bolsillos interiores organizadores y cierre con cremallera YKK. Forro interior en satén con logo bordado.',
    price: 199.90,
    comparePrice: 259.90,
    image: 'https://images.pexels.com/photos/36492563/pexels-photo-36492563.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    images: JSON.stringify([
      'https://images.pexels.com/photos/36492563/pexels-photo-36492563.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
      'https://images.pexels.com/photos/36492563/pexels-photo-36492563.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Café', hex: '#92400e' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 23,
    isNew: false,
    rating: 4.7,
    reviewCount: 156,
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
    content: 'Increíble calidad en cada producto. Las Stellar Sport Aero Racer son súper cómodas y el envío fue rapidísimo. Ya es mi tercera compra y sigo encantada con la tienda.',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Carlos López',
    role: 'Comprador verificado',
    content: 'El hoodie Oversize de Urban Vibe es exactamente lo que buscaba. Tela premium de 380gsm y el tamaño oversize es perfecto. Muy recomendado para quienes gustan del estilo urbano con comodidad real.',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Ana Torres',
    role: 'Cliente nueva',
    content: 'Compré la mochila Tech Pack de Stellar Sport y superó mis expectativas. Tiene espacio para todo, se ve muy profesional y es resistente al agua. El precio es justo por la calidad que ofrece.',
    rating: 4,
  },
  {
    id: 'test-4',
    name: 'Luis Ramírez',
    role: 'Comprador verificado',
    content: 'Las gorras Snapback Edge de Urban Vibe tienen un acabado excelente. El bordado 3D se ve de alta calidad y la talla es ajustable. Volveré por más colores, seguro.',
    rating: 5,
  },
  {
    id: 'test-5',
    name: 'Sofía Martínez',
    role: 'Cliente frecuente',
    content: 'Me encanta la chaqueta Denim Trail de Everest Outdoor, el lavado vintage se ve súper natural. La usé en la sierra y abriga perfecto. Calidad premium sin duda, vale cada sol.',
    rating: 4,
  },
  {
    id: 'test-6',
    name: 'Diego Flores',
    role: 'Comprador verificado',
    content: 'Las Chelsea Explorer de Everest Outdoor son una pieza espectacular. Se nota que es cuero genuino. El tono café es hermoso. Lo uso para trabajar y salir los fines de semana. Versatilidad total.',
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
    image1: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&auto=format&q=80',
    image2: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop&auto=format&q=80',
  },
  brands: {
    items: JSON.stringify(['URBAN VIBE', 'STELLAR SPORT', 'EVEREST OUTDOOR', 'PREMIUM', 'ORIGINAL', 'PERU', 'LIMA', 'QUALITY']),
  },
  about: {
    badge: 'Nuestra Historia',
    title: 'Urban Style',
    description: 'Somos una marca peruana que nace de la pasión por el streetwear. Cada producto es cuidadosamente seleccionado para garantizar la mejor calidad, diseño y experiencia de compra. Desde zapatillas hasta accesorios, tenemos todo lo que necesitas para lucir tu estilo. Nuestras tres líneas — Urban Vibe, Stellar Sport y Everest Outdoor — cubren desde la moda urbana hasta la aventura extrema.',
    features: JSON.stringify([
      { icon: '✨', text: 'Calidad premium en cada producto' },
      { icon: '🧵', text: 'Materiales cuidadosamente seleccionados' },
      { icon: '🎨', text: 'Diseños exclusivos y originales' },
      { icon: '🚚', text: 'Envío a todo el país' },
    ]),
    btnText: 'Ver Catálogo',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&auto=format&q=80',
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
      { q: '¿Cuánto tarda el envío?', a: 'El envío es de 1 a 3 días hábiles a Lima y 3 a 7 días a provincias. Contamos con envío express disponible para pedidos urgentes.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos pago contra entrega, transferencia bancaria, yafipe y tarjetas de débito/crédito a través de nuestra plataforma segura.' },
      { q: '¿Puedo devolver un producto?', a: 'Sí, tienes 30 días para devolver productos sin uso y en su empaque original. El reembolso se procesa en 3 a 5 días hábiles.' },
      { q: '¿Las tallas son peruanas?', a: 'Sí, todas nuestras tallas siguen el estándar peruano. Revisa nuestra guía de tallas para encontrar tu medida perfecta.' },
    ]),
  },
}
