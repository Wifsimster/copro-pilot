import { useQuery } from '@tanstack/react-query'
import { complianceApi } from '@/api/compliance'

const COMPLIANCE_QUERY_KEY = ['compliance'] as const

export function useCompliance(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...COMPLIANCE_QUERY_KEY, coproprieteId],
    queryFn: async () => {
      const response = await complianceApi.getCompliance(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}
