'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Loader2,
  BarChart3,
  Package,
  ShoppingCart,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  action?: string
  timestamp: Date
  isAnalysis?: boolean
}

interface QuickAction {
  id: string
  action: string
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'inventory',
    action: 'inventory_analysis',
    label: 'Analizar inventario',
    icon: Package,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
  },
  {
    id: 'orders',
    action: 'order_insights',
    label: 'Insights de pedidos',
    icon: ShoppingCart,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
  },
  {
    id: 'restock',
    action: 'restock_suggestions',
    label: 'Sugerencias de reabastecimiento',
    icon: BarChart3,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function formatMessageContent(content: string): string {
  // Simple markdown-like formatting: bold, lists, etc.
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold text-neutral-900 mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-bold text-neutral-900 mt-4 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold text-neutral-900 mt-4 mb-2">$1</h1>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'inventory_analysis': return 'Análisis de Inventario'
    case 'order_insights': return 'Insights de Pedidos'
    case 'restock_suggestions': return 'Sugerencias de Reabastecimiento'
    default: return 'Chat'
  }
}

function getActionIcon(action: string): React.ElementType {
  switch (action) {
    case 'inventory_analysis': return Package
    case 'order_insights': return ShoppingCart
    case 'restock_suggestions': return BarChart3
    default: return Bot
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminAi() {
  const user = useAuthStore((s) => s.user)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planError, setPlanError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (action: string, message?: string) => {
    if (isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message || `Realiza un ${getActionLabel(action).toLowerCase()} de mi tienda`,
      action,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    setPlanError(false)

    try {
      const body: { action: string; context?: Record<string, unknown> } = { action }
      if (action === 'chat' && message) {
        body.context = { message }
      }

      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...useAuthStore.getState().getAuthHeaders(),
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.code === 'PLAN_UPGRADE_REQUIRED') {
          setPlanError(true)
          const errorMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: data.error,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } else {
          setError(data.error || 'Error al procesar la solicitud')
          const errorMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: `⚠️ ${data.error || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
        return
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.data,
        action: data.action,
        timestamp: new Date(),
        isAnalysis: action !== 'chat',
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setError('Error de conexión. Verifica tu conexión a internet.')
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ Error de conexión. No se pudo contactar al servidor. Por favor, verifica tu conexión a internet e intenta de nuevo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputValue('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage('chat', inputValue.trim())
  }

  const handleQuickAction = (action: string) => {
    if (isLoading) return
    sendMessage(action)
  }

  const handleClearChat = () => {
    setMessages([])
    setError(null)
    setPlanError(false)
    inputRef.current?.focus()
  }

  const handleRetry = () => {
    setError(null)
    // Retry the last user message if exists
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1)) // Remove last assistant/error message
      sendMessage(lastUserMsg.action || 'chat', lastUserMsg.action === 'chat' ? lastUserMsg.content : undefined)
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Asistente IA</h2>
            <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Premium
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 ml-12">
            Analiza tu inventario, pedidos y recibe recomendaciones inteligentes
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            className="rounded-xl border-neutral-200 text-neutral-500 hover:bg-neutral-50 text-xs font-medium h-8 px-3 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Limpiar chat
          </Button>
        )}
      </div>

      {/* ─── Plan Upgrade Warning ────────────────────────────────────────────── */}
      {planError && (
        <Card className="rounded-xl border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Función exclusiva Premium</p>
                <p className="text-xs text-amber-700 mt-1">
                  El asistente de IA está disponible únicamente en el plan Premium. Actualiza tu plan para desbloquear análisis inteligente de inventario, pedidos y recomendaciones de reabastecimiento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Quick Actions ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Acciones rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.action)}
                disabled={isLoading}
                className={`rounded-xl border text-xs font-medium h-9 px-3 gap-2 transition-all ${action.bgColor} ${action.color} disabled:opacity-50`}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* ─── Chat Area ──────────────────────────────────────────────────────── */}
      <Card className="rounded-xl border-neutral-200 overflow-hidden">
        <div className="flex flex-col h-[520px]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
            <div className="space-y-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-1">
                    Asistente Inteligente
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-sm">
                    Hazme preguntas sobre tu tienda o usa las acciones rápidas para obtener análisis detallados de inventario, pedidos y sugerencias.
                  </p>
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === 'user'
                const ActionIcon = getActionIcon(message.action || 'chat')

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isUser
                          ? 'bg-neutral-900'
                          : 'bg-violet-100'
                      }`}
                    >
                      {isUser ? (
                        <span className="text-xs font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      ) : (
                        <Bot className="w-4 h-4 text-violet-600" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Action label for analysis */}
                      {message.isAnalysis && message.action && (
                        <Badge
                          className="mb-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-neutral-50 text-neutral-500 border-neutral-200"
                        >
                          <ActionIcon className="w-3 h-3 mr-1" />
                          {getActionLabel(message.action)}
                        </Badge>
                      )}

                      <div
                        className={`px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-neutral-900 text-white rounded-2xl rounded-tr-md'
                            : message.isAnalysis
                              ? 'bg-neutral-50 text-neutral-800 rounded-2xl rounded-tl-md border border-neutral-200'
                              : 'bg-violet-50 text-neutral-800 rounded-2xl rounded-tl-md border border-violet-100'
                        }`}
                      >
                        {isUser ? (
                          <p>{message.content}</p>
                        ) : (
                          <div
                            className="prose prose-sm max-w-none [&_strong]:font-semibold [&_li]:mb-0.5 [&_h2]:mb-1 [&_h3]:mb-1 [&_br]:block"
                            dangerouslySetInnerHTML={{
                              __html: formatMessageContent(message.content),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="bg-violet-50 border border-violet-100 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                      <span className="text-sm text-violet-600">Analizando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Error bar */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600 flex-1">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe una pregunta sobre tu tienda..."
                disabled={isLoading}
                className="flex-1 h-10 px-4 text-sm rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-900/10 focus:border-violet-300 transition-colors disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-10 w-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center p-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 px-1">
              El asistente puede cometer errores. Verifica la información importante.
            </p>
          </form>
        </div>
      </Card>
    </div>
  )
}
