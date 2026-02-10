import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assurancesApi } from '@/api/assurances'
import type { Assurance } from '@/types'

export const ASSURANCES_QUERY_KEY = ['assurances'] as const

export function useAssurancesByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...ASSURANCES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await assurancesApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useAssurance(id: number | undefined) {
  return useQuery({
    queryKey: [...ASSURANCES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await assurancesApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAssurance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Assurance>) => assurancesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSURANCES_QUERY_KEY })
    },
  })
}

export function useUpdateAssurance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Assurance> }) =>
      assurancesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSURANCES_QUERY_KEY })
    },
  })
}

export function useDeleteAssurance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assurancesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSURANCES_QUERY_KEY })
    },
  })
}
