'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Atlas endpoint (Cloudflare Pages) — change this to your Atlas domain
const ATLAS_API_URL = process.env.NEXT_PUBLIC_ATLAS_URL || 'https://profastpage-atlas.pages.dev'

interface AiChatProps {
  onClose?: () => void
}

export default function AiChat({ onClose }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '¡Hola! 👋 Soy Atlas, tu consultor de estilo en Urban Style. Pregúntame sobre outfits, tendencias o productos.'
      }])
    }
  }, [isOpen, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const chatHistory = [...messages, { role: 'user', content: userMessage }].map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Send to Atlas on Cloudflare Pages
      const res = await fetch(`${ATLAS_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      })

      const data = await res.json()

      if (data.content || data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content || data.message }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Lo siento, tuve un problema. Intenta de nuevo.'
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Verifica tu internet e intenta de nuevo.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-[120px] right-5 z-[56] w-[calc(100vw-2rem)] sm:w-[360px] h-[480px] max-h-[60vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Atlas — Estilo</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80">En línea</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 h-10 text-sm rounded-full px-4"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
