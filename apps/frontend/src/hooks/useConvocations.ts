import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convocationsApi } from '@/api/convocations'
import { ASSEMBLEES_QUERY_KEY } from './useAssemblees'
import type { ConvocationAG, DestinataireConvocation } from '@/types'

export const CONVOCATIONS_QUERY_KEY = ['convocations'] as const

export function useConvocationsByAg(agId: number | undefined) {
  return useQuery({
    queryKey: [...CONVOCATIONS_QUERY_KEY, 'ag', agId],
    queryFn: async () => {
      const response = await convocationsApi.getByAgId(agId!)
      return response.data
    },
    enabled: !!agId,
  })
}

export function useConvocation(id: number | undefined) {
  return useQuery({
    queryKey: [...CONVOCATIONS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await convocationsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useDelaiVerification(agId: number | undefined) {
  return useQuery({
    queryKey: [...CONVOCATIONS_QUERY_KEY, 'delai', agId],
    queryFn: async () => {
      const response = await convocationsApi.verifierDelai(agId!)
      return response.data
    },
    enabled: !!agId,
  })
}

export function useCreateConvocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ConvocationAG>) => convocationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useUpdateConvocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ConvocationAG> }) =>
      convocationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useDeleteConvocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => convocationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useAddDestinataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<DestinataireConvocation>) => convocationsApi.addDestinataire(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useUpdateDestinataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DestinataireConvocation> }) =>
      convocationsApi.updateDestinataire(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useDeleteDestinataire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => convocationsApi.deleteDestinataire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useGenererDestinataires() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (convocationId: number) => convocationsApi.genererDestinataires(convocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
    },
  })
}

export function useEnvoyerConvocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (convocationId: number) => convocationsApi.envoyer(convocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVOCATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}
