import client from './client'

export interface SubscriptionStatus {
  status: string
  plan: { code: string; name: string; priceCents: number } | null
  currentPeriodEnd: string | null
  trialExpiresAt: string | null
}

export const getSubscription = () =>
  client.get<SubscriptionStatus>('/subscriptions/status')

export const createCheckout = (plan: 'monthly' | 'yearly') =>
  client.post<{ checkoutUrl: string }>('/subscriptions/lemonsqueezy/checkout', { plan })
