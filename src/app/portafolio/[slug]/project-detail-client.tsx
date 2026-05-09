'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, MapPin, Building2, Monitor, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { IPhoneMockup, MacBookMockup } from '@/components/device-mockup'
import { portfolioProjects, type PortfolioProject } from '@/lib/portfolio-data'
import { useRef } from 'react'

export default function ProjectDetailClient({ slug }: { slug: string }) {
  const project = portfolioProjects.find((p) => p.slug === slug)

  if (!project) {
    notFound()
  }

  return <ProjectDetailContent project={project} />
}

function ProjectDetailContent({ project }: { project: PortfolioProject }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const isHeroInView = useInView(heroRef, { once: true, margin: '-50px' })
  const isMockupInView = useInView(mockupRef, { once: true, margin: '-50px' })
  const isInfoInView = useInView(infoRef, { once: true, margin: '-50px' })

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top bar */}
      <div className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Portafolio
          </Link>
          <span className="text-sm font-medium text-neutral-300 truncate ml-4">{project.title}</span>
        </div>
      </div>

      {/* Hero area */}
      <div ref={heroRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/15 border-amber-500/20">
            {project.category}
          </Badge>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-xl sm:text-2xl text-amber-400 font-medium">{project.subtitle}</p>
          <p className="mt-6 text-neutral-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            {project.longDescription}
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Device Mockups */}
          <motion.div
            ref={mockupRef}
            initial={{ opacity: 0, x: -40 }}
            animate={isMockupInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative scale-[0.8] sm:scale-90 lg:scale-100 origin-center">
              <MacBookMockup
                image={project.desktopImage}
                alt={`${project.title} Desktop`}
                tilted
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isMockupInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative -mt-48 ml-auto mr-4 sm:mr-8 z-10"
            >
              <div className="scale-[0.55] sm:scale-[0.65] lg:scale-[0.7] origin-bottom-right">
                <IPhoneMockup
                  image={project.mobileImage}
                  alt={`${project.title} Mobile`}
                  tilted
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Project Info */}
          <motion.div
            ref={infoRef}
            initial={{ opacity: 0, x: 40 }}
            animate={isInfoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Business Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Negocio</p>
                  <p className="text-sm text-white font-medium">{project.businessName}</p>
                  <p className="text-xs text-neutral-400">{project.businessType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Ubicaci&oacute;n</p>
                  <p className="text-sm text-white font-medium">{project.location}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="flex items-start gap-2 flex-wrap mb-6">
              <Monitor className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            <Separator className="my-6 bg-neutral-800" />

            {/* Results */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {project.results.map((result) => (
                <div
                  key={result.metric}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">{result.value}</p>
                  <p className="text-xs text-neutral-500 mt-1 leading-tight">{result.metric}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-white mb-3">Caracter&iacute;sticas</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-neutral-400">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {project.liveUrl && (
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold"
                  onClick={() => window.open(project.liveUrl, '_blank')}
                >
                  Ver Demo en Vivo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-700 text-white hover:bg-neutral-800 rounded-full font-semibold"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hola! Estoy interesado en un proyecto similar a ${project.title}.`)}`
                  window.open(whatsappUrl, '_blank')
                }}
              >
                <MessageCircle className="mr-2 w-4 h-4" />
                Contactar
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Other Projects */}
      <section className="border-t border-neutral-800 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold text-white mb-8">Otros Proyectos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioProjects
              .filter((p) => p.slug !== project.slug)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/portafolio/${p.slug}`}
                  className="group rounded-xl overflow-hidden p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-200"
                >
                  <div
                    className="h-24 rounded-lg mb-3 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${p.color}cc, ${p.color}66)` }}
                  >
                    <span className="text-2xl font-bold text-white/30">{p.title.charAt(0)}</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">{p.category}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
