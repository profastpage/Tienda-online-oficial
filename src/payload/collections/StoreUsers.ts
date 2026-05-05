// ═══════════════════════════════════════════════════════════
// StoreUsers Collection - Payload CMS Authentication
// Integrates with existing auth system via JWT validation
// ═══════════════════════════════════════════════════════════

import { CollectionConfig } from 'payload'

export const StoreUsers: CollectionConfig = {
  slug: 'store-users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Usuarios administradores de tiendas',
    hidden: false,
  },
  access: {
    // Auth is handled at the API proxy route level
    read: () => true,
    create: () => true, // Can create via existing registration system
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },
    {
      name: 'storeId',
      type: 'text',
      label: 'ID de Tienda',
      admin: {
        description: 'ID de la tienda a la que pertenece este usuario',
        readOnly: true,
      },
    },
    {
      name: 'storeName',
      type: 'text',
      label: 'Nombre de Tienda',
      admin: {
        description: 'Nombre visible de la tienda',
        readOnly: true,
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    // Sync with existing auth after login
  },
}
