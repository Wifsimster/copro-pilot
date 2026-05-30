import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mouvementsBancairesApi } from '@/api/mouvements-bancaires'
import type { MouvementBancaire } from '@/types'

const MOUVEMENTS_BANCAIRES_QUERY_KEY = ['mouvements-bancaires'] as const

export function useMouvementsBancairesByCompte(compteId: number | undefined) {
  return useQuery({
    queryKey: [...MOUVEMENTS_BANCAIRES_QUERY_KEY, 'compte', compteId],
    queryFn: async () => {
      const response = await mouvementsBancairesApi.getAllByCompte(compteId!)
      return response.data
    },
    enabled: !!compteId,
  })
}

export function useCreateMouvementBancaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<MouvementBancaire>) => mouvementsBancairesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOUVEMENTS_BANCAIRES_QUERY_KEY })
    },
  })
}

export function useUpdateMouvementBancaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MouvementBancaire> }) =>
      mouvementsBancairesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOUVEMENTS_BANCAIRES_QUERY_KEY })
    },
  })
}

export function useDeleteMouvementBancaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => mouvementsBancairesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOUVEMENTS_BANCAIRES_QUERY_KEY })
    },
  })
}
