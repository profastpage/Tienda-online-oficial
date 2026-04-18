import { v2 as cloudinary } from 'cloudinary'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

cloudinary.config({
  cloud_name: CLOUD_NAME || '',
  api_key: API_KEY || '',
  api_secret: API_SECRET || '',
})

/**
 * Validate Cloudinary configuration is complete.
 * Logs warnings when credentials are missing (does not crash).
 */
export function isConfigured(): boolean {
  const configured = Boolean(CLOUD_NAME && API_KEY && API_SECRET)
  if (!configured) {
    const missing: string[] = []
    if (!CLOUD_NAME) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
    if (!API_KEY) missing.push('CLOUDINARY_API_KEY')
    if (!API_SECRET) missing.push('CLOUDINARY_API_SECRET')
    console.warn(`[Cloudinary] Configuración incompleta. Faltan: ${missing.join(', ')}`)
  }
  return configured
}

export default cloudinary

/**
 * Get an optimized Cloudinary URL with transformations
 * Works with both public IDs and full Cloudinary URLs
 */
export function getCloudinaryUrl(
  source: string,
  options?: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
    crop?: string
  }
): string {
  if (!source) return ''

  // Extract public ID from full Cloudinary URL if needed
  let publicId = source
  if (source.startsWith('http')) {
    // Check if it's a Cloudinary URL
    if (source.includes(`res.cloudinary.com/${CLOUD_NAME}`)) {
      // Extract the public_id from: https://res.cloudinary.com/{cloud}/image/upload/{transforms/}{public_id}.{format}
      const url = new URL(source)
      const pathParts = url.pathname.split('/')
      // Find 'upload' index and take everything after
      const uploadIdx = pathParts.indexOf('upload')
      if (uploadIdx >= 0) {
        publicId = pathParts.slice(uploadIdx + 1).join('/')
        // Remove file extension for transformation
        const lastDot = publicId.lastIndexOf('.')
        if (lastDot > 0) {
          publicId = publicId.substring(0, lastDot)
        }
      }
    } else {
      // Not a Cloudinary URL, return as-is
      return source
    }
  }

  // Build transformations
  const transforms: string[] = []

  if (options?.width && options?.height) {
    transforms.push(`w_${options.width},h_${options.height},c_${options.crop || 'fill'}`)
  } else if (options?.width) {
    transforms.push(`w_${options.width},c_${options.crop || 'limit'}`)
  } else if (options?.height) {
    transforms.push(`h_${options.height},c_${options.crop || 'limit'}`)
  }

  if (options?.quality) {
    transforms.push(`q_${options.quality}`)
  } else {
    transforms.push('q_auto') // Auto quality optimization (saves bandwidth!)
  }

  if (options?.format) {
    transforms.push(`f_${options.format}`)
  } else {
    transforms.push('f_auto') // Auto format (WebP/AVIF when supported)
  }

  const transformStr = transforms.join(',')

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`
}

/**
 * Pre-configured image size helpers for common use cases
 */
export const img = {
  /** Thumbnail: 150x150 */
  thumb: (source: string) =>
    getCloudinaryUrl(source, { width: 150, height: 150, crop: 'thumb' }),

  /** Small: 400x400 (product cards on mobile) */
  small: (source: string) =>
    getCloudinaryUrl(source, { width: 400, height: 400, crop: 'fill' }),

  /** Medium: 600x600 (product cards on desktop) */
  medium: (source: string) =>
    getCloudinaryUrl(source, { width: 600, height: 600, crop: 'fill' }),

  /** Large: 800x800 (product detail view) */
  large: (source: string) =>
    getCloudinaryUrl(source, { width: 800, height: 800, crop: 'fill' }),

  /** Hero banner: 1200x600 */
  hero: (source: string) =>
    getCloudinaryUrl(source, { width: 1200, height: 600, crop: 'fill' }),

  /** Optimized original (auto quality + format, no resize) */
  optimized: (source: string) =>
    getCloudinaryUrl(source, {}),
}
