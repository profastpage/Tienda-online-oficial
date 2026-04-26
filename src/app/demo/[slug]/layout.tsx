import type { Metadata } from 'next'
import {
  getProductBySlug,
  getProductImage,
  FALLBACK_PRODUCT_IMAGE,
} from '@/lib/server-product-data'

const SITE_URL = 'https://tienda-online-oficial.vercel.app'
const STORE_NAME = 'Tienda Online Oficial'
const STORE_TAGLINE = 'Tu tienda de moda en línea. Calzado, ropa y accesorios.'

interface LayoutProps {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const product = getProductBySlug(slug)

    if (!product) {
      return {
        title: `${STORE_NAME} | Tienda Online`,
        description: STORE_TAGLINE,
        openGraph: {
          title: `${STORE_NAME} | Tienda Online`,
          description: STORE_TAGLINE,
          url: `${SITE_URL}/demo/${slug}`,
          siteName: STORE_NAME,
          images: [{ url: FALLBACK_PRODUCT_IMAGE, width: 1344, height: 768, alt: STORE_NAME }],
          locale: 'es_PE',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${STORE_NAME} | Tienda Online`,
          description: STORE_TAGLINE,
          images: [FALLBACK_PRODUCT_IMAGE],
        },
      }
    }

    const productUrl = `${SITE_URL}/demo/${product.slug}`
    const validatedImage = getProductImage(product.image)

    const priceLabel = product.comparePrice
      ? `S/ ${product.price.toFixed(2)} (antes S/ ${product.comparePrice.toFixed(2)})`
      : `S/ ${product.price.toFixed(2)}`

    return {
      title: `${product.name} | ${STORE_NAME}`,
      description: product.description,
      openGraph: {
        title: `${product.name} | ${STORE_NAME}`,
        description: product.description.slice(0, 200),
        url: productUrl,
        siteName: STORE_NAME,
        images: [
          {
            url: validatedImage,
            width: 600,
            height: 800,
            alt: product.name,
          },
        ],
        locale: 'es_PE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | ${STORE_NAME}`,
        description: `${product.description.slice(0, 150)} — ${priceLabel}`,
        images: [validatedImage],
      },
      alternates: {
        canonical: productUrl,
      },
    }
  } catch {
    return {
      title: `${STORE_NAME} | Tienda Online`,
      description: STORE_TAGLINE,
    }
  }
}

// Layout SIMPLE: solo pasa children. NO llama notFound().
// El page.tsx se encarga de decidir qué mostrar.
export default function DemoSlugLayout({ children }: LayoutProps) {
  return <>{children}</>
}
