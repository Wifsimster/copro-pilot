import { api } from './api'
import type { GdprConsent } from '@/types'

export const gdprApi = {
  getMyConsents: () =>
    api.get<{ data: GdprConsent[] }>('/gdpr/consents'),

  recordConsent: (data: {
    consent_type: string
    granted: boolean
    version?: string
  }) => api.post<{ data: GdprConsent }>('/gdpr/consents', data),

  revokeAll: () =>
    api.delete<{ message: string }>('/gdpr/consents'),

  exportMyData: () => {
    window.open('/api/gdpr/export', '_blank')
  },

  requestErasure: (confirmation: string) =>
    api.post<{ message: string }>('/gdpr/erasure', {
      confirmation,
    }),
}
