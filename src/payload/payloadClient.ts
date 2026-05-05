// ═══════════════════════════════════════════════════════════
// Payload CMS Client - For API calls from Next.js
// ═══════════════════════════════════════════════════════════

import { getPayloadClient } from 'payload/next'

// Re-export the Payload client getter
export const getPayload = getPayloadClient

// Helper to fetch store page data (used by storefront)
export async function getStorePage(storeSlug: string, pageType: string = 'home') {
  try {
    const payload = await getPayloadClient()
    const pages = await payload.find({
      collection: 'store-pages',
      where: {
        and: [
          { storeSlug: { equals: storeSlug } },
          { pageType: { equals: pageType } },
          { isPublished: { equals: true } },
        ],
      },
      limit: 1,
    })

    return pages.docs[0] || null
  } catch (error) {
    console.error('[Payload] Error fetching store page:', error)
    return null
  }
}

// Helper to fetch all content blocks for a store
export async function getStoreContentBlocks(storeId: string) {
  try {
    const payload = await getPayloadClient()
    const blocks = await payload.find({
      collection: 'content-blocks',
      where: {
        and: [
          { storeId: { equals: storeId } },
          { isActive: { equals: true } },
        ],
      },
      sort: 'sortOrder',
      limit: 50,
    })

    return blocks.docs
  } catch (error) {
    console.error('[Payload] Error fetching content blocks:', error)
    return []
  }
}
