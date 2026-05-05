'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const milestones = [
  {
    year: '2023',
    title: 'El Inicio',
    description:
      'Nace Tienda Online Oficial con la misión de democratizar el comercio electrónico en Perú. Empezamos con 10 tiendas piloto.',
    icon: '🚀',
  },
  {
    year: '2023 Q3',
    title: 'Primeras 100 Tiendas',
    description:
      'Alcanzamos las 100 tiendas activas y lanzamos nuestro panel de administración con métricas en tiempo real.',
    icon: '🎯',
  },
  {
    year: '2024',
    title: 'Integración WhatsApp',
    description:
      'Lanzamos la integración con WhatsApp Business API, permitiendo pedidos directos desde la conversación.',
    icon: '💬',
  },
  {
    year: '2024 Q2',
    title: 'Payload CMS 3.0',
    description:
      'Migramos a Payload CMS 3.0 con editor visual inline. Los vendedores ahora pueden personalizar su tienda al instante.',
    icon: '🎨',
  },
  {
    year: '2024 Q3',
    title: 'PWA & App Móvil',
    description:
      'Lanzamos PWA instalable. Los clientes pueden instalar la tienda como una app nativa sin pasar por Play Store.',
    icon: '📱',
  },
  {
    year: '2025',
    title: 'IA & Automatización',
    description:
      'Integramos cotizador IA, chat IA para clientes y reportes inteligentes. La plataforma ahora piensa por ti.',
    icon: '🤖',
  },
  {
    year: '2025+',
    title: 'Expansión Regional',
    description:
      'Objetivo: 1,000 tiendas activas. Expandiendo a Ecuador, Colombia y Bolivia. El futuro del e-commerce latinoamericano.',
    icon: '🌍',
  },
]

function TimelineItem({
  milestone,
  index,
}: {
  milestone: (typeof milestones)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isLeft = index % 2 === 0

  return (
    <div ref={ref} className="relative flex items-center">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 w-full items-center">
        {/* Left side */}
        <div className={`${isLeft ? '' : 'order-3'}`}>
          {isLeft && isInView ? (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="ml-auto max-w-sm"
            >
              <TimelineCard milestone={milestone} />
            </motion.div>
          ) : isLeft ? (
            <div className="ml-auto max-w-sm" />
          ) : null}
          {!isLeft && isInView ? (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-sm"
            >
              <TimelineCard milestone={milestone} />
            </motion.div>
          ) : !isLeft ? (
            <div className="max-w-sm" />
          ) : null}
        </div>

        {/* Center dot and line */}
        <div className="relative flex flex-col items-center">
          {/* Dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
              delay: 0.2,
            }}
            className="relative z-10 w-5 h-5 rounded-full bg-amber-500 border-[3px] border-neutral-950 shadow-lg shadow-amber-500/30"
          >
            {/* Pulse ring */}
            <motion.div
              animate={isInView ? { scale: [1, 2, 1], opacity: [0.6, 0, 0.6] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-amber-500"
            />
          </motion.div>

          {/* Year badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full"
          >
            <span className="text-xs font-bold text-amber-400 whitespace-nowrap">{milestone.year}</span>
          </motion.div>
        </div>

        {/* Right side / Empty space */}
        <div className={`${isLeft ? 'order-3' : ''}`}>
          {isLeft ? null : !isLeft && null}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden gap-4 w-full">
        {/* Timeline dot */}
        <div className="flex flex-col items-center shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
            className="relative z-10 w-4 h-4 rounded-full bg-amber-500 border-[3px] border-neutral-950 shadow-lg shadow-amber-500/30 mt-6"
          >
            <motion.div
              animate={isInView ? { scale: [1, 2, 1], opacity: [0.6, 0, 0.6] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-amber-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="mt-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full"
          >
            <span className="text-[10px] font-bold text-amber-400 whitespace-nowrap">{milestone.year}</span>
          </motion.div>
        </div>

        {/* Card */}
        <div className="flex-1 pb-8">
          {isInView ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <TimelineCard milestone={milestone} />
            </motion.div>
          ) : (
            <TimelineCard milestone={milestone} />
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineCard({ milestone }: { milestone: (typeof milestones)[0] }) {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 hover:border-amber-500/30 transition-colors duration-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{milestone.icon}</span>
        <div>
          <h3 className="font-bold text-white text-base">{milestone.title}</h3>
          <p className="text-neutral-400 text-sm leading-relaxed mt-1.5">{milestone.description}</p>
        </div>
      </div>
    </div>
  )
}

export function PortfolioTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, { once: true, margin: '-50px' })
  const isContainerInView = useInView(containerRef, { once: true, margin: '-80px' })

  return (
    <section id="timeline" className="py-12 sm:py-16 lg:py-20 bg-neutral-950 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            Nuestra Historia
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            El Camino del Éxito
          </h2>
          <p className="mt-4 text-neutral-400 text-lg max-w-2xl mx-auto">
            Cada hito nos acerca más a nuestra misión de transformar el e-commerce en Latinoamérica.
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* Vertical line - Desktop */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px]">
            <div className="w-full h-full bg-gradient-to-b from-amber-500/50 via-amber-400/30 to-purple-500/50" />
          </div>

          {/* Vertical line - Mobile */}
          <div className="md:hidden absolute left-[7px] top-0 bottom-0 w-[2px]">
            <div className="w-full h-full bg-gradient-to-b from-amber-500/50 via-amber-400/30 to-purple-500/50" />
          </div>

          {/* Milestones */}
          <div className="space-y-10 md:space-y-12">
            {milestones.map((milestone, index) => (
              <TimelineItem key={milestone.year} milestone={milestone} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
