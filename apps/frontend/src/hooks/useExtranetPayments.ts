import { useMutation } from '@tanstack/react-query'
import { extranetPaymentsApi } from '@/api/extranetPayments'

interface CreateCheckoutInput {
  amount: number
  description: string
}

/**
 * Creates a Stripe Checkout Session for the current coproprietaire
 * and redirects the browser to the Stripe-hosted payment page on
 * success.
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({ amount, description }: CreateCheckoutInput) => {
      const res = await extranetPaymentsApi.createCheckout(
        amount,
        description
      )
      return res
    },
    onSuccess: res => {
      if (res?.url) {
        window.location.href = res.url
      }
    },
  })
}

/**
 * Confirms a Stripe Checkout Session on return from the payment page.
 * The server is the source of truth via the Stripe webhook, but this
 * gives us a faster UX when the user lands back on the app.
 */
export function useConfirmPayment() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await extranetPaymentsApi.confirmPayment(sessionId)
      return res.data
    },
  })
}
