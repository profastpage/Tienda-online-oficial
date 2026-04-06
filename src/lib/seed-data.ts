// Seed data fallback for production environments without database access
// This data matches the exact format returned by Prisma queries

export interface SeedCategory {
  id: string
  name: string
  slug: string
  image: string
  sortOrder: number
  storeId: string
  createdAt: string
  _count: { products: number }
}

export interface SeedProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  image: string
  categoryId: string
  storeId: string
  isFeatured: boolean
  isNew: boolean
  discount: number | null
  sizes: string
  colors: string
  rating: number
  reviewCount: number
  inStock: boolean
  createdAt: string
  updatedAt: string
  category: { name: string; slug: string }
}

export interface SeedTestimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  storeId: string
  createdAt: string
}

export const seedCategories: SeedCategory[] = [
  {
    id: 'cmnnalw0s0001nhbpd23opcs6',
    name: 'Camisetas',
    slug: 'camisetas',
    image: '/images/categories/polos.png',
    sortOrder: 1,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.325Z',
    _count: { products: 4 },
  },
  {
    id: 'cmnnalw0t0003nhbprt79pgbz',
    name: 'Pantalones',
    slug: 'pantalones',
    image: '/images/categories/pantalones.png',
    sortOrder: 2,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.326Z',
    _count: { products: 4 },
  },
  {
    id: 'cmnnalw0u0005nhbpko86legc',
    name: 'Zapatillas',
    slug: 'zapatillas',
    image: '/images/categories/zapatos.png',
    sortOrder: 3,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.327Z',
    _count: { products: 3 },
  },
  {
    id: 'cmnnalw0v0007nhbp4cys6b8n',
    name: 'Accesorios',
    slug: 'accesorios',
    image: '/images/categories/hoodies.png',
    sortOrder: 4,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.328Z',
    _count: { products: 3 },
  },
  {
    id: 'cmnnalw0w0009nhbp0wcukjbh',
    name: 'Chaquetas',
    slug: 'chaquetas',
    image: '/images/categories/hoodies.png',
    sortOrder: 5,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.328Z',
    _count: { products: 3 },
  },
  {
    id: 'cmnnalw0x000bnhbpews99jhi',
    name: 'Hoodies',
    slug: 'hoodies',
    image: '/images/categories/hoodies.png',
    sortOrder: 6,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.329Z',
    _count: { products: 4 },
  },
]

