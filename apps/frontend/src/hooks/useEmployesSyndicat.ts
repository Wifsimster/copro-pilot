import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employesSyndicatApi } from '@/api/employes-syndicat'
import type { EmployeSyndicat } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const EMPLOYES_SYNDICAT_QUERY_KEY = ['employes-syndicat'] as const

export function useEmployesSyndicatByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...EMPLOYES_SYNDICAT_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await employesSyndicatApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useEmployeSyndicat(id: number | undefined) {
  return useQuery({
    queryKey: [...EMPLOYES_SYNDICAT_QUERY_KEY, id],
    queryFn: async () => {
      const response = await employesSyndicatApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateEmployeSyndicat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EmployeSyndicat>) => employesSyndicatApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYES_SYNDICAT_QUERY_KEY })
    },
  })
}

export function useUpdateEmployeSyndicat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmployeSyndicat> }) =>
      employesSyndicatApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYES_SYNDICAT_QUERY_KEY })
    },
  })
}

export function useDeleteEmployeSyndicat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => employesSyndicatApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYES_SYNDICAT_QUERY_KEY })
    },
  })
}
