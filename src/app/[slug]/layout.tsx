import { getDb } from '@/lib/db'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const db = await getDb()
    const stores = await db.$queryRawUnsafe<{ id: string; name: string; description: string; logo: string; plan: string }[]>(
      `SELECT id, name, description, logo, plan FROM "Store" WHERE slug = '${slug.replace(/'/g, "''")}' AND isActive = 1`
    )

    if (stores.length === 0) {
      return {
        title: 'Tienda no encontrada | Tienda Online Oficial',
        description: 'La tienda que buscas no existe o está suspendida.',
      }
    }

    const store = stores[0]
    const storeUrl = `https://tienda-online-oficial.vercel.app/${slug}`
    const ogImage = store.logo || `https://tienda-online-oficial.vercel.app/images/og-default.png`

    return {
      title: `${store.name} | Tienda Online Oficial`,
      description: store.description || `Visita ${store.name} - Tienda online con los mejores productos. Compra fácil y seguro.`,
      keywords: [store.name, 'tienda online', 'comprar online', slug, 'Perú'],
      openGraph: {
        title: store.name,
        description: store.description || `Visita ${store.name} - Compra fácil y seguro.`,
        url: storeUrl,
        siteName: store.name,
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: store.name }] : [],
        locale: 'es_PE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: store.name,
        description: store.description || `Visita ${store.name} - Compra fácil y seguro.`,
        images: ogImage ? [ogImage] : [],
      },
      alternates: {
        canonical: storeUrl,
      },
    }
  } catch (error) {
    return {
      title: `${slug} | Tienda Online Oficial`,
      description: 'Tienda online - Compra fácil y seguro.',
    }
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children
}
