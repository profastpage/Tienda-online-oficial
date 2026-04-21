# Tienda Online Oficial - Plataforma SaaS E-commerce

Plataforma SaaS para crear tiendas online en Perú. Los vendedores pueden crear su tienda, gestionar productos, recibir pedidos y aceptar pagos múltiples.

## Tecnologías

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** Turso (LibSQL) en producción, SQLite local en desarrollo
- **Auth:** JWT (jose), bcryptjs, Google OAuth, 2FA (TOTP)
- **Pagos:** MercadoPago, Yape, Plin, Transferencia
- **Almacenamiento:** Cloudinary
- **Deploy:** Vercel

## Requisitos

- Node.js 18+
- npm o bun
- Cuenta en Turso (para producción)
- Cuenta en Cloudinary (para imágenes)
- Cuenta en MercadoPago (para pagos online)

## Variables de Entorno

Configura estas variables en `.env.local` para desarrollo y en Vercel para producción:

### Esenciales
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de la base de datos | `file:./dev.db` |
| `TURSO_URL` | URL de Turso | `libsql://tu-db.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token de Turso | `tu-token` |
| `JWT_SECRET` | Secreto para JWT | `una-cadena-secreta-muy-larga` |

### Super Admin
| Variable | Descripción |
|----------|-------------|
| `SUPER_ADMIN_EMAIL` | Email del super admin |
| `SUPER_ADMIN_PASSWORD` | Contraseña del super admin |
| `SUPER_ADMIN_SECRET` | Token secreto del super admin |

### Email (Opcional)
| Variable | Descripción |
|----------|-------------|
| `EMAIL_API_KEY` | API key de Resend |
| `EMAIL_FROM` | Email remitente |

### Pagos
| Variable | Descripción |
|----------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso de MercadoPago |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para webhook de MercadoPago |

### Otros
| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp de contacto del proyecto |
| `CLOUDINARY_CLOUD_NAME` | Nombre de Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/profastpage/Tienda-online-oficial.git
cd Tienda-online-oficial

# Instalar dependencias
npm install --legacy-peer-deps

# Generar cliente Prisma
npx prisma generate

# Crear base de datos local
npx prisma db push

# Iniciar desarrollo
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run db:push` | Sincronizar schema con BD |
| `npm run db:generate` | Regenerar cliente Prisma |

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Login, registro, 2FA
│   │   ├── admin/        # Panel de administración
│   │   ├── super-admin/  # Panel de super admin
│   │   ├── payments/     # Pagos (MercadoPago)
│   │   └── customer/     # Endpoints de cliente
│   ├── [slug]/           # Tienda del cliente (storefront)
│   ├── admin/            # Panel admin
│   ├── super-admin/      # Panel super admin
│   └── login/            # Autenticación
├── components/           # Componentes React
├── lib/                  # Utilidades y servicios
├── stores/               # Zustand stores
└── hooks/                # Custom hooks
```

## Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar todas las variables de entorno
3. Build command: `npx prisma generate && next build`
4. Instalar command: `npm install --legacy-peer-deps`

## Planes

| Plan | Precio | Productos | Categorías | Pedidos |
|------|--------|-----------|------------|---------|
| Básico | S/49/mes | 50 | 5 | 100 |
| Pro | S/89/mes | 200 | 15 | 500 |
| Premium | S/129/mes | Ilimitados | Ilimitados | Ilimitados |
| Empresarial | Custom | Ilimitados | Ilimitados | Ilimitados |

## Licencia

Proyecto privado. Todos los derechos reservados.
