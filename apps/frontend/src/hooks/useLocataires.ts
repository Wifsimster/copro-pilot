import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { locatairesApi } from '@/api/locataires'
import type { Locataire } from '@/types'

export const LOCATAIRES_QUERY_KEY = ['locataires'] as const

export function useLocatairesByLot(lotId: number | undefined) {
  return useQuery({
    queryKey: [...LOCATAIRES_QUERY_KEY, 'lot', lotId],
    queryFn: async () => {
      const response = await locatairesApi.getAllByLot(lotId!)
      return response.data
    },
    enabled: !!lotId,
  })
}

export function useCreateLocataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Locataire>) => locatairesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATAIRES_QUERY_KEY })
    },
  })
}

export function useUpdateLocataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Locataire> }) =>
      locatairesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATAIRES_QUERY_KEY })
    },
  })
}

export function useDeleteLocataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => locatairesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATAIRES_QUERY_KEY })
    },
  })
}
