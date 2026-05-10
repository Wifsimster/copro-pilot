import { useQuery, useMutation } from '@tanstack/react-query'
import { stripeApi, type Cadence } from '@/api/stripe'

export function useSubscription(sessionId?: string) {
  return useQuery({
    queryKey: ['subscription', sessionId],
    queryFn: () => stripeApi.getSubscription(sessionId),
    select: data => data.data,
  })
}

interface CheckoutArgs {
  plan: string
  cadence?: Cadence
}

export function useCheckout() {
  return useMutation({
    mutationFn: ({ plan, cadence = 'monthly' }: CheckoutArgs) =>
      stripeApi.createCheckoutSession(plan, cadence),
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

export function useUsage() {
  return useQuery({
    queryKey: ['subscription-usage'],
    queryFn: () => stripeApi.getUsage(),
    select: data => data.data,
  })
}
