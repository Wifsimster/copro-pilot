import { api } from './api'
import type { ReglementCopropriete, ArticleReglement, ApiResponse } from '@/types'

export const reglementsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: ReglementCopropriete[] }>(`/reglements-copropriete/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: ReglementCopropriete }>(`/reglements-copropriete/${id}`),

  create: (data: Partial<ReglementCopropriete>) =>
    api.post<ApiResponse<ReglementCopropriete>>('/reglements-copropriete', data),

  update: (id: number, data: Partial<ReglementCopropriete>) =>
    api.put<ApiResponse<ReglementCopropriete>>(`/reglements-copropriete/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/reglements-copropriete/${id}`),
}

export const articlesReglementApi = {
  getAllByReglement: (reglementId: number) =>
    api.get<{ data: ArticleReglement[] }>(`/reglements-copropriete/${reglementId}/articles`),

  getById: (id: number) =>
    api.get<{ data: ArticleReglement }>(`/reglements-copropriete/articles/${id}`),

  create: (data: Partial<ArticleReglement>) =>
    api.post<ApiResponse<ArticleReglement>>('/reglements-copropriete/articles', data),

  update: (id: number, data: Partial<ArticleReglement>) =>
    api.put<ApiResponse<ArticleReglement>>(`/reglements-copropriete/articles/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/reglements-copropriete/articles/${id}`),
}
