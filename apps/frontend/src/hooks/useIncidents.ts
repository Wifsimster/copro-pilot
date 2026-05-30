import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { incidentsApi } from '@/api/incidents'
import type { Incident } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const INCIDENTS_QUERY_KEY = ['incidents'] as const

export function useIncidentsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...INCIDENTS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await incidentsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useIncident(id: number | undefined) {
  return useQuery({
    queryKey: [...INCIDENTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await incidentsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Incident>) => incidentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY })
    },
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Incident> }) =>
      incidentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY })
    },
  })
}

export function useDeleteIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => incidentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY })
    },
  })
}
