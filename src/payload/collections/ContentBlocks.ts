// ═══════════════════════════════════════════════════════════
// ContentBlocks Collection - Reusable Block Components
// Multi-tenant: each block belongs to a store via storeId
// ═══════════════════════════════════════════════════════════

import { CollectionConfig, Block } from 'payload'

// ─── HERO BLOCK ───
const HeroBlock: Block = {
  slug: 'hero-block',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Badge/Tag',
      defaultValue: 'Nueva Colección',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título Principal',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Subtítulo',
      defaultValue: '',
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'Texto del Botón',
      defaultValue: 'Comprar Ahora',
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'Enlace del Botón',
      defaultValue: '#products',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de Fondo',
      filterOptions: {
        'mimeType': { contains: 'image' },
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      label: 'Opacidad del Overlay (%)',
      defaultValue: 30,
      min: 0,
      max: 100,
    },
    {
      name: 'textColor',
      type: 'select',
      label: 'Color del Texto',
      defaultValue: 'white',
      options: [
        { label: 'Blanco', value: 'white' },
        { label: 'Negro', value: 'black' },
      ],
    },
    {
      name: 'alignment',
      type: 'select',
      label: 'Alineación',
      defaultValue: 'left',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' },
      ],
    },
    {
      name: 'fullHeight',
      type: 'checkbox',
      label: 'Altura Completa',
      defaultValue: false,
      admin: {
        description: 'Ocupar toda la altura de la pantalla',
      },
    },
  ],
}

// ─── BANNER BLOCK ───
const BannerBlock: Block = {
  slug: 'banner-block',
  interfaceName: 'BannerBlock',
  labels: { singular: 'Banner', plural: 'Banners' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'Texto del Botón',
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'Enlace del Botón',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen del Banner',
      filterOptions: {
        'mimeType': { contains: 'image' },
      },
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Variante',
      defaultValue: 'primary',
      options: [
        { label: 'Principal', value: 'primary' },
        { label: 'Secundario', value: 'secondary' },
        { label: 'Oferta', value: 'offer' },
        { label: 'Minimalista', value: 'minimal' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Color de Fondo',
      defaultValue: 'store-primary',
      options: [
        { label: 'Color Principal', value: 'store-primary' },
        { label: 'Negro', value: 'black' },
        { label: 'Blanco', value: 'white' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Personalizado', value: 'custom' },
      ],
    },
    {
      name: 'customBgColor',
      type: 'text',
      label: 'Color Personalizado (Hex)',
      admin: {
        condition: (_, siblingData) => siblingData?.backgroundColor === 'custom',
      },
    },
    {
      name: 'showOnMobile',
      type: 'checkbox',
      label: 'Mostrar en Mobile',
      defaultValue: true,
    },
  ],
}

// ─── PRODUCT GALLERY BLOCK ───
const ProductGalleryBlock: Block = {
  slug: 'product-gallery-block',
  interfaceName: 'ProductGalleryBlock',
  labels: { singular: 'Galería de Productos', plural: 'Galerías de Productos' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título de la Sección',
      defaultValue: 'Productos Destacados',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtítulo',
    },
    {
      name: 'productSource',
      type: 'select',
      label: 'Fuente de Productos',
      defaultValue: 'featured',
      options: [
        { label: 'Productos Destacados', value: 'featured' },
        { label: 'Nuevos Productos', value: 'new' },
        { label: 'En Oferta', value: 'on-sale' },
        { label: 'Todos los Productos', value: 'all' },
        { label: 'Categoría Específica', value: 'category' },
      ],
    },
    {
      name: 'categorySlug',
      type: 'text',
      label: 'Slug de Categoría',
      admin: {
        condition: (_, siblingData) => siblingData?.productSource === 'category',
        description: 'Ej: camisetas, polos, jeans',
      },
    },
    {
      name: 'maxProducts',
      type: 'number',
      label: 'Máximo de Productos',
      defaultValue: 8,
      min: 1,
      max: 24,
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Columnas (Desktop)',
      defaultValue: '4',
      options: [
        { label: '2 Columnas', value: '2' },
        { label: '3 Columnas', value: '3' },
        { label: '4 Columnas', value: '4' },
        { label: '5 Columnas', value: '5' },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Layout',
      defaultValue: 'grid',
      options: [
        { label: 'Cuadrícula', value: 'grid' },
        { label: 'Carrusel', value: 'carousel' },
        { label: 'Lista', value: 'list' },
      ],
    },
    {
      name: 'showButton',
      type: 'checkbox',
      label: 'Mostrar Botón "Ver Todo"',
      defaultValue: true,
    },
    {
      name: 'buttonText',
      type: 'text',
      label: 'Texto del Botón',
      defaultValue: 'Ver Todo',
      admin: {
        condition: (_, siblingData) => siblingData?.showButton === true,
      },
    },
  ],
}

// ─── TEXT/CONTENT BLOCK ───
const TextBlock: Block = {
  slug: 'text-block',
  interfaceName: 'TextBlock',
  labels: { singular: 'Bloque de Texto', plural: 'Bloques de Texto' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Contenido',
      required: true,
      admin: {
        description: 'Editor de texto enriquecido',
      },
    },
    {
      name: 'alignment',
      type: 'select',
      label: 'Alineación',
      defaultValue: 'left',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' },
      ],
    },
    {
      name: 'maxWidth',
      type: 'select',
      label: 'Ancho Máximo',
      defaultValue: 'full',
      options: [
        { label: 'Completo', value: 'full' },
        { label: 'Mediano (3xl)', value: '3xl' },
        { label: 'Estrecho (2xl)', value: '2xl' },
        { label: 'Texto (xl)', value: 'xl' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Color de Fondo',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparente', value: 'transparent' },
        { label: 'Gris Claro', value: 'muted' },
        { label: 'Color Principal', value: 'primary' },
        { label: 'Negro', value: 'black' },
      ],
    },
  ],
}

