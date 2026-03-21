import { useQuery, useMutation } from '@tanstack/react-query'
import { stripeApi } from '@/api/stripe'

export function useSubscription(sessionId?: string) {
  return useQuery({
    queryKey: ['subscription', sessionId],
    queryFn: () => stripeApi.getSubscription(sessionId),
    select: data => data.data,
  })
}

export function useCheckout() {
  return useMutation({
    mutationFn: (plan: string) =>
      stripeApi.createCheckoutSession(plan),
    onSuccess: data => {
      // Redirect to Stripe Checkout
      window.location.href = data.data.url
    },
  })
}

export function usePortalSession() {
  return useMutation({
    mutationFn: () => stripeApi.createPortalSession(),
    onSuccess: data => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.data.url
    },
  })
}
