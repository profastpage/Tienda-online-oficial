import { notFound } from 'next/navigation'
import { getProductBySlug, normalizeSlug } from '@/lib/server-product-data'
import ProductPageClient from './product-page-client'

// ═══════════════════════════════════════════════════════════════════
// SERVER COMPONENT — Manejo seguro de params como Promesa (Next.js 15+)
// ═══════════════════════════════════════════════════════════════════
//
// 1. await params → Next.js 15+ requiere que params sea awaited
// 2. normalizeSlug() → maneja mayúsculas, espacios, trim
// 3. notFound() → muestra 404 si el slug no existe (no crash del sistema)
// 4. Renderiza Client Component con el slug validado
//

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DemoProductPage({ params }: PageProps) {
  // 1. Await params (Next.js 15+ breaking change)
  const { slug: rawSlug } = await params

  // 2. Normalizar: toLowerCase, trim, espacios → guiones
  const slug = normalizeSlug(rawSlug)

  // 3. Búsqueda segura — si no existe, 404 del sistema (no error de server)
  if (!slug) {
    notFound()
  }

  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // 4. Renderizar Client Component con el slug validado
  return <ProductPageClient slug={product.slug} productName={product.name} />
}

// generateStaticParams para que Next.js pre-genere las 30 rutas en build
export async function generateStaticParams() {
  const { VALID_PRODUCT_SLUGS } = await import('@/lib/server-product-data')
  return VALID_PRODUCT_SLUGS.map((slug) => ({ slug }))
}
