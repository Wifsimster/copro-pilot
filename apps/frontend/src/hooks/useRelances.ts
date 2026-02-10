import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { relancesApi } from '@/api/relances'
import type { Relance } from '@/types'

export const RELANCES_QUERY_KEY = ['relances'] as const

export function useRelancesByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...RELANCES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await relancesApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useRelance(id: number | undefined) {
  return useQuery({
    queryKey: [...RELANCES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await relancesApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateRelance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Relance>) => relancesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELANCES_QUERY_KEY })
    },
  })
}

export function useUpdateRelance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Relance> }) =>
      relancesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELANCES_QUERY_KEY })
    },
  })
}

export function useDeleteRelance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => relancesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELANCES_QUERY_KEY })
    },
  })
}
