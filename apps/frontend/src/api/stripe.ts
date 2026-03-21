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
}
