import { notFound } from 'next/navigation'
import { getProductBySlug, normalizeSlug } from '@/lib/server-product-data'
import InterceptedProductModal from './intercepted-product-modal'

// ═══════════════════════════════════════════════════════════════════
// INTERCEPTING ROUTE — (.)[slug]
// ═══════════════════════════════════════════════════════════════════
//
// Esta ruta se activa UNICAMENTE cuando el usuario navega desde
// /demo hacia /demo/[slug] usando <Link> o router.push().
//
// Next.js "intercepta" la navegación y renderiza ESTA página
// en el slot @modal, SIN recargar la página principal (children).
//
// Convención (.) → intercepta rutas al MISMO nivel:
//   demo/@modal/(.)[slug]  intercepta  demo/[slug]
//
// Cuando el usuario recarga la página o accede directamente
// a /demo/[slug], esta ruta NO se activa. En su lugar,
// se renderiza demo/[slug]/page.tsx (fallback directo).
//

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function InterceptedProductPage({ params }: PageProps) {
  // 1. Await params (Next.js 15+ breaking change)
  const { slug: rawSlug } = await params

  // 2. Normalizar slug
  const slug = normalizeSlug(rawSlug)

  // 3. Validar: si no existe → 404
  if (!slug) {
    notFound()
  }

  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // 4. Renderizar Client Component que activa el modal vía Zustand
  return <InterceptedProductModal slug={product.slug} />
}

// Pre-generar todas las rutas de producto para SSG
export async function generateStaticParams() {
  const { VALID_PRODUCT_SLUGS } = await import('@/lib/server-product-data')
  return VALID_PRODUCT_SLUGS.map((slug) => ({ slug }))
}
