import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { gdprApi } from '@/api/gdpr'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const GDPR_QUERY_KEY = ['gdpr-consents'] as const

export function useMyConsents() {
  return useQuery({
    queryKey: GDPR_QUERY_KEY,
    queryFn: async () => {
      const response = await gdprApi.getMyConsents()
      return response.data
    },
  })
}

export function useRecordConsent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: gdprApi.recordConsent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GDPR_QUERY_KEY,
      })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useRevokeConsents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: gdprApi.revokeAll,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GDPR_QUERY_KEY,
      })
    },
  })
}

export function useRequestErasure() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- erasure is processed asynchronously; no cached data changes here
  return useMutation({
    mutationFn: (confirmation: string) =>
      gdprApi.requestErasure(confirmation),
  })
}
