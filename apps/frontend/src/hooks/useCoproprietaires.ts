import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coproprietairesApi } from '@/api/coproprietaires'
import type { Coproprietaire } from '@/types'

export const COPROPRIETAIRES_QUERY_KEY = ['coproprietaires'] as const

export function useCoproprietaires() {
  return useQuery({
    queryKey: COPROPRIETAIRES_QUERY_KEY,
    queryFn: async () => {
      const response = await coproprietairesApi.getAll()
      return response.data
    },
  })
}

export function useCoproprietaire(id: number | undefined) {
  return useQuery({
    queryKey: [...COPROPRIETAIRES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await coproprietairesApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useSearchCoproprietaires(query: string) {
  return useQuery({
    queryKey: [...COPROPRIETAIRES_QUERY_KEY, 'search', query],
    queryFn: async () => {
      const response = await coproprietairesApi.search(query)
      return response.data
    },
    enabled: query.length >= 2,
  })
}

export function useCreateCoproprietaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Coproprietaire>) => coproprietairesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPROPRIETAIRES_QUERY_KEY })
    },
  })
}

export function useUpdateCoproprietaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Coproprietaire> }) =>
      coproprietairesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPROPRIETAIRES_QUERY_KEY })
    },
  })
}

export function useDeleteCoproprietaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coproprietairesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPROPRIETAIRES_QUERY_KEY })
    },
  })
}
