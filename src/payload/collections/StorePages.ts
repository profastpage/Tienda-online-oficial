// ═══════════════════════════════════════════════════════════
// StorePages Collection - Page Layout Management
// Each store can have multiple page layouts (home, about, etc.)
// Multi-tenant via storeId
// ═══════════════════════════════════════════════════════════

import { CollectionConfig, Block } from 'payload'

// Import block types from ContentBlocks
const HeroBlock: Block = {
  slug: 'hero-block',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'badge', type: 'text', label: 'Badge/Tag', defaultValue: 'Nueva Colección' },
    { name: 'title', type: 'text', label: 'Título Principal', required: true },
    { name: 'subtitle', type: 'textarea', label: 'Subtítulo' },
    { name: 'ctaText', type: 'text', label: 'Texto del Botón', defaultValue: 'Comprar Ahora' },
    { name: 'ctaLink', type: 'text', label: 'Enlace del Botón', defaultValue: '#products' },
    {
      name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Imagen de Fondo',
      filterOptions: { 'mimeType': { contains: 'image' } },
    },
    { name: 'overlayOpacity', type: 'number', label: 'Overlay (%)', defaultValue: 30, min: 0, max: 100 },
    { name: 'textColor', type: 'select', label: 'Color del Texto', defaultValue: 'white',
      options: [{ label: 'Blanco', value: 'white' }, { label: 'Negro', value: 'black' }] },
    { name: 'alignment', type: 'select', label: 'Alineación', defaultValue: 'left',
      options: [{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }] },
    { name: 'fullHeight', type: 'checkbox', label: 'Altura Completa', defaultValue: false },
  ],
}

const BannerBlock: Block = {
  slug: 'banner-block',
  interfaceName: 'BannerBlock',
  labels: { singular: 'Banner', plural: 'Banners' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true },
    { name: 'description', type: 'textarea', label: 'Descripción' },
    { name: 'ctaText', type: 'text', label: 'Texto del Botón' },
    { name: 'ctaLink', type: 'text', label: 'Enlace del Botón' },
    {
      name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen del Banner',
      filterOptions: { 'mimeType': { contains: 'image' } },
    },
    { name: 'variant', type: 'select', label: 'Variante', defaultValue: 'primary',
      options: [{ label: 'Principal', value: 'primary' }, { label: 'Oferta', value: 'offer' }, { label: 'Minimalista', value: 'minimal' }] },
    { name: 'showOnMobile', type: 'checkbox', label: 'Mostrar en Mobile', defaultValue: true },
  ],
}

const ProductGalleryBlock: Block = {
  slug: 'product-gallery-block',
  interfaceName: 'ProductGalleryBlock',
  labels: { singular: 'Galería de Productos', plural: 'Galerías' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', defaultValue: 'Productos Destacados' },
    { name: 'subtitle', type: 'text', label: 'Subtítulo' },
    { name: 'productSource', type: 'select', label: 'Fuente', defaultValue: 'featured',
      options: [
        { label: 'Destacados', value: 'featured' }, { label: 'Nuevos', value: 'new' },
        { label: 'En Oferta', value: 'on-sale' }, { label: 'Todos', value: 'all' },
        { label: 'Categoría', value: 'category' },
      ] },
    { name: 'categorySlug', type: 'text', label: 'Slug de Categoría',
      admin: { condition: (_, s) => s?.productSource === 'category' } },
    { name: 'maxProducts', type: 'number', label: 'Máximo', defaultValue: 8, min: 1, max: 24 },
    { name: 'layout', type: 'select', label: 'Layout', defaultValue: 'grid',
      options: [{ label: 'Cuadrícula', value: 'grid' }, { label: 'Carrusel', value: 'carousel' }] },
    { name: 'showButton', type: 'checkbox', label: 'Mostrar Botón "Ver Todo"', defaultValue: true },
  ],
}

const TextBlock: Block = {
  slug: 'text-block',
  interfaceName: 'TextBlock',
  labels: { singular: 'Bloque de Texto', plural: 'Bloques de Texto' },
  fields: [
    { name: 'content', type: 'richText', label: 'Contenido', required: true },
    { name: 'alignment', type: 'select', label: 'Alineación', defaultValue: 'left',
      options: [{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }] },
    { name: 'backgroundColor', type: 'select', label: 'Fondo', defaultValue: 'transparent',
      options: [{ label: 'Transparente', value: 'transparent' }, { label: 'Gris Claro', value: 'muted' }, { label: 'Color Principal', value: 'primary' }] },
  ],
}

const FeaturesBlock: Block = {
  slug: 'features-block',
  interfaceName: 'FeaturesBlock',
  labels: { singular: 'Features', plural: 'Features' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', defaultValue: '¿Por qué elegirnos?' },
    { name: 'features', type: 'array', label: 'Features', fields: [
      { name: 'icon', type: 'text', label: 'Icono', defaultValue: '✨' },
      { name: 'title', type: 'text', label: 'Título', required: true },
      { name: 'description', type: 'text', label: 'Descripción' },
    ] },
  ],
}

const SpacerBlock: Block = {
  slug: 'spacer-block',
  interfaceName: 'SpacerBlock',
  labels: { singular: 'Espaciador', plural: 'Espaciadores' },
  fields: [
    { name: 'height', type: 'select', label: 'Altura', defaultValue: 'md',
      options: [{ label: 'Pequeño', value: 'sm' }, { label: 'Mediano', value: 'md' }, { label: 'Grande', value: 'lg' }] },
  ],
}

export const StorePages: CollectionConfig = {
  slug: 'store-pages',
  admin: {
    useAsTitle: 'title',
    description: 'Páginas de las tiendas con layout de bloques',
    defaultColumns: ['title', 'storeSlug', 'pageType', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && (user.role === 'super-admin' || user.role === 'admin')),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título de la Página',
      required: true,
      defaultValue: 'Página Principal',
    },
    {
      name: 'storeSlug',
      type: 'text',
      required: true,
      index: true,
      label: 'Slug de la Tienda',
      admin: {
        description: 'Identificador único de la tienda',
        readOnly: true,
      },
    },
    {
      name: 'storeId',
      type: 'text',
      required: true,
      index: true,
      label: 'ID de Tienda',
      admin: {
        description: 'ID interno de la tienda',
        readOnly: true,
      },
    },
    {
      name: 'pageType',
      type: 'select',
      required: true,
      label: 'Tipo de Página',
      defaultValue: 'home',
      options: [
        { label: 'Página Principal', value: 'home' },
        { label: 'Página de Ofertas', value: 'offers' },
        { label: 'Acerca de', value: 'about' },
        { label: 'Contacto', value: 'contact' },
        { label: 'Personalizada', value: 'custom' },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: 'Publicada',
      defaultValue: true,
    },
    {
      name: 'seoTitle',
      type: 'text',
      label: 'SEO Title',
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'SEO Description',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'OG Image',
      filterOptions: {
        'mimeType': { contains: 'image' },
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout de la Página',
      required: true,
      blocks: [
        HeroBlock,
        BannerBlock,
        ProductGalleryBlock,
        TextBlock,
        FeaturesBlock,
        SpacerBlock,
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set storeId and storeSlug from authenticated user on create
        if (operation === 'create' && req.user) {
          if (!data.storeId) data.storeId = (req.user as any).storeId || ''
          if (!data.storeSlug) data.storeSlug = (req.user as any).storeSlug || ''
        }
        return data
      },
    ],
  },
}
