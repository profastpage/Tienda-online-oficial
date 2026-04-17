'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { ShoppingBag, Edit3, Eye, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { motion, AnimatePresence } from 'framer-motion'

const Storefront = dynamic(() => import('@/components/storefront'), { ssr: false })
const StoreEditor = dynamic(() => import('@/components/store-editor'), { ssr: false })

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [mounted, setMounted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [checkingOwner, setCheckingOwner] = useState(true)
  const user = useAuthStore((s) => s.user)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current user owns this store
  useEffect(() => {
    if (!mounted || !user) {
      setIsOwner(false)
      setCheckingOwner(false)
      return
    }

    async function checkOwnership() {
      try {
        const res = await fetch(`/api/store/info?slug=${slug}`)
        if (res.ok) {
          const storeData = await res.json()
          setIsOwner(storeData.id === user.storeId)
        } else {
          setIsOwner(false)
        }
      } catch {
        setIsOwner(false)
      } finally {
        setCheckingOwner(false)
      }
    }
    checkOwnership()
  }, [mounted, user, slug])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center animate-pulse">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="w-8 h-0.5 bg-neutral-200 animate-pulse rounded-full" style={{ width: '120px' }} />
        </div>
      </div>
    )
  }

  // Show editor mode for store owner
  if (editMode && isOwner) {
    return (
      <StoreEditor
        storeSlug={slug}
        onExit={() => setEditMode(false)}
      />
    )
  }

  return (
    <div className="relative">
      {/* Storefront - always visible */}
      <Storefront storeSlug={slug} />

      {/* Edit Mode Toggle - only for store owner */}
      <AnimatePresence>
        {isOwner && !checkingOwner && !editMode && (
          <>
            {/* Floating Edit Button */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Button
                onClick={() => setEditMode(true)}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 group"
                size="icon"
              >
                <Edit3 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </Button>
              <p className="text-center text-[10px] font-medium text-neutral-500 mt-1.5">Editar Tienda</p>
            </motion.div>

            {/* Owner Banner */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="fixed top-0 left-0 right-0 z-50"
            >
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center py-1.5 px-4 text-xs font-medium">
                <div className="flex items-center justify-center gap-2">
                  <span>Eres el propietario de esta tienda</span>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
