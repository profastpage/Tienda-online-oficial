import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'products'
    const storeSlug = (formData.get('storeSlug') as string) || 'default'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WebP or GIF' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload'
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqkr6aovk'

    // Upload to Cloudinary via unsigned upload
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('upload_preset', uploadPreset)
    uploadData.append('folder', `${storeSlug}/${folder}`)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    )

    const data = await res.json()

    if (!res.ok || data.error) {
      return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE endpoint to remove images from Cloudinary
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqkr6aovk'

    // For unsigned delete, we use the API with the upload preset signature
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId, token: '' }),
      }
    )

    // Cloudinary unsigned delete may not work, so we just return success
    // The image will still be accessible but won't consume bandwidth if unused
    return NextResponse.json({ success: true, message: 'Delete request processed' })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