// ─── FEATURES/BENEFITS BLOCK ───
const FeaturesBlock: Block = {
  slug: 'features-block',
  interfaceName: 'FeaturesBlock',
  labels: { singular: 'Bloque de Features', plural: 'Bloques de Features' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      defaultValue: '¿Por qué elegirnos?',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtítulo',
    },
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: 'Icono (Emoji)',
          defaultValue: '✨',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Título',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Descripción',
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Columnas',
      defaultValue: '4',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
  ],
}

// ─── TESTIMONIALS BLOCK ───
const TestimonialsBlock: Block = {
  slug: 'testimonials-block',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Bloque de Testimonios', plural: 'Bloques de Testimonios' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      defaultValue: 'Lo que dicen nuestros clientes',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtítulo',
    },
    {
      name: 'source',
      type: 'select',
      label: 'Fuente',
      defaultValue: 'dynamic',
      options: [
        { label: 'Testimonios de la Tienda (Dinámico)', value: 'dynamic' },
        { label: 'Manuales (Definidos aquí)', value: 'manual' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Testimonios Manuales',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nombre',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          label: 'Rol/Cargo',
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Contenido',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Calificación (1-5)',
          defaultValue: 5,
          min: 1,
          max: 5,
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Avatar',
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Layout',
      defaultValue: 'carousel',
      options: [
        { label: 'Carrusel', value: 'carousel' },
        { label: 'Cuadrícula', value: 'grid' },
      ],
    },
  ],
}

// ─── FAQ BLOCK ───
const FAQBlock: Block = {
  slug: 'faq-block',
  interfaceName: 'FAQBlock',
  labels: { singular: 'Bloque de FAQ', plural: 'Bloques de FAQ' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      defaultValue: 'Preguntas Frecuentes',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtítulo',
    },
    {
      name: 'source',
      type: 'select',
      label: 'Fuente',
      defaultValue: 'dynamic',
      options: [
        { label: 'FAQ de la Tienda (Dinámico)', value: 'dynamic' },
        { label: 'Manuales (Definidos aquí)', value: 'manual' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Preguntas Manuales',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Pregunta',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: 'Respuesta',
          required: true,
        },
      ],
    },
  ],
}

// ─── NEWSLETTER BLOCK ───
const NewsletterBlock: Block = {
  slug: 'newsletter-block',
  interfaceName: 'NewsletterBlock',
  labels: { singular: 'Bloque de Newsletter', plural: 'Bloques de Newsletter' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      defaultValue: 'Recibe ofertas exclusivas',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtítulo',
    },
    {
      name: 'placeholder',
      type: 'text',
      label: 'Placeholder del Input',
      defaultValue: 'tu@email.com',
    },
    {
      name: 'buttonText',
      type: 'text',
      label: 'Texto del Botón',
      defaultValue: 'Suscribirme',
    },
    {
      name: 'disclaimer',
      type: 'text',
      label: 'Disclaimer',
      defaultValue: 'Sin spam. Puedes darte de baja cuando quieras.',
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Color de Fondo',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparente', value: 'transparent' },
        { label: 'Gris Claro', value: 'muted' },
        { label: 'Color Principal', value: 'primary' },
      ],
    },
  ],
}

