import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proceduresApi } from '@/api/procedures'
import type { Procedure } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const PROCEDURES_QUERY_KEY = ['procedures'] as const

export function useProceduresByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...PROCEDURES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await proceduresApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useProcedure(id: number | undefined) {
  return useQuery({
    queryKey: [...PROCEDURES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await proceduresApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateProcedure() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Procedure>) => proceduresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCEDURES_QUERY_KEY })
    },
  })
}

export function useUpdateProcedure() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Procedure> }) =>
      proceduresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCEDURES_QUERY_KEY })
    },
  })
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => proceduresApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCEDURES_QUERY_KEY })
    },
  })
}
