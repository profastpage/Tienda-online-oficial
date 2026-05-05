import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portafolio | Tienda Online Oficial',
  description: 'Descubre nuestros proyectos de e-commerce que transforman negocios en Perú.',
}

export default function PortafolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {children}
    </div>
  )
}
