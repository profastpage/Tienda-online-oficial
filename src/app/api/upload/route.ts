import { NextResponse } from 'next/server'
import cloudinary, { isConfigured } from '@/lib/cloudinary'
import { extractToken, verifyToken } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (images + short videos)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

export async function POST(request: Request) {
  try {
    // Cloudinary config validation
    if (!isConfigured()) {
      return NextResponse.json(
        { error: 'Cloudinary no está configurado. Agrega NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en las variables de entorno.' },
        { status: 500 }
      )
    }

    // Auth check
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'products'
    const storeSlug = (formData.get('storeSlug') as string) || 'store'

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    // Validate file type
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo inválido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Archivo muy grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Build the Cloudinary public ID with folder structure
    const publicId = `${storeSlug}/${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const resourceType = isVideo ? 'video' : 'image'

    // Upload to Cloudinary with optimization
    const uploadOptions: Record<string, unknown> = {
      public_id: publicId,
      folder: `${storeSlug}/${folder}`,
      resource_type: resourceType,
      // Strip metadata for privacy and smaller file size
      strip_exif: true,
    }

    if (!isVideo) {
      // Image optimization
      uploadOptions.transformation = [{
        quality: 'auto:good',
        fetch_format: 'auto',
        dpr: 'auto',
      }]
      uploadOptions.eager = [
        { width: 400, height: 400, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' },
        { width: 800, height: 800, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' },
        { width: 1200, height: 630, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' },
      ]
      uploadOptions.eager_async = true
      uploadOptions.max_file_size = 2000000
    } else {
      // Video optimization
      uploadOptions.transformation = [{ quality: 'auto:good' }]
      uploadOptions.eager = [
        { width: 640, crop: 'limit', quality: 'auto:good', video_codec: 'auto' },
        { width: 1280, crop: 'limit', quality: 'auto:good', video_codec: 'auto' },
      ]
      uploadOptions.eager_async = true
    }

    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString('base64')}`,
      uploadOptions
    )

    const sizeKB = Math.round(file.size / 1024)
    const format = result.format || file.type.split('/')[1] || (isVideo ? 'mp4' : 'auto')

    return NextResponse.json({
      url: result.secure_url,
      sizeKB,
      format,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      resourceType: isVideo ? 'video' : 'image',
      duration: isVideo ? result.duration : undefined,
    })
  } catch (error) {
    const cloudinaryError = error instanceof Error ? error.message : String(error)
    console.error('[Upload] Error:', cloudinaryError, error)
    return NextResponse.json(
      { error: 'Error al subir la imagen', details: cloudinaryError },
      { status: 500 }
    )
  }
}
