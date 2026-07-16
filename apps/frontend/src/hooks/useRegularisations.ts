import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  regularisationsApi,
  type CreateRegularisationInput,
} from '@/api/regularisations'

export const REGULARISATIONS_QUERY_KEY = ['regularisations'] as const

export function useRegularisationsByCopropriete(
  coproprieteId: number | undefined
) {
  return useQuery({
    queryKey: [...REGULARISATIONS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response =
        await regularisationsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateRegularisation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRegularisationInput) =>
      regularisationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGULARISATIONS_QUERY_KEY })
    },
  })
}
