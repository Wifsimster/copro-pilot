import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coproprietesApi } from '@/api/coproprietes'
import type { Copropriete } from '@/types'

export const COPROPRIETES_QUERY_KEY = ['coproprietes'] as const

export function useCoproprietes() {
  return useQuery({
    queryKey: COPROPRIETES_QUERY_KEY,
    queryFn: async () => {
      const response = await coproprietesApi.getAll()
      return response.data
    },
  })
}

export function useCopropriete(id: number | undefined) {
  return useQuery({
    queryKey: [...COPROPRIETES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await coproprietesApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateCopropriete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Copropriete>) => coproprietesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPROPRIETES_QUERY_KEY })
    },
  })
}

export function useUpdateCopropriete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Copropriete> }) =>
      coproprietesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPROPRIETES_QUERY_KEY })
    },
  })
}

export function useDeleteCopropriete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coproprietesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPROPRIETES_QUERY_KEY })
    },
  })
}
