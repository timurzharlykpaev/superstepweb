import client from './client'

export const sendOtp = (email: string) =>
  client.post('/auth/email/start', { email })

export const verifyOtp = (email: string, code: string) =>
  client.post<{
    accessToken: string
    refreshToken: string
    user: { id: string; email: string; nickname?: string; avatarUrl?: string }
  }>('/auth/email/verify', { email, code })

export const getProfile = () =>
  client.get<{ userId: string; subscription: unknown }>('/auth/profile')
