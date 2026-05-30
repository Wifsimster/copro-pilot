import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/api/stats'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      const response = await statsApi.getDashboard()
      return response.data
    },
    refetchInterval: 60_000,
  })
}

export function useSyndicDashboard(
  coproprieteId?: number
) {
  return useQuery({
    queryKey: [
      'stats',
      'syndic-dashboard',
      coproprieteId,
    ],
    queryFn: async () => {
      const response =
        await statsApi.getSyndicDashboard(coproprieteId)
      return response.data
    },
    refetchInterval: 60_000,
  })
}
