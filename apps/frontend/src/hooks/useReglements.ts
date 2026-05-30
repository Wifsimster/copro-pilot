import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reglementsApi, articlesReglementApi } from '@/api/reglements'
import type { ReglementCopropriete, ArticleReglement } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const REGLEMENTS_QUERY_KEY = ['reglements'] as const
// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const ARTICLES_REGLEMENT_QUERY_KEY = ['articles-reglement'] as const

// Hooks for ReglementCopropriete
export function useReglementsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...REGLEMENTS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await reglementsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useReglement(id: number | undefined) {
  return useQuery({
    queryKey: [...REGLEMENTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await reglementsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateReglement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ReglementCopropriete>) => reglementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGLEMENTS_QUERY_KEY })
    },
  })
}

export function useUpdateReglement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ReglementCopropriete> }) =>
      reglementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGLEMENTS_QUERY_KEY })
    },
  })
}

export function useDeleteReglement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reglementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGLEMENTS_QUERY_KEY })
    },
  })
}

// Hooks for ArticleReglement
export function useArticlesByReglement(reglementId: number | undefined) {
  return useQuery({
    queryKey: [...ARTICLES_REGLEMENT_QUERY_KEY, 'reglement', reglementId],
    queryFn: async () => {
      const response = await articlesReglementApi.getAllByReglement(reglementId!)
      return response.data
    },
    enabled: !!reglementId,
  })
}

export function useCreateArticleReglement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ArticleReglement>) => articlesReglementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_REGLEMENT_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: REGLEMENTS_QUERY_KEY })
    },
  })
}

export function useUpdateArticleReglement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ArticleReglement> }) =>
      articlesReglementApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_REGLEMENT_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: REGLEMENTS_QUERY_KEY })
    },
  })
}

export function useDeleteArticleReglement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => articlesReglementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_REGLEMENT_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: REGLEMENTS_QUERY_KEY })
    },
  })
}
