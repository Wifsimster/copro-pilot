import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interventionsApi } from '@/api/interventions'
import type { Intervention } from '@/types'

export const INTERVENTIONS_QUERY_KEY = ['interventions'] as const

export function useInterventionsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...INTERVENTIONS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await interventionsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useInterventionsByIncident(incidentId: number | undefined) {
  return useQuery({
    queryKey: [...INTERVENTIONS_QUERY_KEY, 'incident', incidentId],
    queryFn: async () => {
      const response = await interventionsApi.getAllByIncident(incidentId!)
      return response.data
    },
    enabled: !!incidentId,
  })
}

export function useCreateIntervention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Intervention>) => interventionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVENTIONS_QUERY_KEY })
    },
  })
}

export function useUpdateIntervention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Intervention> }) =>
      interventionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVENTIONS_QUERY_KEY })
    },
  })
}

export function useDeleteIntervention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => interventionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVENTIONS_QUERY_KEY })
    },
  })
}
