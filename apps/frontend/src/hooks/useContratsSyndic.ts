import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contratsSyndicApi } from '@/api/contrats-syndic'
import type { ContratSyndic } from '@/types'

const CONTRATS_SYNDIC_QUERY_KEY = ['contrats-syndic'] as const

export function useContratsSyndicByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...CONTRATS_SYNDIC_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await contratsSyndicApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateContratSyndic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ContratSyndic>) => contratsSyndicApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRATS_SYNDIC_QUERY_KEY })
    },
  })
}

export function useUpdateContratSyndic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContratSyndic> }) =>
      contratsSyndicApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRATS_SYNDIC_QUERY_KEY })
    },
  })
}

export function useDeleteContratSyndic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contratsSyndicApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRATS_SYNDIC_QUERY_KEY })
    },
  })
}
