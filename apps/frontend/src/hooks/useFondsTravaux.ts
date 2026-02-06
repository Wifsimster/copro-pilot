import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fondsTravauxApi } from '@/api/fonds-travaux'
import type { FondsTravaux } from '@/types'

export const FONDS_TRAVAUX_QUERY_KEY = ['fonds-travaux'] as const

export function useFondsTravauxByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...FONDS_TRAVAUX_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await fondsTravauxApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateFondsTravaux() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<FondsTravaux>) => fondsTravauxApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FONDS_TRAVAUX_QUERY_KEY })
    },
  })
}

export function useUpdateFondsTravaux() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FondsTravaux> }) =>
      fondsTravauxApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FONDS_TRAVAUX_QUERY_KEY })
    },
  })
}

export function useDeleteFondsTravaux() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fondsTravauxApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FONDS_TRAVAUX_QUERY_KEY })
    },
  })
}
