import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordresServiceApi } from '@/api/ordres-service'
import type { OrdreService } from '@/types'

export const ORDRES_SERVICE_QUERY_KEY = ['ordres-service'] as const

export function useOrdresServiceByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...ORDRES_SERVICE_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await ordresServiceApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useOrdresServiceByIncident(incidentId: number | undefined) {
  return useQuery({
    queryKey: [...ORDRES_SERVICE_QUERY_KEY, 'incident', incidentId],
    queryFn: async () => {
      const response = await ordresServiceApi.getAllByIncident(incidentId!)
      return response.data
    },
    enabled: !!incidentId,
  })
}

export function useCreateOrdreService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<OrdreService>) => ordresServiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDRES_SERVICE_QUERY_KEY })
    },
  })
}

export function useUpdateOrdreService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OrdreService> }) =>
      ordresServiceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDRES_SERVICE_QUERY_KEY })
    },
  })
}

export function useDeleteOrdreService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ordresServiceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDRES_SERVICE_QUERY_KEY })
    },
  })
}
