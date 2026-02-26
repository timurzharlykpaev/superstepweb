import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getMessages, sendMessage, type ChatMessage } from '../../api/chat'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const { isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      const res = await getMessages()
      setMessages(res.data.messages || [])
      return res.data.messages
    },
  })

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(input, sessionId),
    onMutate: () => {
      const optimistic: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: input,
        role: 'user',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])
      setInput('')
    },
    onSuccess: (res) => {
      const { userMessage, aiMessage, sessionId: sid } = res.data
      setSessionId(sid)
      setMessages((prev) => {
        // Replace optimistic message
        const filtered = prev.filter((m) => !m.id.startsWith('temp-'))
        return [...filtered, userMessage, aiMessage]
      })
    },
    onError: () => {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')))
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMutation.isPending) return
    sendMutation.mutate()
  }

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
          <span>🤖</span>
        </div>
        <div>
          <h1 className="text-white font-semibold">AI Coach</h1>
          <p className="text-gray-500 text-xs">Your personal goal advisor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="bg-[#1a1a1a] rounded-2xl h-12 w-48 animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-white font-semibold mb-2">AI Coach</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Ask me anything about your goals, get motivation, or plan your week.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-[#1a1a1a] text-gray-200 rounded-bl-sm border border-white/5'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {sendMutation.isPending && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-[#1a1a1a] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/5 bg-[#0D0D0D]">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI coach..."
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
