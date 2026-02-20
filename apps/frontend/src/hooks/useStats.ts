import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/api/stats'

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
