import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clesRepartitionApi } from '@/api/cles-repartition'
import type { CleRepartition } from '@/types'

const CLES_REPARTITION_QUERY_KEY = ['cles-repartition'] as const

export function useClesRepartitionByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...CLES_REPARTITION_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await clesRepartitionApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateCleRepartition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CleRepartition>) => clesRepartitionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLES_REPARTITION_QUERY_KEY })
    },
  })
}

export function useUpdateCleRepartition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CleRepartition> }) => clesRepartitionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLES_REPARTITION_QUERY_KEY })
    },
  })
}

export function useDeleteCleRepartition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clesRepartitionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLES_REPARTITION_QUERY_KEY })
    },
  })
}
