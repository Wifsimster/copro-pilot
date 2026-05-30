import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paiementsApi } from '@/api/paiements'
import type { Paiement } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const PAIEMENTS_QUERY_KEY = ['paiements'] as const

export function usePaiementsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...PAIEMENTS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await paiementsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function usePaiementsByCoproprietaire(coproprietaireId: number | undefined) {
  return useQuery({
    queryKey: [...PAIEMENTS_QUERY_KEY, 'coproprietaire', coproprietaireId],
    queryFn: async () => {
      const response = await paiementsApi.getAllByCoproprietaire(coproprietaireId!)
      return response.data
    },
    enabled: !!coproprietaireId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function usePaiementsByAppelFonds(appelFondsId: number | undefined) {
  return useQuery({
    queryKey: [...PAIEMENTS_QUERY_KEY, 'appel-fonds', appelFondsId],
    queryFn: async () => {
      const response = await paiementsApi.getAllByAppelFonds(appelFondsId!)
      return response.data
    },
    enabled: !!appelFondsId,
  })
}

export function useCreatePaiement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Paiement>) => paiementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAIEMENTS_QUERY_KEY })
    },
  })
}

export function useUpdatePaiement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Paiement> }) => paiementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAIEMENTS_QUERY_KEY })
    },
  })
}

export function useDeletePaiement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paiementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAIEMENTS_QUERY_KEY })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useSoldeCoproprietaire(coproprietaireId: number | undefined) {
  return useQuery({
    queryKey: [...PAIEMENTS_QUERY_KEY, 'solde', coproprietaireId],
    queryFn: async () => {
      const response = await paiementsApi.getSoldeCoproprietaire(coproprietaireId!)
      return response.data
    },
    enabled: !!coproprietaireId,
  })
}
