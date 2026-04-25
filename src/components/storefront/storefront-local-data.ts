import type { Product, Category, Testimonial, StoreContentData } from './storefront-types'

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS LOCALES
// ═══════════════════════════════════════════════════════════════
export const localCategories: Category[] = [
  {
    id: 'cat-calzado',
    name: 'Calzado',
    slug: 'calzado',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format&q=80',
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
// ═══════════════════════════════════════════════════════════════
export const localProducts: Product[] = [
  // ────────────────────────────────────────────────────────────
  // CALZADO (IDs 1–10)
  // ────────────────────────────────────────────────────────────

  // 1 · Sneaker runner blanco
  {
    id: '1',
    name: 'Sneaker Runner Blanco',
    slug: 'sneaker-runner-blanco',
    description: 'Sneaker urbano en cuero sintético blanco con suela de gel amortiguada. Diseño minimalista que combina con cualquier outfit casual o semi-formal. Plantilla ergonómica extraíble y costuras reforzadas para mayor durabilidad.',
    price: 179.90,
    comparePrice: 229.90,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 22,
    isNew: true,
    rating: 4.6,
    reviewCount: 234,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 2 · Running Rojo Pro
  {
    id: '2',
    name: 'Running Rojo Pro',
    slug: 'running-rojo-pro',
    description: 'Zapatilla de running con tecnología de amortiguación avanzada y malla transpirable. Suela antideslizante con patrón multidireccional. Ideal para entrenamientos de alta intensidad y carreras urbanas.',
    price: 219.90,
    comparePrice: 289.90,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Rojo', hex: '#dc2626' },
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

  // 3 · Botas Cuero Negro
  {
    id: '3',
    name: 'Botas Cuero Negro',
    slug: 'botas-cuero-negro',
    description: 'Botas de cuero genuino con acabado premium y suela de goma antideslizante. Costuras decorativas y hebilla lateral metálica. Un calzado versátil que transita del trabajo a la noche con estilo.',
    price: 299.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Café', hex: '#78350f' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 4 · Chunky Sneaker Plataforma
  {
    id: '4',
    name: 'Chunky Sneaker Plataforma',
    slug: 'chunky-sneaker-plataforma',
    description: 'Zapatilla de plataforma con diseño chunky inspirado en el streetwear contemporáneo. Suela elevada de 4 cm, materiales mixtos y colores contrastantes. La pieza statement que tu outfit necesita.',
    price: 189.90,
    comparePrice: 239.90,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['37', '38', '39', '40', '41', '42']),
    colors: JSON.stringify([
      { name: 'Blanco', hex: '#f5f5f5' },
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

  // 5 · Mocasín Cuero Marrón
  {
    id: '5',
    name: 'Mocasín Cuero Marrón',
    slug: 'mocasin-cuero-marron',
    description: 'Mocasín clásico de cuero genuino con suela flexible y bordado decorativo. Construcción artesanal con plantilla acolchada. Perfecto para un look smart-casual elegante y cómodo.',
    price: 249.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 6 · Basketball High Top
  {
    id: '6',
    name: 'Basketball High Top',
    slug: 'basketball-high-top',
    description: 'Zapatilla basketball con caña alta y tobillera acolchada. Suela de goma con tracción superior para cancha. Upper en cuero sintético premium con detalles perforados para ventilación.',
    price: 199.90,
    comparePrice: 259.90,
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Blanco', hex: '#f5f5f5' },
      { name: 'Negro', hex: '#1a1a1a' },
    ]),
    discount: 23,
    isNew: true,
    rating: 4.3,
    reviewCount: 67,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 7 · Chelsea Boots Café
  {
    id: '7',
    name: 'Chelsea Boots Café',
    slug: 'chelsea-boots-cafe',
    description: 'Chelsea boots de cuero genuino en tono café con elásticos laterales. Sela de goma track y interior forrado. Un clásico británico reinventado para el estilo urbano peruano.',
    price: 279.90,
    comparePrice: 349.90,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1605733160312-0f9efa3ebed2?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 8 · Sneaker Urbano Gris
  {
    id: '8',
    name: 'Sneaker Urbano Gris',
    slug: 'sneaker-urbano-gris',
    description: 'Sneaker casual en gris con detalles blancos. Upper en mesh transpirable con overlays sintéticos. Suela EVA ligera y flexible. Comodidad de todo el día para el ritmo urbano.',
    price: 159.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['38', '39', '40', '41', '42', '43']),
    colors: JSON.stringify([
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Blanco', hex: '#f5f5f5' },
    ]),
    discount: null,
    isNew: false,
    rating: 4.2,
    reviewCount: 156,
    inStock: true,
    category: { name: 'Calzado', slug: 'calzado' },
  },

  // 9 · Skate Shoe Classic
  {
    id: '9',
    name: 'Skate Shoe Classic',
    slug: 'skate-shoe-classic',
    description: 'Zapatilla de skate con suela vulcanizada plana y upper en lona resistente. Diseño retro con puntera reforzada en goma. Ideal para skateboarding o un look casual auténtico.',
    price: 149.90,
    comparePrice: 189.90,
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 10 · Botas Trekking Impermeable
  {
    id: '10',
    name: 'Botas Trekking Impermeable',
    slug: 'botas-trekking-impermeable',
    description: 'Botas de trekking con membrana impermeable y suela Vibram antideslizante. Tobillera alta con soporte de tobillo. Material resistente al agua y ventilación superior para aventuras extremas.',
    price: 329.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1605733160312-0f9efa3ebed2?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1605733160312-0f9efa3ebed2?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
    colors: JSON.stringify([
      { name: 'Gris', hex: '#4b5563' },
      { name: 'Verde', hex: '#365314' },
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

  // 11 · Hoodie Oversize Negro
  {
    id: '11',
    name: 'Hoodie Oversize Negro',
    slug: 'hoodie-oversize-negro',
    description: 'Sudadera con capucha oversize en felpa premium de 380gsm. Bolsillo canguro frontal, cordones ajustables y interior cepillado ultra suave. El básico esencial para el streetwear.',
    price: 139.90,
    comparePrice: 179.90,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1578768079470-9e3fda1fdf76?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 12 · Casaca Denim Vintage
  {
    id: '12',
    name: 'Casaca Denim Vintage',
    slug: 'casaca-denim-vintage',
    description: 'Chaqueta de mezclilla con lavado vintage y detalles desgastados artesanales. Cierre de botones de metal, bolsillos con solapa y ajuste regular. Un clásico atemporal que mejora con el uso.',
    price: 189.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 13 · Bomber Verde Oliva
  {
    id: '13',
    name: 'Bomber Verde Oliva',
    slug: 'bomber-verde-oliva',
    description: 'Bomber jacket en nylon con forro interior satinado. Ribetes elásticos en mangas, cintura y cuello. Bolsillos con cierre YKK y parche bordado en el pecho. Estilo militar moderno.',
    price: 209.90,
    comparePrice: 269.90,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 14 · Polo Pima Blanco Classic
  {
    id: '14',
    name: 'Polo Pima Blanco Classic',
    slug: 'polo-pima-blanco-classic',
    description: 'Polo de algodón pima 100% peruano con cuello ribeteado reforzado. Tejido 30/1 suave al tacto con ajuste regular. La base perfecta para cualquier look, desde casual hasta smart.',
    price: 69.90,
    comparePrice: 89.90,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1625910513413-5fc421e0e2f0?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 15 · Camisa Flannel Cuadros
  {
    id: '15',
    name: 'Camisa Flannel Cuadros',
    slug: 'camisa-flannel-cuadros',
    description: 'Camisa de franela en algodón brushed con patrón de cuadros escoceses. Botones de concha natural, bolsillo en el pecho y mangas ajustables. Comodidad y estilo para el día a día.',
    price: 99.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Rojo/Gris', hex: '#b91c1c' },
      { name: 'Azul/Negro', hex: '#1e3a5f' },
      { name: 'Verde/Tierra', hex: '#556b2f' },
    ]),
    discount: null,
    isNew: true,
    rating: 4.4,
    reviewCount: 178,
    inStock: true,
    category: { name: 'Ropa', slug: 'ropa-superior' },
  },

  // 16 · Windbreaker Deportivo Azul
  {
    id: '16',
    name: 'Windbreaker Deportivo Azul',
    slug: 'windbreaker-deportivo-azul',
    description: 'Rompevientos ultraligero con tecnología impermeable y costuras termo-selladas. Capucha retráctil, bolsillos con cierre y reflectores de seguridad. Para entrenar o salir sin importar el clima.',
    price: 159.90,
    comparePrice: 199.90,
    image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 17 · Jogger Cargo Urbano
  {
    id: '17',
    name: 'Jogger Cargo Urbano',
    slug: 'jogger-cargo-urbano',
    description: 'Pantalón jogger cargo en algodón twill con bolsillos laterales de gran capacidad. Cintura elástica con cordón ajustable, puños en ribete y caída relajada. Comodidad táctica para la ciudad.',
    price: 119.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 18 · Camisa Oxford Celeste
  {
    id: '18',
    name: 'Camisa Oxford Celeste',
    slug: 'camisa-oxford-celeste',
    description: 'Camisa oxford en algodón premium con tejido basket weave. Cuello botón down, puños con botones y ajuste slim fit. La pieza clave para un look formal relajado o de oficina.',
    price: 109.90,
    comparePrice: 139.90,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 19 · Suéter Punto Cable
  {
    id: '19',
    name: 'Suéter Punto Cable',
    slug: 'sueter-punto-cable',
    description: 'Suéter tejido en punto cable con cuello redondo. Mezcla de algodón y acrílico para calidez sin peso. Patrón textil clásico que aporta textura y elegancia a cualquier outfit de temporada fría.',
    price: 149.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a63?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1434389677669-e08b4cda3a63?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1614975059251-992f11792571?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 20 · Parka Puffer Negro
  {
    id: '20',
    name: 'Parka Puffer Negro',
    slug: 'parka-puffer-negro',
    description: 'Parka acolchada con relleno de plumón sintético de alta densidad. Capucha con borla desmontable, forro polar interior y bolsillos con cierre. Resistente al viento y al agua para temperaturas extremas.',
    price: 279.90,
    comparePrice: 359.90,
    image: 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 21 · Mochila Técnica Laptop
  {
    id: '21',
    name: 'Mochila Técnica Laptop',
    slug: 'mochila-tecnica-laptop',
    description: 'Mochila profesional con compartimento acolchado para laptops hasta 15.6 pulgadas. Material Cordura resistente al agua, organización interna con bolsillos multipropósito y correas ergonómicas.',
    price: 169.90,
    comparePrice: 219.90,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165b0c?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 22 · Reloj Analog Minimal
  {
    id: '22',
    name: 'Reloj Analog Minimal',
    slug: 'reloj-analog-minimal',
    description: 'Reloj analógico con caja de acero inoxidable de 40mm y esfera blanca minimalista. Cristal de zafiro resistente a rayones, correa de cuero italiano intercambiable y movimiento japonés de alta precisión.',
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

  // 23 · Gafas de Sol Aviador
  {
    id: '23',
    name: 'Gafas de Sol Aviador',
    slug: 'gafas-de-sol-aviador',
    description: 'Gafas de sol estilo aviador con montura metálica dorada y lentes polarizadas UV400. Protección superior contra rayos UVA/UVB con nitidez óptica premium. Incluye estuche rígido y paño de limpieza.',
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

  // 24 · Gorra Snapback Bordada
  {
    id: '24',
    name: 'Gorra Snapback Bordada',
    slug: 'gorra-snapback-bordada',
    description: 'Gorra snapback con visera plana y cierre ajustable metálico. Bordado 3D de alta densidad, corona estructurada de 6 paneles y badana interior absorbente. Un accesorio de streetwear imprescindible.',
    price: 59.90,
    comparePrice: 79.90,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 25 · Cinturón Cuero Artesanal
  {
    id: '25',
    name: 'Cinturón Cuero Artesanal',
    slug: 'cinturon-cuero-artesanal',
    description: 'Cinturón de cuero genuino de 3.5 cm con hebilla de acero inoxidable pulido. Trabajo artesanal peruano con acabado envejecido natural. Flexible, duradero y con personalidad propia.',
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

  // 26 · Billetera Cuero Slim
  {
    id: '26',
    name: 'Billetera Cuero Slim',
    slug: 'billetera-cuero-slim',
    description: 'Billetera slim en cuero nappa con RFID blocking integrado. 6 ranuras para tarjetas, compartimento para billetes y bolsillo con cierre para monedas. Diseño compacto que cabe en cualquier bolsillo.',
    price: 79.90,
    comparePrice: 99.90,
    image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=800&fit=crop&auto=format&q=80',
    ]),
    sizes: JSON.stringify(['Única']),
    colors: JSON.stringify([
      { name: 'Negro', hex: '#1a1a1a' },
      { name: 'Café', hex: '#92400e' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
    ]),
    discount: 20,
    isNew: true,
    rating: 4.4,
    reviewCount: 198,
    inStock: true,
    category: { name: 'Accesorios', slug: 'accesorios' },
  },

  // 27 · Reloj Deportivo Digital
  {
    id: '27',
    name: 'Reloj Deportivo Digital',
    slug: 'reloj-deportivo-digital',
    description: 'Reloj deportivo con pantalla LCD retroiluminada, resistencia al agua 50m, cronómetro, alarma y cuenta pasos. Correa de resina ajustable y diseño robusto para cualquier aventura.',
    price: 149.90,
    comparePrice: 189.90,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 28 · Gafas de Sol Round
  {
    id: '28',
    name: 'Gafas de Sol Round',
    slug: 'gafas-de-sol-round',
    description: 'Gafas de sol redondas estilo retro con montura de acetato y lentes gradientes. Protección UV400 completa, brazos flexibles y puente nasal ajustable. Para un look vintage con protección moderna.',
    price: 109.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 29 · Gorra Bucket Reversible
  {
    id: '29',
    name: 'Gorra Bucket Reversible',
    slug: 'gorra-bucket-reversible',
    description: 'Gorra bucket reversible con dos diseños en uno. Lado A: liso minimalista. Lado B: print exclusivo urbano. Tela de algodón orgánico resistente y ala corta para protección solar casual.',
    price: 49.90,
    comparePrice: null,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=800&fit=crop&auto=format&q=80',
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

  // 30 · Mochila Messenger Cuero
  {
    id: '30',
    name: 'Mochila Messenger Cuero',
    slug: 'mochila-messenger-cuero',
    description: 'Bolso messenger de cuero genuino con cierre de hebilla y correa ajustable. Compartimento acolchado para tablet de 11 pulgadas, bolsillos interiores organizadores y cierre con cremallera.',
    price: 199.90,
    comparePrice: 259.90,
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=800&fit=crop&auto=format&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&auto=format&q=80',
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
    content: 'Increíble calidad en cada producto. Las sneakers runner blancas son súper cómodas y el envío fue rapidísimo. ¡Ya es mi tercera compra y sigo encantada!',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Carlos López',
    role: 'Comprador verificado',
    content: 'El hoodie oversize es exactamente lo que buscaba. Tela premium y el tamaño es perfecto. Muy recomendado para quienes gustan del estilo urbano con comodidad real.',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Ana Torres',
    role: 'Cliente nueva',
    content: 'Compré la mochila técnica laptop y superó mis expectativas. Tiene espacio para todo, se ve muy profesional y es resistente al agua. El precio es justo por la calidad.',
    rating: 4,
  },
  {
    id: 'test-4',
    name: 'Luis Ramírez',
    role: 'Comprador verificado',
    content: 'Las gorras snapback tienen un acabado excelente. El bordado se ve de alta calidad y la talla es ajustable. Volveré por más colores, seguro.',
    rating: 5,
  },
  {
    id: 'test-5',
    name: 'Sofía Martínez',
    role: 'Cliente frecuente',
    content: 'Me encanta la casaca denim vintage, el lavado se ve súper natural. La usé en la sierra y abriga perfecto. Calidad premium sin duda, vale cada sol.',
    rating: 4,
  },
  {
    id: 'test-6',
    name: 'Diego Flores',
    role: 'Comprador verificado',
    content: 'Las botas Chelsea café son una pieza espectacular. Se nota que es cuero genuino. El tono es hermoso. Lo uso para trabajar y salir los fines de semana.',
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
