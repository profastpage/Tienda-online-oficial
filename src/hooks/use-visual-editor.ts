'use client'

import { useEffect, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════
// useVisualEditor Hook
// Listens for postMessage updates from the visual editor iframe
// and provides block data to the storefront preview
// ═══════════════════════════════════════════════════════════

interface EditorBlock {
  id: string
  blockType: string
  sortIndex: number
  isActive: boolean
  data: Record<string, any>
}

interface VisualEditorState {
  isEditing: boolean
  blocks: EditorBlock[]
  storeSlug: string
}

export function useVisualEditor() {
  const [state, setState] = useState<VisualEditorState>({
    isEditing: false,
    blocks: [],
    storeSlug: '',
  })

  useEffect(() => {
    // Check if we're in visual editor mode
    const isEditing = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('visual-editor') === 'true'
    setState(prev => ({ ...prev, isEditing }))

    function handleMessage(event: MessageEvent) {
      // Only accept messages from our editor
      if (event.data?.type !== 'PAYLOAD_UPDATE') return

      const { blocks, storeSlug } = event.data
      if (blocks && Array.isArray(blocks)) {
        setState({
          isEditing: true,
          blocks: blocks.map((block: any) => ({
            id: block.id || `block-${block.sortIndex}`,
            blockType: block.blockType || block.data?.blockType || 'text-block',
            sortIndex: block.sortIndex || 0,
            isActive: block.isActive !== false,
            data: block.data || block,
          })),
          storeSlug: storeSlug || '',
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const sendBlockClick = useCallback((blockId: string) => {
    if (state.isEditing) {
      window.parent.postMessage({ type: 'BLOCK_SELECT', blockId }, '*')
    }
  }, [state.isEditing])

  return {
    isEditing: state.isEditing,
    blocks: state.blocks,
    storeSlug: state.storeSlug,
    sendBlockClick,
  }
}
