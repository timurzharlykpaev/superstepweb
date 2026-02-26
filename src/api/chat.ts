import client from './client'

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
  sessionId?: string
}

export const getMessages = (sessionId?: string) =>
  client.get<{ messages: ChatMessage[] }>('/chat/messages', {
    params: sessionId ? { sessionId } : undefined,
  })

export const sendMessage = (content: string, sessionId?: string) =>
  client.post<{
    userMessage: ChatMessage
    aiMessage: ChatMessage
    sessionId: string
  }>('/chat/messages', { content, sessionId })
