import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getProductBySlug,
  getProductImage,
  FALLBACK_PRODUCT_IMAGE,
} from '@/lib/server-product-data'

const SITE_URL = 'https://tienda-online-oficial.vercel.app'

interface LayoutProps {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const product = getProductBySlug(slug)

    // Slug inválido o no encontrado → metadata mínima (no crashea)
    if (!product) {
      return {
        title: 'Producto no encontrado | Urban Style',
        description: 'El producto que buscas no existe o fue removido.',
        openGraph: {
          title: 'Producto no encontrado | Urban Style',
          description: 'El producto que buscas no existe o fue removido.',
          url: `${SITE_URL}/demo/${slug}`,
          siteName: 'Urban Style',
          images: [{ url: FALLBACK_PRODUCT_IMAGE, width: 1344, height: 768, alt: 'Urban Style' }],
          locale: 'es_PE',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Producto no encontrado | Urban Style',
          description: 'El producto que buscas no existe o fue removido.',
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
      title: `${product.name} | Urban Style`,
      description: product.description,
      openGraph: {
        title: `${product.name} | Urban Style`,
        description: product.description.slice(0, 200),
        url: productUrl,
        siteName: 'Urban Style',
        images: [
          {
            url: validatedImage,
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
        images: [validatedImage],
      },
      alternates: {
        canonical: productUrl,
      },
    }
  } catch (error) {
    // Si algo falla en metadata, devolver un fallback seguro (nunca crashear)
    return {
      title: 'Urban Style | Tienda Online',
      description: 'Tu tienda de moda favorita. Calzado, ropa y accesorios.',
    }
  }
}

export default async function DemoSlugLayout({ params, children }: LayoutProps) {
  const { slug } = await params

  // Validación del slug en el servidor
  const product = getProductBySlug(slug)
  if (!product) {
    notFound()
  }

  return <>{children}</>
}
