import client from './client'

export interface SubscriptionStatus {
  status: string
  plan: { code: string; name: string; priceCents: number } | null
  currentPeriodEnd: string | null
  trialExpiresAt: string | null
}

export interface SubscriptionLimits {
  goalsLimit: number | null
  aiMessagesLimit: number | null
  wishItemsLimit: number | null
  canUseVoice: boolean
  canGenerateImages: boolean
}

// GET /subscriptions/me
export const getSubscription = () =>
  client.get<SubscriptionStatus>('/subscriptions/me')

// GET /subscriptions/limits
export const getSubscriptionLimits = () =>
  client.get<SubscriptionLimits>('/subscriptions/limits')

// POST /subscriptions/stripe/create-checkout (web payments via Stripe)
export const createCheckout = (plan: 'monthly' | 'yearly') =>
  client.post<{ checkoutUrl: string }>('/subscriptions/stripe/create-checkout', { plan })

// POST /subscriptions/trial/activate
export const activateTrial = () =>
  client.post('/subscriptions/trial/activate')
