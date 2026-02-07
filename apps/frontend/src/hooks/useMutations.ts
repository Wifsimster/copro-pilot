import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mutationsApi } from '@/api/mutations'
import type { Mutation } from '@/types'
import { LOTS_QUERY_KEY } from './useLots'

export const MUTATIONS_QUERY_KEY = ['mutations'] as const

export function useMutationsByLot(lotId: number | undefined) {
  return useQuery({
    queryKey: [...MUTATIONS_QUERY_KEY, 'lot', lotId],
    queryFn: async () => {
      const response = await mutationsApi.getAllByLot(lotId!)
      return response.data
    },
    enabled: !!lotId,
  })
}

export function useCreateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Mutation>) => mutationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MUTATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
    },
  })
}

export function useUpdateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Mutation> }) => mutationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MUTATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
    },
  })
}

export function useDeleteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => mutationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MUTATIONS_QUERY_KEY })
    },
  })
}
