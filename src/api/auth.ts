import client from './client'

export const sendOtp = (email: string) =>
  client.post('/auth/email/start', { email })

export const verifyOtp = (email: string, code: string) =>
  client.post<{
    accessToken: string
    refreshToken: string
    user: { id: string; email: string; nickname?: string; avatarUrl?: string }
  }>('/auth/email/verify', { email, code })

export const googleSignIn = (idToken: string) =>
  client.post<{
    accessToken: string
    refreshToken: string
    user: { id: string; email: string; nickname?: string; avatarUrl?: string }
  }>('/auth/google', { idToken })

export const getProfile = () =>
  client.get<{ id: string; email: string; nickname?: string; avatarUrl?: string }>('/auth/me')
