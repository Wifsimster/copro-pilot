import { api } from './api'

interface CheckoutSessionResponse {
  data: { url: string; sessionId: string }
}

export type Cadence = 'monthly' | 'yearly'

interface SubscriptionResponse {
  data: {
    plan: string
    cadence?: Cadence
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
  createCheckoutSession: (plan: string, cadence: Cadence = 'monthly') =>
    api.post<CheckoutSessionResponse>('/stripe/checkout-session', {
      plan,
      cadence,
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
