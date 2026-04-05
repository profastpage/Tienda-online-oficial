'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  storeSlug?: string
  className?: string
  maxSizeMB?: number
}

export function ImageUpload({
  value,
  onChange,
  folder = 'products',
  storeSlug = 'store',
  className = '',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxBytes = maxSizeMB * 1024 * 1024
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!validTypes.includes(file.type)) {
        setError('Tipo de archivo inválido. Usa JPG, PNG, WebP o GIF')
        return
      }

      if (file.size > maxBytes) {
        setError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
        return
      }

      setUploading(true)
      setProgress(10)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('storeSlug', storeSlug)

        setProgress(30)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        setProgress(80)

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Error al subir la imagen')
          return
        }

        setProgress(100)
        onChange(data.url)

        // Brief delay to show 100% before hiding progress
        setTimeout(() => {
          setUploading(false)
          setProgress(0)
        }, 400)
      } catch {
        setError('Error de conexión al subir la imagen')
        setUploading(false)
        setProgress(0)
      }
    },
    [folder, storeSlug, maxBytes, maxSizeMB, onChange]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) {
        uploadFile(file)
      }
    },
    [uploadFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Show image preview if uploaded */}
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
          <div className="aspect-video w-full">
            <img
              src={value}
              alt="Producto"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg text-xs gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              Cambiar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleRemove}
            >
              <X className="w-3.5 h-3.5" />
              Quitar
            </Button>
          </div>
          {/* Remove button (always visible on mobile) */}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 text-neutral-500 hover:text-red-600 hover:bg-white shadow-sm sm:hidden"
            onClick={handleRemove}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        /* Upload dropzone */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center gap-3
            rounded-lg border-2 border-dashed cursor-pointer transition-all
            aspect-video w-full
            ${
              dragging
                ? 'border-neutral-900 bg-neutral-50'
                : 'border-neutral-300 bg-neutral-50/50 hover:border-neutral-400 hover:bg-neutral-50'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <>
              <div className="relative">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Subiendo imagen...
                </p>
                {progress > 0 && (
                  <div className="mt-2 w-48 mx-auto">
                    <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100">
                <ImageIcon className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-neutral-700">
                  <span className="text-neutral-900">Haz clic para subir</span>{' '}
                  o arrastra una imagen
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  JPG, PNG, WebP o GIF (máx. {maxSizeMB}MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <X className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
