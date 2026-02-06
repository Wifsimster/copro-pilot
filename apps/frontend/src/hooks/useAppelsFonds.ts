import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appelsFondsApi } from '@/api/appels-fonds'
import type { AppelFonds } from '@/types'

export const APPELS_FONDS_QUERY_KEY = ['appels-fonds'] as const

export function useAppelsFondsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...APPELS_FONDS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await appelsFondsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useAppelFonds(id: number | undefined) {
  return useQuery({
    queryKey: [...APPELS_FONDS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await appelsFondsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AppelFonds>) => appelsFondsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

export function useUpdateAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AppelFonds> }) =>
      appelsFondsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

export function useDeleteAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => appelsFondsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}
