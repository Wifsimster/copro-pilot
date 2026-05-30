import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appelsFondsApi } from '@/api/appels-fonds'
import type { AppelFonds, AppelFondsLigne } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const APPELS_FONDS_QUERY_KEY = ['appels-fonds'] as const

export function useAppelsFondsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...APPELS_FONDS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await appelsFondsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useAppelFonds(id: number | undefined) {
  return useQuery({
    queryKey: [...APPELS_FONDS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await appelsFondsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AppelFonds>) => appelsFondsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

export function useUpdateAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AppelFonds> }) =>
      appelsFondsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

export function useDeleteAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => appelsFondsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useCreateLigneAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AppelFondsLigne>) => appelsFondsApi.createLigne(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useUpdateLigneAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AppelFondsLigne> }) =>
      appelsFondsApi.updateLigne(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useDeleteLigneAppelFonds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => appelsFondsApi.deleteLigne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPELS_FONDS_QUERY_KEY })
    },
  })
}
