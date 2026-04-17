'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'

const Storefront = dynamic(() => import('@/components/storefront'), { ssr: false })

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  return <Storefront storeSlug={slug} />
}
