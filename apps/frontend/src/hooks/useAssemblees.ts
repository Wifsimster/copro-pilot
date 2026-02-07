import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assembleesApi } from '@/api/assemblees'
import type { AssembleeGenerale, Resolution, PresenceAG } from '@/types'

export const ASSEMBLEES_QUERY_KEY = ['assemblees'] as const

export function useAssembleesByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...ASSEMBLEES_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await assembleesApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useAssemblee(id: number | undefined) {
  return useQuery({
    queryKey: [...ASSEMBLEES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await assembleesApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAssemblee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AssembleeGenerale>) => assembleesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useUpdateAssemblee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssembleeGenerale> }) =>
      assembleesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useDeleteAssemblee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assembleesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useCreateResolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Resolution>) => assembleesApi.createResolution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useUpdateResolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Resolution> }) =>
      assembleesApi.updateResolution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useDeleteResolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assembleesApi.deleteResolution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useSetPresence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PresenceAG>) => assembleesApi.setPresence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}

export function useDeletePresence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assembleesApi.deletePresence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLEES_QUERY_KEY })
    },
  })
}
