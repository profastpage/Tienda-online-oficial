// ═══════════════════════════════════════════════════════════
// Media Collection - Image/File Storage
// Uses Cloudinary for production (via existing setup)
// Falls back to local storage for development
// ═══════════════════════════════════════════════════════════

import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: 'Imágenes y archivos multimedia',
    useAsTitle: 'filename',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && (user.role === 'super-admin' || user.role === 'admin')),
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 600,
        height: 600,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1200,
        height: 600,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
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
      label: 'Descripción',
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
  ],
  hooks: {
    beforeChange: [
      // Auto-set storeId from authenticated user
      async ({ data, req }) => {
        if (req.user && !data.storeId) {
          data.storeId = (req.user as any).storeId || ''
        }
        return data
      },
    ],
  },
}
