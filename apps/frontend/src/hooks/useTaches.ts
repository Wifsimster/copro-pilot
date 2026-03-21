import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tachesApi } from '@/api/taches'
import type { Tache } from '@/types'

export const TACHES_QUERY_KEY = ['taches'] as const

export function useTaches(filters?: {
  statut?: string
  priorite?: string
  copropriete_id?: number
}) {
  return useQuery({
    queryKey: [...TACHES_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await tachesApi.getAll(filters)
      return response.data
    },
  })
}

export function useTachesByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...TACHES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await tachesApi.getByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useTachesOverdue() {
  return useQuery({
    queryKey: [...TACHES_QUERY_KEY, 'overdue'],
    queryFn: async () => {
      const response = await tachesApi.getOverdue()
      return response.data
    },
  })
}

export function useCreateTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Tache>) => tachesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TACHES_QUERY_KEY })
    },
  })
}

export function useUpdateTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tache> }) =>
      tachesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TACHES_QUERY_KEY })
    },
  })
}

export function useDeleteTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tachesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TACHES_QUERY_KEY })
    },
  })
}
