import type { Metadata } from 'next'
import { localProducts } from '@/components/storefront/storefront-local-data'

const SITE_URL = 'https://tienda-online-oficial.vercel.app'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = localProducts.find((p) => p.slug === slug)

  if (!product) {
    return {
      title: 'Producto no encontrado | Urban Style',
      description: 'El producto que buscas no existe o fue removido.',
    }
  }

  const productUrl = `${SITE_URL}/demo/${product.slug}`
  const priceLabel = product.comparePrice
    ? `S/ ${product.price.toFixed(2)} (antes S/ ${product.comparePrice.toFixed(2)})`
    : `S/ ${product.price.toFixed(2)}`

  return {
    title: `${product.name} | Urban Style`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Urban Style`,
      description: product.description.slice(0, 200),
      url: productUrl,
      siteName: 'Urban Style',
      images: [
        {
          url: product.image,
          width: 600,
          height: 800,
          alt: product.name,
        },
      ],
      locale: 'es_PE',
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Urban Style`,
      description: `${product.description.slice(0, 150)} — ${priceLabel}`,
      images: [product.image],
    },
    alternates: {
      canonical: productUrl,
    },
  }
}

export default function DemoSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
