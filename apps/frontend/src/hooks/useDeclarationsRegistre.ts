import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { declarationsRegistreApi } from '@/api/declarations-registre'
import type { DeclarationRegistre } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const DECLARATIONS_REGISTRE_QUERY_KEY = ['declarations-registre'] as const

export function useDeclarationsRegistreByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...DECLARATIONS_REGISTRE_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await declarationsRegistreApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useDeclarationRegistre(id: number | undefined) {
  return useQuery({
    queryKey: [...DECLARATIONS_REGISTRE_QUERY_KEY, id],
    queryFn: async () => {
      const response = await declarationsRegistreApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateDeclarationRegistre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<DeclarationRegistre>) => declarationsRegistreApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DECLARATIONS_REGISTRE_QUERY_KEY })
    },
  })
}

export function useUpdateDeclarationRegistre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DeclarationRegistre> }) =>
      declarationsRegistreApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DECLARATIONS_REGISTRE_QUERY_KEY })
    },
  })
}

export function useDeleteDeclarationRegistre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => declarationsRegistreApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DECLARATIONS_REGISTRE_QUERY_KEY })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function usePreparerDonnees(coproprieteId: number | undefined, annee: number | undefined) {
  return useQuery({
    queryKey: [...DECLARATIONS_REGISTRE_QUERY_KEY, 'preparer', coproprieteId, annee],
    queryFn: async () => {
      const response = await declarationsRegistreApi.preparerDonnees(coproprieteId!, annee!)
      return response.data
    },
    enabled: false,
  })
}
