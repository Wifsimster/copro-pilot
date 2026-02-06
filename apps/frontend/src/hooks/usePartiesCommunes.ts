import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partiesCommunesApi } from '@/api/parties-communes'
import type { PartieCommune } from '@/types'

export const PARTIES_COMMUNES_QUERY_KEY = ['parties-communes'] as const

export function usePartiesCommunesByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...PARTIES_COMMUNES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await partiesCommunesApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreatePartieCommune() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PartieCommune>) => partiesCommunesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTIES_COMMUNES_QUERY_KEY })
    },
  })
}

export function useUpdatePartieCommune() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PartieCommune> }) =>
      partiesCommunesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTIES_COMMUNES_QUERY_KEY })
    },
  })
}

export function useDeletePartieCommune() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => partiesCommunesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTIES_COMMUNES_QUERY_KEY })
    },
  })
}
