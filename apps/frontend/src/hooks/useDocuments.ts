import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/api/documents'
import type { Document } from '@/types'

export const DOCUMENTS_QUERY_KEY = ['documents'] as const

export function useDocumentsByCopropriete(coproprieteId: number | undefined, filters?: { categorie?: string; entite_type?: string; search?: string }) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, 'copropriete', coproprieteId, filters],
    queryFn: async () => {
      const response = await documentsApi.getAllByCopropriete(coproprieteId!, filters)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useDocumentsByEntity(entiteType: string | undefined, entiteId: number | undefined) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, 'entity', entiteType, entiteId],
    queryFn: async () => {
      const response = await documentsApi.getByEntity(entiteType!, entiteId!)
      return response.data
    },
    enabled: !!entiteType && !!entiteId,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: { copropriete_id: number; nom: string; categorie?: string; description?: string; entite_type?: string; entite_id?: number } }) =>
      documentsApi.upload(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Document>) => documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Document> }) =>
      documentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}
