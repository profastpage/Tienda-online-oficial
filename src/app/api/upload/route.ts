import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with env vars (support multiple naming conventions)
function getCloudinaryConfig() {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUD_NAME ||
    ''

  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    process.env.CLOUD_KEY ||
    ''

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_SECRET ||
    process.env.CLOUD_SECRET ||
    ''

  return { cloudName, apiKey, apiSecret }
}

function ensureCloudinaryConfigured() {
  const config = getCloudinaryConfig()

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    return false
  }

  // Only configure once
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    })
  }

  return true
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    // Validate Cloudinary configuration
    if (!ensureCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            'Cloudinary no está configurado. Verifica las variables de entorno.',
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'products'
    const storeSlug = (formData.get('storeSlug') as string) || 'store'

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró ningún archivo.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!VALID_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Tipo de archivo inválido. Usa JPG, PNG, WebP o GIF.',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Archivo muy grande. Máximo 5MB (tu archivo: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        },
        { status: 400 }
      )
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Build Cloudinary folder path
    const cloudFolder = `${folder}/${storeSlug}`.replace(/\/+/g, '/')

    // Upload to Cloudinary using the upload API
    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: cloudFolder,
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto',
            transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error || !result) {
              console.error('Cloudinary upload error:', error)
              resolve(
                NextResponse.json(
                  {
                    error: 'Error al subir la imagen a Cloudinary.',
                  },
                  { status: 500 }
                )
              )
              return
            }

            const sizeKB = Math.round(
              (result.bytes || buffer.length) / 1024
            )
            const format =
              result.format || file.type.split('/')[1] || 'auto'

            resolve(
              NextResponse.json({
                url: result.secure_url,
                sizeKB,
                format,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
              })
            )
          }
        )
        .end(buffer)
    })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor al subir la imagen.' },
      { status: 500 }
    )
  }
}
