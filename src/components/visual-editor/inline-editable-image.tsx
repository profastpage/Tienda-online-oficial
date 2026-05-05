'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// InlineEditableImage
// Click on any image in the preview to upload a new one.
// Shows camera overlay on hover, opens file picker on click.
// Converts to base64 for inline storage.
// ═══════════════════════════════════════════════════════════

interface InlineEditableImageProps {
  src: string | null | undefined
  alt?: string
  className?: string
  onUpdate: (fileData: { url: string; name: string }) => void
  onRemove?: () => void
  /** Stop click propagation so it doesn't select parent block */
  stopPropagation?: boolean
  /** Additional styles for the image element */
  imgStyle?: React.CSSProperties
  /** Full height for background images (no aspect ratio constraint) */
  fillMode?: boolean
}

export function InlineEditableImage({
  src,
  alt = '',
  className = '',
  onUpdate,
  onRemove,
  stopPropagation = true,
  imgStyle,
  fillMode = false,
}: InlineEditableImageProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return

      setIsUploading(true)
      setUploadProgress(0)

      const reader = new FileReader()
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      reader.onload = () => {
        // Simulate brief processing delay for UX
        setTimeout(() => {
          setUploadProgress(100)
          setTimeout(() => {
            onUpdate({
              url: reader.result as string,
              name: file.name,
            })
            setIsUploading(false)
            setUploadProgress(0)
          }, 200)
        }, 150)
      }
      reader.onerror = () => {
        setIsUploading(false)
        setUploadProgress(0)
      }
      reader.readAsDataURL(file)
    },
    [onUpdate]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation()
      if (!isUploading) {
        fileInputRef.current?.click()
      }
    },
    [isUploading, stopPropagation]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onRemove?.()
    },
    [onRemove]
  )

  const imageUrl = src ? (typeof src === 'object' && 'url' in src ? (src as { url: string }).url : String(src)) : null

  return (
    <span
      className={`relative inline-block ${fillMode ? '' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Image or placeholder */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={`${className} ${isHovering || isDragOver ? 'opacity-70' : ''} transition-opacity`}
          style={imgStyle}
          draggable={false}
        />
      ) : (
        <div
          className={`${className} bg-neutral-200 flex items-center justify-center`}
          style={{ minWidth: 100, minHeight: 100, ...imgStyle }}
        >
          <Camera className="w-8 h-8 text-neutral-400" />
        </div>
      )}

      {/* Hover overlay */}
      <AnimatePresence>
        {(isHovering || isDragOver) && !isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragOver
                ? 'bg-blue-500/80 border-2 border-dashed border-white'
                : 'bg-black/50'
            }`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver ? (
              <>
                <Upload className="w-6 h-6 text-white animate-bounce" />
                <span className="text-white text-xs font-medium">Soltar imagen</span>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6 text-white" />
                <span className="text-white text-xs font-medium">Cambiar imagen</span>
              </>
            )}
            {onRemove && imageUrl && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress indicator */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60"
          >
            <Loader2 className="w-6 h-6 text-white animate-spin" />
            <div className="w-24 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-white text-[10px]">{uploadProgress}%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
