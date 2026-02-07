import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diagnosticsApi } from '@/api/diagnostics'
import type { Diagnostic } from '@/types'

export const DIAGNOSTICS_QUERY_KEY = ['diagnostics'] as const

export function useDiagnosticsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...DIAGNOSTICS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await diagnosticsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateDiagnostic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Diagnostic>) => diagnosticsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIAGNOSTICS_QUERY_KEY })
    },
  })
}

export function useUpdateDiagnostic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Diagnostic> }) =>
      diagnosticsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIAGNOSTICS_QUERY_KEY })
    },
  })
}

export function useDeleteDiagnostic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => diagnosticsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIAGNOSTICS_QUERY_KEY })
    },
  })
}
