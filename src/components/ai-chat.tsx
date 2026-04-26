'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Trash2, Minus, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ═══════════════════════════════════════════════════════════════════
// ATLAS AI CHAT — Persistent, Fullscreen Mobile, Local API
// ═══════════════════════════════════════════════════════════════════

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const STORAGE_KEY = 'atlas-chat-messages'
const MAX_MESSAGES = 50
const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: '¡Hola! 👋 Soy **Atlas**, tu asistente de estilo en Urban Style.\n\nPuedo ayudarte con:\n• Buscar productos y comparar precios\n• Recomendar tallas y outfits\n• Información sobre envíos y pagos\n• Cualquier consulta sobre la tienda\n\n¿En qué te puedo ayudar?',
  timestamp: Date.now(),
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Message[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-MAX_MESSAGES)
    }
  } catch {}
  return [WELCOME_MESSAGE]
}

function saveMessages(messages: Message[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)))
  } catch {}
}

// Simple markdown-lite renderer: **bold**, [links](url), line breaks
function renderContent(text: string) {
  const parts: React.ReactNode[] = []
  // Split by markdown patterns
  const regex = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index)
      before.split('\n').forEach((line, i) => {
        if (i > 0) parts.push(<br key={`${key}-br`} />)
        parts.push(<span key={`${key}-t`}>{line}</span>)
        key++
      })
    }

    if (match[2]) {
      // Bold: **text**
      parts.push(<strong key={`${key}-b`}>{match[2]}</strong>)
    } else if (match[3] && match[4]) {
      // Link: [text](url)
      parts.push(
        <a
          key={`${key}-a`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-purple-400 transition-colors"
        >
          {match[3]}
        </a>
      )
    }
    key++
    lastIndex = regex.lastIndex
  }

  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex)
    remaining.split('\n').forEach((line, i) => {
      if (i > 0) parts.push(<br key={`${key}-br`} />)
      parts.push(<span key={`${key}-t`}>{line}</span>)
      key++
    })
  }

  return parts
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

// ── Typing indicator with text ──────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2"
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 flex flex-col gap-1">
        <span className="text-[11px] text-muted-foreground font-medium">Atlas está escribiendo...</span>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────
interface AiChatProps {
  onClose?: () => void
}

export default function AiChat({ onClose }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Load messages from localStorage on mount ──
  useEffect(() => {
    setMessages(loadMessages())
  }, [])

  // ── Save to localStorage whenever messages change ──
  useEffect(() => {
    if (messages.length > 0) saveMessages(messages)
  }, [messages])

  // ── Auto-scroll on new messages ──
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isMinimized])

  // ── Focus input when opened/un-minimized ──
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [isOpen, isMinimized])

  // ── Detect if user scrolled up (show scroll-to-bottom button) ──
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setShowScrollBtn(!isNearBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ── Send message to local /api/chat ──
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setInput('')
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Build chat history for API (exclude timestamps)
      const chatHistory = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }))

      // Use LOCAL /api/chat — has product context + z-ai-web-dev-sdk
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.content || 'Lo siento, no pude procesar tu consulta.',
        timestamp: Date.now(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Verifica tu internet e intenta de nuevo. Si el problema persiste, escríbenos por WhatsApp.',
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  // ── Keyboard handler: Enter to send, Shift+Enter for newline ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // ── Auto-resize textarea ──
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [])

  // ── Clear chat ──
  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE])
    saveMessages([WELCOME_MESSAGE])
  }, [])

  // ── Close handlers ──
  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const handleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className={`
            fixed z-[60] bg-background flex flex-col overflow-hidden
            shadow-2xl border border-border
            /* Mobile: fullscreen */
            inset-0 rounded-none
            /* Desktop: floating bottom-right */
            md:inset-auto
            md:bottom-[120px] md:right-5
            md:w-[380px] md:h-[520px]
            md:rounded-2xl
            md:max-h-[70vh]
          `}
        >
          {/* ═══ HEADER ═══ */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white p-3.5 flex items-center gap-3 shrink-0 shadow-sm">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 ring-2 ring-purple-600" />
            </div>

            {/* Title + Status */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm tracking-tight">Atlas AI</h3>
              <div className="flex items-center gap-1.5">
                {isLoading ? (
                  <span className="text-[11px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Escribiendo...
                  </span>
                ) : (
                  <span className="text-[11px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    En linea
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5">
              {/* Clear chat (desktop) */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 hidden md:flex"
                onClick={clearChat}
                title="Limpiar chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              {/* Minimize (desktop) */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 hidden md:flex"
                onClick={handleMinimize}
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={handleClose}
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ═══ MESSAGES AREA ═══ */}
          {!isMinimized && (
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-4 relative"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={`${i}-${msg.timestamp}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar (AI only) */}
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-auto">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[82%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm shadow-sm'
                          : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {renderContent(msg.content)}
                    </div>
                    <span className={`text-[10px] text-muted-foreground/60 mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── Scroll to bottom button ── */}
          {!isMinimized && showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={scrollToBottom}
              className="absolute bottom-20 md:bottom-20 right-4 md:right-6 z-10 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </motion.button>
          )}

          {/* ═══ INPUT AREA ═══ */}
          {!isMinimized && (
            <div className="p-3 border-t border-border shrink-0 bg-background">
              <div className="flex items-end gap-2">
                {/* Clear button (mobile only) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-500 shrink-0 md:hidden"
                  onClick={clearChat}
                  title="Limpiar chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {/* Textarea input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    placeholder="Escribe tu mensaje..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50 max-h-[120px]"
                    style={{ minHeight: '40px' }}
                  />
                </div>

                {/* Send button */}
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 shrink-0 disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5 hidden md:block">
                Atlas puede cometer errores. Verifica información importante.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
