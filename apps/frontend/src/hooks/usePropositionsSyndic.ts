import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propositionsSyndicApi } from '@/api/propositions-syndic'
import type { PropositionSyndic } from '@/types'

export const PROPOSITIONS_SYNDIC_QUERY_KEY = ['propositions-syndic'] as const

export function usePropositionsSyndicByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...PROPOSITIONS_SYNDIC_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await propositionsSyndicApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreatePropositionSyndic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PropositionSyndic>) => propositionsSyndicApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSITIONS_SYNDIC_QUERY_KEY })
    },
  })
}

export function useUpdatePropositionSyndic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PropositionSyndic> }) =>
      propositionsSyndicApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSITIONS_SYNDIC_QUERY_KEY })
    },
  })
}

export function useDeletePropositionSyndic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => propositionsSyndicApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSITIONS_SYNDIC_QUERY_KEY })
    },
  })
}