export const seedProducts: SeedProduct[] = [
  {
    id: 'cmnnalw0y000dnhbp5agmcaqk',
    name: 'Camiseta Urban Classic',
    slug: 'camiseta-urban-classic',
    description:
      'Camiseta Urban Classic - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 79.9,
    comparePrice: 99.9,
    image: '/images/products/polera-oversize.png',
    categoryId: 'cmnnalw0s0001nhbpd23opcs6',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: 20,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"},{"name":"Gris","hex":"#6b7280"}]',
    rating: 4.86749602323305,
    reviewCount: 54,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.330Z',
    updatedAt: '2026-04-06T14:35:43.330Z',
    category: { name: 'Camisetas', slug: 'camisetas' },
  },
  {
    id: 'cmnnalw0z000fnhbpbepmi6t4',
    name: 'Camiseta Oversize Street',
    slug: 'camiseta-oversize-street',
    description:
      'Camiseta Oversize Street - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 89.9,
    comparePrice: null,
    image: '/images/products/polera-black.png',
    categoryId: 'cmnnalw0s0001nhbpd23opcs6',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"}]',
    rating: 4.80052128155646,
    reviewCount: 80,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.332Z',
    updatedAt: '2026-04-06T14:35:43.332Z',
    category: { name: 'Camisetas', slug: 'camisetas' },
  },
  {
    id: 'cmnnalw11000hnhbp1nqrv94x',
    name: 'Camiseta Logo Premium',
    slug: 'camiseta-logo-premium',
    description:
      'Camiseta Logo Premium - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 69.9,
    comparePrice: 89.9,
    image: '/images/products/polera-white.png',
    categoryId: 'cmnnalw0s0001nhbpd23opcs6',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: false,
    discount: 22,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Rojo","hex":"#ef4444"}]',
    rating: 4.860651567349827,
    reviewCount: 61,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.333Z',
    updatedAt: '2026-04-06T14:35:43.333Z',
    category: { name: 'Camisetas', slug: 'camisetas' },
  },
  {
    id: 'cmnnalw12000jnhbp7jzrl1ni',
    name: 'Camiseta Minimal Black',
    slug: 'camiseta-minimal-black',
    description:
      'Camiseta Minimal Black - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 59.9,
    comparePrice: null,
    image: '/images/products/polera-black.png',
    categoryId: 'cmnnalw0s0001nhbpd23opcs6',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.791704972175698,
    reviewCount: 44,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.334Z',
    updatedAt: '2026-04-06T14:35:43.334Z',
    category: { name: 'Camisetas', slug: 'camisetas' },
  },
  {
    id: 'cmnnalw14000lnhbpw5dlkbvd',
    name: 'Jogger Cargo Negro',
    slug: 'jogger-cargo-negro',
    description:
      'Jogger Cargo Negro - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 129.9,
    comparePrice: 159.9,
    image: '/images/products/cargo-black.png',
    categoryId: 'cmnnalw0t0003nhbprt79pgbz',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: 19,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Oliva","hex":"#4b5320"}]',
    rating: 4.593036141869548,
    reviewCount: 12,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.336Z',
    updatedAt: '2026-04-06T14:35:43.336Z',
    category: { name: 'Pantalones', slug: 'pantalones' },
  },
  {
    id: 'cmnnalw15000nnhbp1z9v832z',
    name: 'Jeans Slim Fit',
    slug: 'jeans-slim-fit',
    description:
      'Jeans Slim Fit - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 149.9,
    comparePrice: null,
    image: '/images/products/jean-dark.png',
    categoryId: 'cmnnalw0t0003nhbprt79pgbz',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: false,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Azul Oscuro","hex":"#1e3a5f"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.659401383663344,
    reviewCount: 60,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.337Z',
    updatedAt: '2026-04-06T14:35:43.337Z',
    category: { name: 'Pantalones', slug: 'pantalones' },
  },
  {
    id: 'cmnnalw16000pnhbp92cbg0is',
    name: 'Jogger Gris Urbano',
    slug: 'jogger-gris-urbano',
    description:
      'Jogger Gris Urbano - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 109.9,
    comparePrice: null,
    image: '/images/products/jogger-black.png',
    categoryId: 'cmnnalw0t0003nhbprt79pgbz',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Gris","hex":"#6b7280"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.835545707416657,
    reviewCount: 41,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.338Z',
    updatedAt: '2026-04-06T14:35:43.338Z',
    category: { name: 'Pantalones', slug: 'pantalones' },
  },
  {
    id: 'cmnnalw17000rnhbplau2gqel',
    name: 'Air Runner Pro',
    slug: 'air-runner-pro',
    description:
      'Air Runner Pro - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 249.9,
    comparePrice: 299.9,
    image: '/images/products/sneakers-white.png',
    categoryId: 'cmnnalw0u0005nhbpko86legc',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: true,
    discount: 17,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.678946763076115,
    reviewCount: 60,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.340Z',
    updatedAt: '2026-04-06T14:35:43.340Z',
    category: { name: 'Zapatillas', slug: 'zapatillas' },
  },
  {
    id: 'cmnnalw18000tnhbpty12ahll',
    name: 'Street Style High',
    slug: 'street-style-high',
    description:
      'Street Style High - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 199.9,
    comparePrice: null,
    image: '/images/products/sneakers-white-v2.png',
    categoryId: 'cmnnalw0u0005nhbpko86legc',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Rojo","hex":"#ef4444"}]',
    rating: 4.853552414849045,
    reviewCount: 90,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.341Z',
    updatedAt: '2026-04-06T14:35:43.341Z',
    category: { name: 'Zapatillas', slug: 'zapatillas' },
  },
  {
    id: 'cmnnalw1a000vnhbp15qfm6mz',
    name: 'Classic White Low',
    slug: 'classic-white-low',
    description:
      'Classic White Low - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 179.9,
    comparePrice: 219.9,
    image: '/images/products/sneakers-white.png',
    categoryId: 'cmnnalw0u0005nhbpko86legc',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: false,
    discount: 18,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Blanco","hex":"#ffffff"}]',
    rating: 4.638860890933841,
    reviewCount: 25,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.342Z',
    updatedAt: '2026-04-06T14:35:43.342Z',
    category: { name: 'Zapatillas', slug: 'zapatillas' },
  },
  {
    id: 'cmnnalw1b000xnhbpaofpaoxe',
    name: 'Gorra Snapback Urban',
    slug: 'gorra-snapback-urban',
    description:
      'Gorra Snapback Urban - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 49.9,
    comparePrice: null,
    image: '/images/products/hoodie-gray.png',
    categoryId: 'cmnnalw0v0007nhbp4cys6b8n',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Blanco","hex":"#ffffff"}]',
    rating: 4.775016800689923,
    reviewCount: 86,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.344Z',
    updatedAt: '2026-04-06T14:35:43.344Z',
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'cmnnalw1c000znhbpjit5bjom',
    name: 'Mochila Laptop Pro',
    slug: 'mochila-laptop-pro',
    description:
      'Mochila Laptop Pro - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 139.9,
    comparePrice: 169.9,
    image: '/images/products/bomber-black.png',
    categoryId: 'cmnnalw0v0007nhbp4cys6b8n',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: 18,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Gris","hex":"#6b7280"}]',
    rating: 4.550648727131667,
    reviewCount: 48,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.345Z',
    updatedAt: '2026-04-06T14:35:43.345Z',
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'cmnnalw1d0011nhbp9dnwgfas',
    name: 'Cadena Urban Gold',
    slug: 'cadena-urban-gold',
    description:
      'Cadena Urban Gold - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 39.9,
    comparePrice: null,
    image: '/images/products/hoodie-red.png',
    categoryId: 'cmnnalw0v0007nhbp4cys6b8n',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: false,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Dorado","hex":"#d4af37"},{"name":"Plateado","hex":"#c0c0c0"}]',
    rating: 4.735262988376045,
    reviewCount: 74,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.345Z',
    updatedAt: '2026-04-06T14:35:43.345Z',
    category: { name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'cmnnalw1e0013nhbpbf9phari',
    name: 'Bomber Jacket Negro',
    slug: 'bomber-jacket-negro',
    description:
      'Bomber Jacket Negro - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 199.9,
    comparePrice: 249.9,
    image: '/images/products/bomber-black.png',
    categoryId: 'cmnnalw0w0009nhbp0wcukjbh',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: 20,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Verde Militar","hex":"#4b5320"}]',
    rating: 4.631614845138458,
    reviewCount: 14,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.346Z',
    updatedAt: '2026-04-06T14:35:43.346Z',
    category: { name: 'Chaquetas', slug: 'chaquetas' },
  },
  {
    id: 'cmnnalw1f0015nhbpakc2fzf5',
    name: 'Windbreaker Deportivo',
    slug: 'windbreaker-deportivo',
    description:
      'Windbreaker Deportivo - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 159.9,
    comparePrice: null,
    image: '/images/products/denim-jacket.png',
    categoryId: 'cmnnalw0w0009nhbp0wcukjbh',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Negro","hex":"#1a1a1a"},{"name":"Azul","hex":"#3b82f6"}]',
    rating: 4.982064697436826,
    reviewCount: 45,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.347Z',
    updatedAt: '2026-04-06T14:35:43.347Z',
    category: { name: 'Chaquetas', slug: 'chaquetas' },
  },
  {
    id: 'cmnnalw1g0017nhbpvsrokikw',
    name: 'Hoodie Oversize Grey',
    slug: 'hoodie-oversize-grey',
    description:
      'Hoodie Oversize Grey - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 119.9,
    comparePrice: 149.9,
    image: '/images/products/hoodie-gray.png',
    categoryId: 'cmnnalw0x000bnhbpews99jhi',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: 20,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Gris","hex":"#6b7280"},{"name":"Negro","hex":"#1a1a1a"},{"name":"Beige","hex":"#d4b896"}]',
    rating: 4.991371482879045,
    reviewCount: 41,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.348Z',
    updatedAt: '2026-04-06T14:35:43.348Z',
    category: { name: 'Hoodies', slug: 'hoodies' },
  },
  {
    id: 'cmnnalw1h0019nhbphv7wzzx7',
    name: 'Hoodie Zip Street',
    slug: 'hoodie-zip-street',
    description:
      'Hoodie Zip Street - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 139.9,
    comparePrice: null,
    image: '/images/products/hoodie-red.png',
    categoryId: 'cmnnalw0x000bnhbpews99jhi',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Rojo","hex":"#ef4444"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.937638561117534,
    reviewCount: 86,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.349Z',
    updatedAt: '2026-04-06T14:35:43.349Z',
    category: { name: 'Hoodies', slug: 'hoodies' },
  },
  {
    id: 'cmnnalw1i001bnhbpn7y68fjz',
    name: 'Sweater Beige Premium',
    slug: 'sweater-beige-premium',
    description:
      'Sweater Beige Premium - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 109.9,
    comparePrice: 139.9,
    image: '/images/products/sweater-beige.png',
    categoryId: 'cmnnalw0x000bnhbpews99jhi',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: false,
    discount: 21,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Beige","hex":"#d4b896"},{"name":"Crema","hex":"#f5f0e8"}]',
    rating: 4.807727121792239,
    reviewCount: 21,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.350Z',
    updatedAt: '2026-04-06T14:35:43.350Z',
    category: { name: 'Hoodies', slug: 'hoodies' },
  },
  {
    id: 'cmnnalw1j001dnhbpcybtb8is',
    name: 'Sweater Cream Vintage',
    slug: 'sweater-cream-vintage',
    description:
      'Sweater Cream Vintage - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 99.9,
    comparePrice: null,
    image: '/images/products/sweater-cream.png',
    categoryId: 'cmnnalw0x000bnhbpews99jhi',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Crema","hex":"#f5f0e8"},{"name":"Gris","hex":"#6b7280"}]',
    rating: 4.690380070115676,
    reviewCount: 59,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.351Z',
    updatedAt: '2026-04-06T14:35:43.351Z',
    category: { name: 'Hoodies', slug: 'hoodies' },
  },
  {
    id: 'cmnnalw1k001fnhbp8dtelo2e',
    name: 'Denim Jacket Vintage',
    slug: 'denim-jacket-vintage',
    description:
      'Denim Jacket Vintage - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 189.9,
    comparePrice: 229.9,
    image: '/images/products/denim-vintage.png',
    categoryId: 'cmnnalw0w0009nhbp0wcukjbh',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: true,
    isNew: false,
    discount: 17,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Azul Denim","hex":"#5b8db8"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.736721518602732,
    reviewCount: 48,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.352Z',
    updatedAt: '2026-04-06T14:35:43.352Z',
    category: { name: 'Chaquetas', slug: 'chaquetas' },
  },
  {
    id: 'cmnnalw1l001hnhbppn02imru',
    name: 'Cargo Oliva Street',
    slug: 'cargo-oliva-street',
    description:
      'Cargo Oliva Street - Calidad premium para tu estilo urbano. Diseño exclusivo y materiales de alta calidad.',
    price: 134.9,
    comparePrice: null,
    image: '/images/products/cargo-olive.png',
    categoryId: 'cmnnalw0t0003nhbprt79pgbz',
    storeId: 'd1whgpglbzf8d42et5xp',
    isFeatured: false,
    isNew: true,
    discount: null,
    sizes: '["S","M","L","XL"]',
    colors: '[{"name":"Oliva","hex":"#4b5320"},{"name":"Negro","hex":"#1a1a1a"}]',
    rating: 4.517028007779012,
    reviewCount: 42,
    inStock: true,
    createdAt: '2026-04-06T14:35:43.354Z',
    updatedAt: '2026-04-06T14:35:43.354Z',
    category: { name: 'Pantalones', slug: 'pantalones' },
  },
]

export const seedTestimonials: SeedTestimonial[] = [
  {
    id: 'cmnnalw1m001jnhbp64wpmxxz',
    name: 'María García',
    role: 'Cliente frecuente',
    content:
      '¡Me encanta Urban Store! La calidad de la ropa es increíble y el envío es súper rápido.',
    rating: 5,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.355Z',
  },
  {
    id: 'cmnnalw1n001lnhbp9cr4cfwj',
    name: 'Carlos López',
    role: 'Comprador verificado',
    content:
      'Las zapatillas Air Runner Pro son espectaculares. Muy cómodas y el diseño es genial.',
    rating: 5,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.355Z',
  },
  {
    id: 'cmnnalw1n001nnhbp2queabyt',
    name: 'Ana Torres',
    role: 'Cliente VIP',
    content: 'Excelente atención al cliente y productos de primera calidad.',
    rating: 4,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.356Z',
  },
  {
    id: 'cmnnalw1o001pnhbpjgdvpxhj',
    name: 'Luis Ramírez',
    role: 'Influencer urbano',
    content:
      'El estilo urbano que ofrecen es único. Los hoodies son de los mejores.',
    rating: 5,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.356Z',
  },
  {
    id: 'cmnnalw1p001rnhbp153652wx',
    name: 'Sofía Martínez',
    role: 'Diseñadora de moda',
    content:
      'Como profesional de la moda, la calidad de Urban Store está a la altura de marcas premium.',
    rating: 5,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.357Z',
  },
  {
    id: 'cmnnalw1p001tnhbpts6t0usd',
    name: 'Diego Flores',
    role: 'Estudiante universitario',
    content: 'Buen precio y excelente calidad. Los jogger cargo son lo máximo.',
    rating: 4,
    storeId: 'd1whgpglbzf8d42et5xp',
    createdAt: '2026-04-06T14:35:43.358Z',
  },
]

// Store seed data for init-db endpoint
export const seedStore = {
  id: 'd1whgpglbzf8d42et5xp',
  name: 'Urban Store',
  slug: 'urban-store',
  logo: '',
  whatsappNumber: '51999999999',
  address: 'Av. Arequipa 1234, Lima, Perú',
  description:
    'Tu tienda de moda urbana favorita. Ropa, accesorios y más para un estilo único.',
  isActive: true,
  plan: 'pro',
}

// Helper: filter seed products using the same logic as the API route
export function filterSeedProducts(options: {
  category?: string | null
  featured?: string | null
  search?: string | null
}): SeedProduct[] {
  let filtered = seedProducts.filter((p) => p.inStock)

  if (options.category) {
    filtered = filtered.filter((p) => p.category.slug === options.category)
  }
  if (options.featured === 'true') {
    filtered = filtered.filter((p) => p.isFeatured)
  }
  if (options.search) {
    const q = options.search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }

  // Sort by createdAt desc (already in this order in the array)
  return filtered
}
