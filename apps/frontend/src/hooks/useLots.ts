import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lotsApi } from '@/api/lots'
import type { Lot } from '@/types'
import { COPROPRIETES_QUERY_KEY } from './useCoproprietes'

export const LOTS_QUERY_KEY = ['lots'] as const

export function useLotsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...LOTS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await lotsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useLot(id: number | undefined) {
  return useQuery({
    queryKey: [...LOTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await lotsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Lot>) => lotsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: COPROPRIETES_QUERY_KEY })
    },
  })
}

export function useUpdateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lot> }) =>
      lotsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: COPROPRIETES_QUERY_KEY })
    },
  })
}

export function useDeleteLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lotsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: COPROPRIETES_QUERY_KEY })
    },
  })
}
