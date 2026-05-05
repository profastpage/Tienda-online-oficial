'use client'

import { useState, useRef, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// InlineEditableText
// Click any text in the preview to edit it inline.
// Shows pencil icon on hover, becomes contentEditable on click.
// ═══════════════════════════════════════════════════════════

interface InlineEditableTextProps {
  value: string
  onUpdate: (value: string) => void
  className?: string
  tag?: string
  placeholder?: string
  multiline?: boolean
  /** Stop click propagation so it doesn't select parent block */
  stopPropagation?: boolean
  /** Additional styles for the text element */
  style?: React.CSSProperties
}

export function InlineEditableText({
  value,
  onUpdate,
  className = '',
  tag = 'span',
  placeholder = 'Escribe aqui...',
  multiline = false,
  stopPropagation = true,
  style,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const editRef = useRef<HTMLElement>(null)

  const startEditing = useCallback(() => {
    setIsEditing(true)
    // Focus and select after React renders contentEditable
    requestAnimationFrame(() => {
      if (editRef.current) {
        editRef.current.focus()
        const range = document.createRange()
        range.selectNodeContents(editRef.current)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    })
  }, [])

  const finishEditing = useCallback(() => {
    if (editRef.current) {
      const newValue = editRef.current.innerText || ''
      setIsEditing(false)
      if (newValue !== value) {
        onUpdate(newValue)
      }
    } else {
      setIsEditing(false)
    }
  }, [value, onUpdate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault()
        editRef.current?.blur()
      }
      if (e.key === 'Escape') {
        setIsEditing(false)
      }
    },
    [multiline]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation()
      if (!isEditing) {
        startEditing()
      }
    },
    [isEditing, startEditing, stopPropagation]
  )

  const displayValue = value || ''
  const isEmpty = !displayValue.trim()

  const Tag = tag as 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'

  if (isEditing) {
    return (
      <Tag
        ref={editRef as any}
        contentEditable
        suppressContentEditableWarning
        onBlur={finishEditing}
        onKeyDown={handleKeyDown}
        className={`${className} outline-none ring-2 ring-blue-500/50 rounded-sm bg-blue-50/30 cursor-text`}
        style={{ minWidth: 40, ...style }}
        dangerouslySetInnerHTML={{ __html: displayValue || '' }}
      />
    )
  }

  return (
    <span
      className="relative inline group/iedit"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Tag
        onClick={handleClick}
        className={`${className} cursor-text transition-shadow rounded-sm ${
          isHovering ? 'shadow-[inset_0_0_0_1.5px_rgba(37,99,235,0.4)]' : ''
        } ${isEmpty ? 'text-neutral-400' : ''}`}
        style={style}
      >
        {displayValue || (isHovering ? placeholder : null)}
      </Tag>
      <AnimatePresence>
        {isHovering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center pointer-events-none"
          >
            <Pencil className="w-2.5 h-2.5 text-white" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
