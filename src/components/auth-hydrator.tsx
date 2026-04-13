'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hydrates the auth store from localStorage once at the root level.
 * This avoids every page/hydration needing to read from localStorage independently.
 */
export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      hydrate()
    }
  }, [hydrate])

  return null // renders nothing
}
