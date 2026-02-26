import client from './client'

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
  sessionId?: string
}

export interface ChatSession {
  id: string
  createdAt: string
  lastMessageAt?: string
}

// GET /chat/sessions — список сессий
export const getSessions = () =>
  client.get<ChatSession[]>('/chat/sessions')

// GET /chat/sessions/:id/messages — сообщения сессии
export const getSessionMessages = (sessionId: string) =>
  client.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)

// POST /chat/messages — отправить сообщение
export const sendMessage = (content: string, sessionId?: string) =>
  client.post<{
    userMessage: ChatMessage
    aiMessage: ChatMessage
    sessionId: string
  }>('/chat/messages', { content, sessionId })

// backward compat
export const getMessages = getSessions
