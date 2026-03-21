import { api } from './api'

interface CheckoutSessionResponse {
  data: { url: string; sessionId: string }
}

interface SubscriptionResponse {
  data: {
    plan: string
    status: string
    current_period_end?: string
    stripe_customer_id?: string
  }
}

interface PortalSessionResponse {
  data: { url: string }
}

interface UsageQuota {
  current: number
  limit: number | null
  extra: number
  extra_cost: number
}

export interface UsageResponse {
  data: {
    coproprietes: UsageQuota
    users: UsageQuota
    total_extra_cost: number
  }
}

export const stripeApi = {
  createCheckoutSession: (plan: string) =>
    api.post<CheckoutSessionResponse>('/stripe/checkout-session', {
      plan,
    }),

  getSubscription: (sessionId?: string) =>
    api.get<SubscriptionResponse>(
      '/stripe/subscription',
      sessionId ? { session_id: sessionId } : undefined
    ),

  createPortalSession: () =>
    api.post<PortalSessionResponse>('/stripe/portal-session'),

  getUsage: () => api.get<UsageResponse>('/stripe/usage'),
}
