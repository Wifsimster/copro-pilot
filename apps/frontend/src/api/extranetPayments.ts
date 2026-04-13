import { api } from './api'

export const extranetPaymentsApi = {
  createCheckout: (amount: number, description: string) =>
    api.post<{ url: string; sessionId: string }>(
      '/extranet/payments/checkout',
      { amount, description }
    ),

  confirmPayment: (sessionId: string) =>
    api.post<{ data: { id: number; montant: number } }>(
      '/extranet/payments/confirm',
      { session_id: sessionId }
    ),
}
