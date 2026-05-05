// ═══════════════════════════════════════════════════════════
// Payload Auth Bridge
// Syncs existing auth system with Payload CMS authentication
// Creates/updates Payload user when existing user logs in
// ═══════════════════════════════════════════════════════════

import { getPayloadHMR } from '@payloadcms/next/utilities'

/**
 * Sync an existing store user to Payload CMS.
 * Call this after login or when accessing the visual editor.
 */
export async function syncUserToPayload(existingUser: {
  id: string
  email: string
  name: string
  role: string
  storeId: string
  storeName?: string
  storeSlug?: string
}): Promise<{ payloadUser: any; payloadToken: string } | null> {
  try {
    const payload = await getPayloadHMR({ configPath: 'payload.config.ts' })

    // Check if user already exists in Payload
    const existing = await payload.find({
      collection: 'store-users',
      where: {
        email: { equals: existingUser.email },
      },
      limit: 1,
    })

    let payloadUser = existing.docs[0]

    if (payloadUser) {
      // Update existing user data
      payloadUser = await payload.update({
        collection: 'store-users',
        id: payloadUser.id,
        data: {
          name: existingUser.name,
          storeId: existingUser.storeId,
          storeName: existingUser.storeName || '',
          role: existingUser.role,
        },
      })
    } else {
      // Create new Payload user with a random password (they auth via our system)
      const randomPassword = `sync-${Date.now()}-${Math.random().toString(36)}`
      payloadUser = await payload.create({
        collection: 'store-users',
        data: {
          email: existingUser.email,
          password: randomPassword,
          name: existingUser.name,
          storeId: existingUser.storeId,
          storeName: existingUser.storeName || '',
          role: existingUser.role,
        },
      })
    }

    // Login to get a Payload JWT token
    const loginResult = await payload.login({
      collection: 'store-users',
      data: {
        email: existingUser.email,
        password: existingUser.password || `sync-${existingUser.id}`,
      },
    })

    // If default password login fails, use the Payload API directly
    if (!loginResult.token) {
      // Fallback: use local API to login (bypass password check)
      const result = await payload.localAPI({
        url: `/api/store-users/${payloadUser.id}`,
      })
      // Generate token using Payload's internal method
      // For now, use a custom approach
    }

    return {
      payloadUser,
      payloadToken: loginResult.token || '',
    }
  } catch (error) {
    console.error('[Payload Auth Bridge] Error:', error)
    return null
  }
}

/**
 * API route helper: Sync user and return Payload token
 * Used by /api/payload/auth route
 */
export async function getPayloadAuthForUser(existingUser: {
  id: string
  email: string
  name: string
  role: string
  storeId: string
  storeName?: string
  storeSlug?: string
}) {
  try {
    const payload = await getPayloadHMR({ configPath: 'payload.config.ts' })

    // Use localAPI to bypass auth (server-side only)
    const existing = await payload.localAPI({
      url: '/api/store-users',
      where: {
        email: { equals: existingUser.email },
      },
      limit: 1,
    })

    let userId = existing.docs?.[0]?.id

    if (!userId) {
      const randomPassword = `sync-${Date.now()}-${Math.random().toString(36)}`
      const created = await payload.localAPI({
        url: '/api/store-users',
        method: 'POST',
        data: {
          email: existingUser.email,
          password: randomPassword,
          name: existingUser.name,
          storeId: existingUser.storeId,
          storeName: existingUser.storeName || '',
          role: existingUser.role,
        },
      })
      userId = created.id
    }

    return { payloadUserId: userId }
  } catch (error) {
    console.error('[Payload Auth Bridge] Error:', error)
    return null
  }
}
