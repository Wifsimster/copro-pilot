import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prestatairesApi } from '@/api/prestataires'
import type { Prestataire } from '@/types'

const PRESTATAIRES_QUERY_KEY = ['prestataires'] as const

export function usePrestataires() {
  return useQuery({
    queryKey: [...PRESTATAIRES_QUERY_KEY],
    queryFn: async () => {
      const response = await prestatairesApi.getAll()
      return response.data
    },
  })
}

export function useCreatePrestataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Prestataire>) => prestatairesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESTATAIRES_QUERY_KEY })
    },
  })
}

export function useUpdatePrestataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Prestataire> }) =>
      prestatairesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESTATAIRES_QUERY_KEY })
    },
  })
}

export function useDeletePrestataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => prestatairesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESTATAIRES_QUERY_KEY })
    },
  })
}
