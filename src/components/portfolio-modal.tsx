'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Check, MapPin, Building2, Monitor, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { IPhoneMockup, MacBookMockup } from '@/components/device-mockup'
import type { PortfolioProject } from '@/lib/portfolio-data'

interface PortfolioModalProps {
  project: PortfolioProject
  onClose: () => void
}

export function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-start justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal content */}
        <motion.div
          ref={scrollRef}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-[105] w-full max-w-6xl mx-4 my-8 bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Left Column - Device Mockups */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col items-center justify-center"
              >
                {/* MacBook Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="relative scale-[0.85] sm:scale-100 origin-center">
                    <MacBookMockup
                      image={project.desktopImage}
                      alt={`${project.title} Desktop`}
                      tilted
                    />
                  </div>
                </motion.div>

                {/* iPhone Mockup overlapping the MacBook */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="relative -mt-48 ml-auto mr-4 sm:mr-8 z-10"
                >
                  <div className="scale-[0.6] sm:scale-[0.7] origin-bottom-right">
                    <IPhoneMockup
                      image={project.mobileImage}
                      alt={`${project.title} Mobile`}
                      tilted
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Project Info */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col"
              >
                {/* Category Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/15 border-amber-500/20">
                    {project.category}
                  </Badge>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight"
                >
                  {project.title}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 text-lg text-amber-400 font-medium"
                >
                  {project.subtitle}
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="mt-4 text-neutral-400 text-sm leading-relaxed"
                >
                  {project.longDescription}
                </motion.p>

                <Separator className="my-6 bg-neutral-800" />

                {/* Business Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
                >
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
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Ubicación</p>
                      <p className="text-sm text-white font-medium">{project.location}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Tech Stack Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="flex items-center gap-2 flex-wrap mb-6"
                >
                  <Monitor className="w-4 h-4 text-neutral-500 shrink-0" />
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </motion.div>

                {/* Results Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-3 gap-3 mb-6"
                >
                  {project.results.map((result) => (
                    <div
                      key={result.metric}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center"
                    >
                      <p className="text-xl sm:text-2xl font-bold text-amber-400">{result.value}</p>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-tight">{result.metric}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="mb-8"
                >
                  <p className="text-sm font-semibold text-white mb-3">Características</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-neutral-400">
                        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {project.liveUrl && (
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold"
                      onClick={() => window.open(project.liveUrl, '_blank')}
                    >
                      Ver Demo en Vivo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  )}
                  <Button
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
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
