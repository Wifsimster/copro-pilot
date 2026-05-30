import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comptesBancairesApi } from '@/api/comptes-bancaires'
import type { CompteBancaire } from '@/types'

const COMPTES_BANCAIRES_QUERY_KEY = ['comptes-bancaires'] as const

export function useComptesBancairesByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...COMPTES_BANCAIRES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await comptesBancairesApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateCompteBancaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CompteBancaire>) => comptesBancairesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPTES_BANCAIRES_QUERY_KEY })
    },
  })
}

export function useUpdateCompteBancaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompteBancaire> }) =>
      comptesBancairesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPTES_BANCAIRES_QUERY_KEY })
    },
  })
}

export function useDeleteCompteBancaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comptesBancairesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPTES_BANCAIRES_QUERY_KEY })
    },
  })
}
