import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PaperPlaneRight, Robot, User, Plus, Spinner } from '@phosphor-icons/react'
import client from '../../api/client'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ChatSession {
  id: string
  createdAt: string
  lastMessageAt?: string
  messagesCount?: number
}

const QUICK_ACTIONS = [
  { label: '📋 Plan my week', text: 'Help me plan my week and prioritize my goals' },
  { label: '💪 Motivate me', text: 'I need some motivation to keep working on my goals' },
  { label: '🔍 Review progress', text: 'Can you review my progress and give feedback?' },
  { label: '💡 New ideas', text: 'Give me fresh ideas for achieving my goals faster' },
  { label: '😓 I\'m stuck', text: 'I\'m feeling stuck and don\'t know what to do next' },
  { label: '🎯 Set priorities', text: 'Help me set priorities for this week' },
]

export default function ChatPage() {
  const qc = useQueryClient()
  const [input, setInput] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await client.get<ChatSession[]>('/chat/sessions')
      return res.data || []
    },
  })

  // Load messages when session selected or on first load
  useEffect(() => {
    if (sessions.length > 0 && !currentSessionId) {
      const latest = sessions[0]
      setCurrentSessionId(latest.id)
      loadMessages(latest.id)
    }
  }, [sessions])

  const loadMessages = async (sessionId: string) => {
    setLoadingMessages(true)
    try {
      const res = await client.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)
      setMessages(res.data || [])
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await client.post<{
        userMessage: ChatMessage
        aiMessage: ChatMessage
        sessionId: string
      }>('/chat/messages', { content: text, sessionId: currentSessionId })
      return res.data
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.userMessage, data.aiMessage])
      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId)
        qc.invalidateQueries({ queryKey: ['chat-sessions'] })
      }
    },
  })

  const quickActionMutation = useMutation({
    mutationFn: async (action: string) => {
      const res = await client.post<{
        userMessage: ChatMessage
        aiMessage: ChatMessage
        sessionId: string
      }>('/chat/quick-action', { action, sessionId: currentSessionId })
      return res.data
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.userMessage, data.aiMessage])
      if (!currentSessionId) setCurrentSessionId(data.sessionId)
    },
  })

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sendMutation.isPending) return
    setInput('')
    await sendMutation.mutateAsync(text)
  }

  const handleNewSession = async () => {
    setCurrentSessionId(undefined)
    setMessages([])
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isLoading = sendMutation.isPending || quickActionMutation.isPending

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-black/5 dark:border-white/5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <Robot size={20} weight="duotone" className="text-purple-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>AI Coach</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Your personal assistant</p>
          </div>
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-colors hover:bg-white/5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Plus size={14} />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <Spinner size={24} className="text-purple-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
              <Robot size={32} weight="duotone" className="text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Ask your AI Coach</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Get personalized advice on your goals, weekly planning, and motivation
            </p>
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => { setInput(action.text); }}
                  className="text-xs text-left px-3 py-2.5 rounded-xl border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-purple-600' : 'bg-white/10'
                }`}>
                  {msg.role === 'user'
                    ? <User size={16} className="text-white" />
                    : <Robot size={16} className="text-purple-400" />
                  }
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                  style={msg.role === 'assistant' ? {
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Robot size={16} className="text-purple-400" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-black/5 dark:border-white/5" style={{ backgroundColor: 'var(--color-surface)' }}>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_ACTIONS.slice(0, 3).map(action => (
              <button
                key={action.label}
                onClick={() => setInput(action.text)}
                className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask your coach..."
            className="flex-1 input text-sm py-3"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors disabled:opacity-40"
          >
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
