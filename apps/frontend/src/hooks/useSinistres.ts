import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sinistresApi } from '@/api/sinistres'
import type { Sinistre } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const SINISTRES_QUERY_KEY = ['sinistres'] as const

export function useSinistresByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...SINISTRES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await sinistresApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useSinistresByAssurance(assuranceId: number | undefined) {
  return useQuery({
    queryKey: [...SINISTRES_QUERY_KEY, 'assurance', assuranceId],
    queryFn: async () => {
      const response = await sinistresApi.getAllByAssurance(assuranceId!)
      return response.data
    },
    enabled: !!assuranceId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useSinistre(id: number | undefined) {
  return useQuery({
    queryKey: [...SINISTRES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await sinistresApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateSinistre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Sinistre>) => sinistresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SINISTRES_QUERY_KEY })
    },
  })
}

export function useUpdateSinistre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Sinistre> }) =>
      sinistresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SINISTRES_QUERY_KEY })
    },
  })
}

export function useDeleteSinistre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sinistresApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SINISTRES_QUERY_KEY })
    },
  })
}
