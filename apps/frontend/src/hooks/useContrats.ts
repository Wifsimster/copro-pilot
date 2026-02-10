import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contratsApi } from '@/api/contrats'
import type { Contrat } from '@/types'

export const CONTRATS_QUERY_KEY = ['contrats'] as const

export function useContratsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...CONTRATS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await contratsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useContratsExpiringSoon(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...CONTRATS_QUERY_KEY, 'echeances', coproprieteId],
    queryFn: async () => {
      const response = await contratsApi.getExpiringSoon(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateContrat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Contrat>) => contratsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRATS_QUERY_KEY })
    },
  })
}

export function useUpdateContrat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Contrat> }) =>
      contratsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRATS_QUERY_KEY })
    },
  })
}

export function useDeleteContrat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contratsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRATS_QUERY_KEY })
    },
  })
}
