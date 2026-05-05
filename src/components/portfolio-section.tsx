'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { portfolioProjects, categories, type PortfolioProject } from '@/lib/portfolio-data'
import { useRef } from 'react'

interface PortfolioSectionProps {
  onSelectProject: (project: PortfolioProject) => void
}

export function PortfolioSection({ onSelectProject }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' })
  const isGridInView = useInView(gridRef, { once: true, margin: '-80px' })

  const filteredProjects =
    activeCategory === 'Todos'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeCategory)

  return (
    <section id="portfolio" className="py-12 sm:py-16 lg:py-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 border-amber-500/20">
            Portafolio
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Nuestro Portafolio
          </h2>
          <p className="mt-4 text-neutral-400 text-lg max-w-2xl mx-auto">
            Proyectos que transforman negocios
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Project Grid */}
        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={isGridInView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.slug}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
              }}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => onSelectProject(project)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden h-[360px] shadow-lg"
              >
                {/* Background with gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}cc, ${project.color}88)`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Placeholder content inside the card */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-4xl font-bold text-white/40">
                        {project.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content overlay */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  {/* Category badge */}
                  <div className="mb-3">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10">
                      {project.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-neutral-300 mb-4">{project.subtitle}</p>

                  {/* Hover CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1 }}
                    className="flex items-center gap-2 text-amber-400 text-sm font-semibold group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span>Ver Proyecto</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-300 pointer-events-none" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isGridInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="/portafolio"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Ver todos los proyectos
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