// ─── STATS BLOCK ───
const StatsBlock: Block = {
  slug: 'stats-block',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Bloque de Estadísticas', plural: 'Bloques de Estadísticas' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Estadísticas',
      required: true,
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Valor',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Etiqueta',
          required: true,
        },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Color de Fondo',
      defaultValue: 'primary',
      options: [
        { label: 'Color Principal', value: 'primary' },
        { label: 'Negro', value: 'black' },
        { label: 'Gris Claro', value: 'muted' },
      ],
    },
  ],
}

// ─── CTA BLOCK ───
const CTABlock: Block = {
  slug: 'cta-block',
  interfaceName: 'CTABlock',
  labels: { singular: 'Bloque CTA', plural: 'Bloques CTA' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
      defaultValue: '¿Listo para encontrar tu estilo?',
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Subtítulo',
    },
    {
      name: 'primaryButton',
      type: 'group',
      label: 'Botón Principal',
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Texto',
          defaultValue: 'Ver Catálogo',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Enlace',
          defaultValue: '#products',
        },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      label: 'Botón Secundario',
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Texto',
          defaultValue: 'Ver Ofertas',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Enlace',
          defaultValue: '#ofertas',
        },
      ],
    },
    {
      name: 'footer',
      type: 'text',
      label: 'Texto Inferior',
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Variante',
      defaultValue: 'gradient',
      options: [
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Sólido', value: 'solid' },
        { label: 'Mínimo', value: 'minimal' },
      ],
    },
  ],
}

// ─── SPACER BLOCK ───
const SpacerBlock: Block = {
  slug: 'spacer-block',
  interfaceName: 'SpacerBlock',
  labels: { singular: 'Espaciador', plural: 'Espaciadores' },
  fields: [
    {
      name: 'height',
      type: 'select',
      label: 'Altura',
      defaultValue: 'md',
      options: [
        { label: 'Pequeño (py-8)', value: 'sm' },
        { label: 'Mediano (py-16)', value: 'md' },
        { label: 'Grande (py-24)', value: 'lg' },
        { label: 'Extra Grande (py-32)', value: 'xl' },
      ],
    },
    {
      name: 'showDivider',
      type: 'checkbox',
      label: 'Mostrar Divisor',
      defaultValue: false,
    },
  ],
}

// ─── DIVIDER BLOCK ───
const DividerBlock: Block = {
  slug: 'divider-block',
  interfaceName: 'DividerBlock',
  labels: { singular: 'Divisor', plural: 'Divisores' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Estilo',
      defaultValue: 'solid',
      options: [
        { label: 'Sólido', value: 'solid' },
        { label: 'Punteado', value: 'dashed' },
        { label: 'Puntos', value: 'dotted' },
      ],
    },
    {
      name: 'margin',
      type: 'select',
      label: 'Margen',
      defaultValue: 'normal',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Pequeño', value: 'small' },
        { label: 'Grande', value: 'large' },
      ],
    },
  ],
}

// ─── COLLECTION CONFIG ───
export const ContentBlocks: CollectionConfig = {
  slug: 'content-blocks',
  admin: {
    useAsTitle: 'blockName',
    description: 'Bloques de contenido reutilizables para las tiendas',
  },
  access: {
    // Auth is handled at the API proxy route level (/api/payload)
    // Payload access controls are set to true so localAPI calls work
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'blockName',
      type: 'text',
      label: 'Nombre del Bloque',
      required: true,
      admin: {
        description: 'Nombre descriptivo para identificar el bloque',
      },
    },
    {
      name: 'storeId',
      type: 'text',
      required: true,
      index: true,
      label: 'ID de Tienda',
      admin: {
        description: 'Tienda a la que pertenece este bloque',
        readOnly: true,
      },
    },
    {
      name: 'blockType',
      type: 'blocks',
      label: 'Tipo de Bloque',
      required: true,
      blocks: [
        HeroBlock,
        BannerBlock,
        ProductGalleryBlock,
        TextBlock,
        FeaturesBlock,
        TestimonialsBlock,
        FAQBlock,
        NewsletterBlock,
        StatsBlock,
        CTABlock,
        SpacerBlock,
        DividerBlock,
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Activo',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
      admin: {
        description: 'Orden de aparición (menor = primero)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-set storeId from authenticated user
        if (req.user && !data.storeId) {
          data.storeId = (req.user as any).storeId || ''
        }
        return data
      },
    ],
    beforeRead: [
      // Filter by storeId automatically
    ],
  },
}
