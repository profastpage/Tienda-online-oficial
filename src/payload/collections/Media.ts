// ═══════════════════════════════════════════════════════════
// Media Collection - File Storage
// Uses Supabase Storage (S3-compatible) in production
// Falls back to local filesystem for development
// ═══════════════════════════════════════════════════════════

import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: 'Imagenes y archivos multimedia',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'storeId', 'fileSize', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && (user.role === 'super-admin' || user.role === 'admin')),
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/pdf',
    ],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 600, height: 600, position: 'centre' },
      { name: 'hero', width: 1200, height: 600, position: 'centre' },
      { name: 'large', width: 1920, height: 1080, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto Alternativo',
      required: true,
      localized: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Descripcion',
    },
    {
      name: 'storeId',
      type: 'text',
      label: 'ID de Tienda',
      index: true,
      admin: {
        description: 'Tienda a la que pertenece este archivo',
      },
    },
    {
      name: 'folder',
      type: 'select',
      label: 'Carpeta',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Productos', value: 'products' },
        { label: 'Banners', value: 'banners' },
        { label: 'Heroes', value: 'heroes' },
        { label: 'Logos', value: 'logos' },
        { label: 'Avatares', value: 'avatars' },
        { label: 'Documentos', value: 'documents' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (req.user && !data.storeId) {
          data.storeId = (req.user as any).storeId || ''
        }
        return data
      },
    ],
  },
}
