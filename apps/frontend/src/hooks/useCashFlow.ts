import { useQuery } from '@tanstack/react-query'
import { cashFlowApi } from '@/api/cash-flow'

export const CASH_FLOW_QUERY_KEY = ['cash-flow'] as const

export function useCashFlowForecast(
  coproprieteId: number | undefined
) {
  return useQuery({
    queryKey: [
      ...CASH_FLOW_QUERY_KEY,
      'forecast',
      coproprieteId,
    ],
    queryFn: async () => {
      const response = await cashFlowApi.getForecast(
        coproprieteId!
      )
      return response.data
    },
    enabled: !!coproprieteId,
  })
}
