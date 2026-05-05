'use client'

import { motion } from 'framer-motion'

interface DeviceMockupProps {
  image: string
  alt: string
  className?: string
  tilted?: boolean
}

export function IPhoneMockup({ image, alt, className = '', tilted = false }: DeviceMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative"
        style={{
          perspective: '1000px',
        }}
        whileHover={
          tilted
            ? {
                rotateY: -5,
                rotateX: 3,
                scale: 1.02,
              }
            : { scale: 1.02 }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* iPhone Frame */}
        <div
          className="relative mx-auto bg-neutral-800 rounded-[3rem] p-[10px] shadow-2xl shadow-black/50"
          style={{ width: '280px', height: '570px' }}
        >
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
            {/* Notch / Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[120px] h-[35px] bg-black rounded-b-[1.2rem]" />

            {/* Screen */}
            <div className="relative w-full h-full overflow-hidden rounded-[2.5rem]">
              {/* Placeholder gradient or actual image */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-neutral-400 text-xs">{alt}</p>
                  </div>
                </div>
              </div>
              {/* Actual image overlay (when available) */}
              <img
                src={image}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
                loading="lazy"
              />
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-neutral-600 rounded-full z-20" />
          </div>

          {/* Side buttons (right) */}
          <div className="absolute -right-[2px] top-[120px] w-[3px] h-[40px] bg-neutral-700 rounded-r-sm" />
          <div className="absolute -right-[2px] top-[180px] w-[3px] h-[60px] bg-neutral-700 rounded-r-sm" />
          <div className="absolute -right-[2px] top-[250px] w-[3px] h-[60px] bg-neutral-700 rounded-r-sm" />

          {/* Side button (left) */}
          <div className="absolute -left-[2px] top-[160px] w-[3px] h-[30px] bg-neutral-700 rounded-l-sm" />
          <div className="absolute -left-[2px] top-[200px] w-[3px] h-[50px] bg-neutral-700 rounded-l-sm" />
        </div>

        {/* Reflection/shadow */}
        <div className="absolute -inset-4 bg-gradient-to-t from-transparent via-white/5 to-transparent rounded-[4rem] pointer-events-none" />
      </motion.div>
    </div>
  )
}

export function MacBookMockup({ image, alt, className = '', tilted = false }: DeviceMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative"
        style={{
          perspective: '1000px',
        }}
        whileHover={
          tilted
            ? {
                rotateY: 3,
                rotateX: -2,
                scale: 1.01,
              }
            : { scale: 1.01 }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Screen part */}
        <div
          className="relative mx-auto bg-neutral-800 rounded-t-[1rem] overflow-hidden"
          style={{
            width: '700px',
          }}
        >
          {/* Top bezel with camera */}
          <div className="relative bg-neutral-800 pt-[10px] pb-[6px] px-[10px]">
            {/* Camera dot */}
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-neutral-600 rounded-full" />
          </div>

          {/* Screen area */}
          <div className="mx-[10px] bg-black rounded-[4px] overflow-hidden" style={{ aspectRatio: '16/10' }}>
            {/* Placeholder gradient */}
            <div className="absolute inset-[10px] bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 rounded-[4px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">✓</span>
                  </div>
                  <p className="text-neutral-400 text-sm font-medium">{alt}</p>
                </div>
              </div>
            </div>
            {/* Actual image */}
            <img
              src={image}
              alt={alt}
              className="relative w-full h-full object-cover rounded-[4px]"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
              loading="lazy"
            />
          </div>

          {/* Bottom bezel */}
          <div className="bg-neutral-800 h-[10px]" />
        </div>

        {/* Hinge / gap */}
        <div className="h-[3px] bg-neutral-700 mx-auto" style={{ width: '700px' }} />

        {/* Base / Keyboard area */}
        <div
          className="mx-auto bg-gradient-to-b from-neutral-700 via-neutral-600 to-neutral-500 rounded-b-[0.75rem]"
          style={{ width: '700px', height: '16px' }}
        >
          {/* Trackpad notch */}
          <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-neutral-400/30 rounded-full" />
        </div>

        {/* Screen reflection */}
        <div
          className="absolute top-[16px] left-[16px] pointer-events-none rounded-t-[1rem] overflow-hidden"
          style={{ width: '700px' }}
        >
          <div
            className="bg-gradient-to-br from-white/10 via-transparent to-transparent"
            style={{ height: '80px' }}
          />
        </div>
      </motion.div>
    </div>
  )
}
