import { getDb } from '@/lib/db'

const STORE_URL = 'https://tienda-online-oficial.vercel.app'
const DEFAULT_OG_IMAGE = `${STORE_URL}/og-default.png`

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const db = await getDb()
    const stores = await db.$queryRawUnsafe<{ id: string; name: string; description: string; logo: string; plan: string; favicon: string }[]>(
      `SELECT id, name, description, logo, plan, favicon FROM "Store" WHERE slug = '${slug.replace(/'/g, "''")}' AND isActive = 1`
    )

    if (stores.length === 0) {
      // Store not in DB — use rich fallback OG for demo stores
      const storeName = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return {
        title: `${storeName} | Tienda Online Oficial`,
        description: `Visita ${storeName} — Tienda online con los mejores productos. Compra fácil y seguro por WhatsApp.`,
        openGraph: {
          title: `${storeName} 🛍️`,
          description: `Visita ${storeName} — Tienda online con los mejores productos. Compra fácil y seguro por WhatsApp.`,
          url: `${STORE_URL}/${slug}`,
          siteName: 'Tienda Online Oficial',
          images: [{ url: DEFAULT_OG_IMAGE, width: 1344, height: 768, alt: storeName }],
          locale: 'es_PE',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image' as const,
          title: `${storeName} 🛍️`,
          description: `Visita ${storeName} — Tienda online con los mejores productos.`,
          images: [DEFAULT_OG_IMAGE],
        },
      }
    }

    const store = stores[0]
    const storeUrl = `${STORE_URL}/${slug}`
    const ogImage = store.logo || DEFAULT_OG_IMAGE

    const metadata: Record<string, unknown> = {
      title: `${store.name} | Tienda Online Oficial`,
      description: store.description || `Visita ${store.name} — Tienda online con los mejores productos. Compra fácil y seguro.`,
      keywords: [store.name, 'tienda online', 'comprar online', slug, 'Perú'],
      openGraph: {
        title: `${store.name} 🛍️`,
        description: store.description || `Visita ${store.name} — Compra fácil y seguro.`,
        url: storeUrl,
        siteName: store.name,
        images: [{ url: ogImage, width: 1344, height: 768, alt: store.name }],
        locale: 'es_PE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: `${store.name} 🛍️`,
        description: store.description || `Visita ${store.name} — Compra fácil y seguro.`,
        images: [ogImage],
      },
      alternates: {
        canonical: storeUrl,
      },
    }

    if (store.favicon) {
      metadata.icons = {
        icon: store.favicon,
      }
    }

    return metadata
  } catch (error) {
    // DB error — still return proper OG tags
    const storeName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return {
      title: `${storeName} | Tienda Online Oficial`,
      description: 'Tienda online — Compra fácil y seguro.',
      openGraph: {
        title: `${storeName} 🛍️`,
        description: 'Tienda online — Compra fácil y seguro por WhatsApp.',
        url: `${STORE_URL}/${slug}`,
        siteName: 'Tienda Online Oficial',
        images: [{ url: DEFAULT_OG_IMAGE, width: 1344, height: 768, alt: storeName }],
        locale: 'es_PE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: `${storeName} 🛍️`,
        description: 'Tienda online — Compra fácil y seguro.',
        images: [DEFAULT_OG_IMAGE],
      },
    }
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children
}
