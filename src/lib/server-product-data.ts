/**
 * ═══════════════════════════════════════════════════════════════════
 * SERVER-SAFE PRODUCT DATA
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este archivo es SERVER-SAFE: no usa 'use client', no importa React,
 * no usa Zustand, no tiene hooks. Se puede importar desde Server
 * Components (layout.tsx generateMetadata) y Client Components.
 *
 * Fuente única de datos para las 30 rutas de producto.
 * Si agregas un producto nuevo, agrégalo aquí tambien.
 */

export interface ProductMeta {
  slug: string
  name: string
  description: string
  price: number
  comparePrice: number | null
  discount: number | null
  image: string
  category: string
}

// ── Mapa completo slug → ProductMeta (30 productos) ─────────────
const productMap: Record<string, ProductMeta> = {
  'stellar-sport-aero-racer-rojo': {
    slug: 'stellar-sport-aero-racer-rojo',
    name: 'Stellar Sport | Aero Racer Rojo',
    description: 'Zapatilla runner de alto rendimiento en rojo vibrante con suela amortiguada de gel y upper en malla transpirable. Diseño aerodinámico con líneas dinámicas que optimizan cada zancada. Plantilla ergonómica extraíble y suela antideslizante multidireccional.',
    price: 189.90,
    comparePrice: 249.90,
    discount: 24,
    image: 'https://images.pexels.com/photos/1174470/pexels-photo-1174470.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'stellar-sport-cloud-speed-borgona': {
    slug: 'stellar-sport-cloud-speed-borgona',
    name: 'Stellar Sport | Cloud Speed Borgoña',
    description: 'Zapatilla de running con tecnología de amortiguación avanzada en tono borgoña profundo. Upper en mesh de alta transpirabilidad con overlays sintéticos de soporte. Suela antideslizante con patrón de tracción multidireccional para entrenamientos intensos.',
    price: 219.90,
    comparePrice: 289.90,
    discount: 24,
    image: 'https://images.pexels.com/photos/3766219/pexels-photo-3766219.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'everest-outdoor-noir-leather-boot': {
    slug: 'everest-outdoor-noir-leather-boot',
    name: 'Everest Outdoor | Noir Leather Boot',
    description: 'Botas de cuero genuino negro con acabado premium y suela de goma antideslizante. Costuras decorativas y hebilla lateral metálica. Construcción robusta para el terreno urbano con estilo que transita del trabajo a la noche.',
    price: 299.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/9241620/pexels-photo-9241620.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'urban-vibe-vintage-court-beige': {
    slug: 'urban-vibe-vintage-court-beige',
    name: 'Urban Vibe | Vintage Court Beige',
    description: 'Zapatilla retro estilo court en tono beige con suela de goma clásica y upper en piel sintética. Diseño inspirado en los courts de los años 70 con líneas limpias y atemporales. Comodidad de todo el día con plantilla acolchada y costuras reforzadas.',
    price: 189.90,
    comparePrice: 239.90,
    discount: 21,
    image: 'https://images.pexels.com/photos/15830674/pexels-photo-15830674.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'urban-vibe-classic-mocasin-marron': {
    slug: 'urban-vibe-classic-mocasin-marron',
    name: 'Urban Vibe | Classic Mocasín Marrón',
    description: 'Mocasín clásico de cuero genuino marrón con suela flexible y bordado decorativo en el empeine. Construcción artesanal con plantilla acolchada de espuma viscoelástica. Acabado pulido que mejora con el uso.',
    price: 249.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/18054235/pexels-photo-18054235.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'stellar-sport-neon-court-led-negro': {
    slug: 'stellar-sport-neon-court-led-negro',
    name: 'Stellar Sport | Neon Court LED Negro',
    description: 'Zapatilla basketball con caña alta en cuero sintético negro y suela con tecnología LED iluminada. Tobillera acolchada con soporte lateral reforzado. Suela de goma con luces LED recargables por USB.',
    price: 199.90,
    comparePrice: 259.90,
    discount: 23,
    image: 'https://images.pexels.com/photos/373924/pexels-photo-373924.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'everest-outdoor-chelsea-explorer-cafe': {
    slug: 'everest-outdoor-chelsea-explorer-cafe',
    name: 'Everest Outdoor | Chelsea Explorer Café',
    description: 'Chelsea boots de cuero genuino en tono café con elásticos laterales de alta resistencia. Suela de goma track antideslizante e interior forrado en microfibra. Un clásico británico reinventado con acabado premium.',
    price: 279.90,
    comparePrice: 349.90,
    discount: 20,
    image: 'https://images.pexels.com/photos/26856060/pexels-photo-26856060.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'urban-vibe-suede-chunky-gris': {
    slug: 'urban-vibe-suede-chunky-gris',
    name: 'Urban Vibe | Suede Chunky Gris',
    description: 'Sneaker chunky en ante (suede) gris con suela extragrande de goma y detalles blancos. Upper en suede premium con overlays sintéticos de soporte. Plantilla acolchada con tecnología de retorno de energía.',
    price: 159.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/8373049/pexels-photo-8373049.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'urban-vibe-skate-classic-negro': {
    slug: 'urban-vibe-skate-classic-negro',
    name: 'Urban Vibe | Skate Classic Negro',
    description: 'Zapatilla de skate con suela vulcanizada plana y upper en lona negra resistente. Diseño retro con puntera reforzada en goma blanca y costuras contrastantes. Suela Waffle de tracción superior.',
    price: 149.90,
    comparePrice: 189.90,
    discount: 21,
    image: 'https://images.pexels.com/photos/8079829/pexels-photo-8079829.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'everest-outdoor-trek-pro-gris': {
    slug: 'everest-outdoor-trek-pro-gris',
    name: 'Everest Outdoor | Trek Pro Gris',
    description: 'Botas de trekking con membrana impermeable y suela antideslizante de alta adherencia. Upper en nylon gris con refuerzos de piel sintética en talón y puntera. Tobillera alta con soporte de tobillo integrado.',
    price: 329.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/9160315/pexels-photo-9160315.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Calzado',
  },
  'urban-vibe-oversize-hoodie-negro': {
    slug: 'urban-vibe-oversize-hoodie-negro',
    name: 'Urban Vibe | Oversize Hoodie Negro',
    description: 'Sudadera con capucha oversize en felpa premium de 380gsm color negro. Bolsillo canguro frontal, cordones ajustables metálicos y interior cepillado ultra suave. Corte amplio con hombros caídos.',
    price: 139.90,
    comparePrice: 179.90,
    discount: 22,
    image: 'https://images.pexels.com/photos/8410838/pexels-photo-8410838.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'everest-outdoor-denim-trail-azul': {
    slug: 'everest-outdoor-denim-trail-azul',
    name: 'Everest Outdoor | Denim Trail Azul',
    description: 'Chaqueta de mezclilla azul con lavado vintage artesanal y detalles desgastados. Cierre de botones de metal, bolsillos con solapa y ajuste regular. Tela denim de 12oz con prelavado enzimático.',
    price: 189.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/114996/pexels-photo-114996.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'everest-outdoor-bomber-tactical-oliva': {
    slug: 'everest-outdoor-bomber-tactical-oliva',
    name: 'Everest Outdoor | Bomber Tactical Oliva',
    description: 'Bomber jacket en nylon verde oliva con forro interior satinado. Ribetes elásticos en mangas, cintura y cuello. Bolsillos con cierre YKK y parche bordado en el pecho. Estilo militar moderno.',
    price: 209.90,
    comparePrice: 269.90,
    discount: 22,
    image: 'https://images.pexels.com/photos/5592267/pexels-photo-5592267.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'urban-vibe-essential-tee-blanco': {
    slug: 'urban-vibe-essential-tee-blanco',
    name: 'Urban Vibe | Essential Tee Blanco',
    description: 'Camiseta de algodón pima 100% peruano en blanco con acabado reforzado. Tejido 30/1 suave al tacto con ajuste regular. Costuras planas anti-irritación y acabado pre-encogido.',
    price: 69.90,
    comparePrice: 89.90,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format&q=80',
    category: 'Ropa',
  },
  'urban-vibe-flannel-check-rojo': {
    slug: 'urban-vibe-flannel-check-rojo',
    name: 'Urban Vibe | Flannel Check Rojo',
    description: 'Camisa de franela en algodón brushed con patrón de cuadros escoceses rojo y negro. Botones de concha natural, bolsillo en el pecho y mangas ajustables a la muñeca.',
    price: 99.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/30713830/pexels-photo-30713830.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'stellar-sport-wind-shield-azul': {
    slug: 'stellar-sport-wind-shield-azul',
    name: 'Stellar Sport | Wind Shield Azul',
    description: 'Rompevientos ultraligero en azul con tecnología impermeable y costuras termo-selladas. Capucha retráctil, bolsillos con cierre y reflectores de seguridad. Tela ripstop de alta durabilidad.',
    price: 159.90,
    comparePrice: 199.90,
    discount: 20,
    image: 'https://images.pexels.com/photos/11482937/pexels-photo-11482937.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'urban-vibe-cargo-tech-negro': {
    slug: 'urban-vibe-cargo-tech-negro',
    name: 'Urban Vibe | Cargo Tech Negro',
    description: 'Pantalón jogger cargo en algodón twill negro con bolsillos laterales de gran capacidad. Cintura elástica con cordón ajustable, puños en ribete y caída relajada.',
    price: 119.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/19751093/pexels-photo-19751093.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'urban-vibe-oxford-fit-celeste': {
    slug: 'urban-vibe-oxford-fit-celeste',
    name: 'Urban Vibe | Oxford Fit Celeste',
    description: 'Camisa oxford en algodón premium celeste pálido con tejido basket weave de alta densidad. Cuello botón down, puños con botones y ajuste slim fit. Acabado antiarrugas.',
    price: 109.90,
    comparePrice: 139.90,
    discount: 21,
    image: 'https://images.pexels.com/photos/4427902/pexels-photo-4427902.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'urban-vibe-cable-knit-crema': {
    slug: 'urban-vibe-cable-knit-crema',
    name: 'Urban Vibe | Cable Knit Crema',
    description: 'Suéter tejido en punto cable color crema con cuello redondo. Mezcla de algodón y acrílico para calidez sin peso excesivo. Patrón textil clásico de trenzado.',
    price: 149.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/14641437/pexels-photo-14641437.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'everest-outdoor-puffer-shield-negro': {
    slug: 'everest-outdoor-puffer-shield-negro',
    name: 'Everest Outdoor | Puffer Shield Negro',
    description: 'Parka acolchada negra con relleno de plumón sintético de alta densidad 300gsm. Capucha con borla desmontable, forro polar interior y bolsillos con cierre.',
    price: 279.90,
    comparePrice: 359.90,
    discount: 22,
    image: 'https://images.pexels.com/photos/4275569/pexels-photo-4275569.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Ropa',
  },
  'stellar-sport-tech-pack-negro': {
    slug: 'stellar-sport-tech-pack-negro',
    name: 'Stellar Sport | Tech Pack Negro',
    description: 'Mochila profesional negra con compartimento acolchado para laptops hasta 15.6 pulgadas. Material Cordura resistente al agua, organización interna y correas ergonómicas ventiladas.',
    price: 169.90,
    comparePrice: 219.90,
    discount: 23,
    image: 'https://images.pexels.com/photos/3731256/pexels-photo-3731256.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Accesorios',
  },
  'everest-outdoor-field-watch-blanco': {
    slug: 'everest-outdoor-field-watch-blanco',
    name: 'Everest Outdoor | Field Watch Blanco',
    description: 'Reloj analógico con caja de acero inoxidable de 40mm y esfera blanca minimalista. Cristal de zafiro resistente a rayones, correa de cuero intercambiable y movimiento japonés.',
    price: 249.90,
    comparePrice: 329.90,
    discount: 24,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&auto=format&q=80',
    category: 'Accesorios',
  },
  'urban-vibe-aviator-gold': {
    slug: 'urban-vibe-aviator-gold',
    name: 'Urban Vibe | Aviator Gold',
    description: 'Gafas de sol estilo aviador con montura metálica dorada y lentes polarizadas UV400. Protección superior contra rayos UVA/UVB con nitidez óptica premium.',
    price: 129.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop&auto=format&q=80',
    category: 'Accesorios',
  },
  'urban-vibe-snapback-edge-negro': {
    slug: 'urban-vibe-snapback-edge-negro',
    name: 'Urban Vibe | Snapback Edge Negro',
    description: 'Gorra snapback negra con visera plana y cierre ajustable metálico. Bordado 3D de alta densidad, corona estructurada de 6 paneles y badana interior absorbente.',
    price: 59.90,
    comparePrice: 79.90,
    discount: 25,
    image: 'https://images.pexels.com/photos/6963097/pexels-photo-6963097.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Accesorios',
  },
  'urban-vibe-heritage-belt-cafe': {
    slug: 'urban-vibe-heritage-belt-cafe',
    name: 'Urban Vibe | Heritage Belt Café',
    description: 'Cinturón de cuero genuino de 3.5 cm color café con hebilla de acero inoxidable pulido. Trabajo artesanal peruano con acabado envejecido natural.',
    price: 89.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=800&fit=crop&auto=format&q=80',
    category: 'Accesorios',
  },
  'urban-vibe-slim-wallet-cafe': {
    slug: 'urban-vibe-slim-wallet-cafe',
    name: 'Urban Vibe | Slim Wallet Café',
    description: 'Billetera slim en cuero nappa color café con RFID blocking integrado. 6 ranuras para tarjetas, compartimento para billetes y bolsillo con cierre para monedas.',
    price: 79.90,
    comparePrice: 99.90,
    discount: 20,
    image: 'https://images.pexels.com/photos/12444594/pexels-photo-12444594.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Accesorios',
  },
  'stellar-sport-sport-watch-digital-negro': {
    slug: 'stellar-sport-sport-watch-digital-negro',
    name: 'Stellar Sport | Sport Watch Digital Negro',
    description: 'Reloj deportivo digital negro con pantalla LCD retroiluminada. Resistencia al agua 50m, cronómetro, alarma, cuenta pasos y modo entrenamiento.',
    price: 149.90,
    comparePrice: 189.90,
    discount: 21,
    image: 'https://images.pexels.com/photos/9036176/pexels-photo-9036176.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Accesorios',
  },
  'urban-vibe-retro-round-tortuga': {
    slug: 'urban-vibe-retro-round-tortuga',
    name: 'Urban Vibe | Retro Round Tortuga',
    description: 'Gafas de sol redondas estilo retro con montura de acetato en tono tortuga y lentes gradientes ámbar. Protección UV400 completa.',
    price: 109.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/28194052/pexels-photo-28194052.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Accesorios',
  },
  'urban-vibe-bucket-flow-negro': {
    slug: 'urban-vibe-bucket-flow-negro',
    name: 'Urban Vibe | Bucket Flow Negro',
    description: 'Gorra bucket negra reversible con dos diseños en uno. Lado A: liso minimalista mate. Lado B: print exclusivo urbano geométrico. Tela de algodón orgánico.',
    price: 49.90,
    comparePrice: null,
    discount: null,
    image: 'https://images.pexels.com/photos/11022095/pexels-photo-11022095.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    category: 'Accesorios',
  },
  'stellar-sport-messenger-pack-cafe': {
    slug: 'stellar-sport-messenger-pack-cafe',
    name: 'Stellar Sport | Messenger Pack Café',
    description: 'Bolso messenger de cuero café con correa ajustable y cierre de hebilla. Compartimento principal acolchado con bolsillos internos organizadores. Diseño retro-moderno.',
    price: 119.90,
    comparePrice: 149.90,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&auto=format&q=80',
    category: 'Accesorios',
  },
}

// ── Todos los slugs válidos (para generateStaticParams y validación) ──
export const VALID_PRODUCT_SLUGS = Object.keys(productMap)

// ── Normalización de slug: minúsculas, trim, reemplaza espacios ──
export function normalizeSlug(slug: string): string {
  if (!slug) return ''
  return slug.toLowerCase().trim().replace(/\s+/g, '-')
}

// ── Lookup seguro: acepta slug con mayúsculas o espacios ────────
export function getProductBySlug(slug: string): ProductMeta | null {
  try {
    const normalized = normalizeSlug(slug)
    return productMap[normalized] ?? null
  } catch {
    return null
  }
}

// ── Image fallback URL (placeholder generico) ────────────────────
export const FALLBACK_PRODUCT_IMAGE = '/og-default.png'

// ── Imagen validada: retorna la original o fallback ──────────────
export function getProductImage(image: string): string {
  if (image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/'))) {
    return image
  }
  return FALLBACK_PRODUCT_IMAGE
}
