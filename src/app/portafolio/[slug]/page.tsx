import { portfolioProjects } from '@/lib/portfolio-data'
import ProjectDetailClient from './project-detail-client'

// Server component — generateStaticParams is server-only in Next.js 16
export async function generateStaticParams() {
  return portfolioProjects.map((project) => ({
    slug: project.slug,
  }))
}

// Generate metadata for each project (SEO)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = portfolioProjects.find((p) => p.slug === slug)
  if (!project) return { title: 'Proyecto no encontrado' }

  return {
    title: `${project.title} | Portafolio - Tienda Online Oficial`,
    description: project.longDescription,
  }
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ProjectDetailClient slug={slug} />
}
