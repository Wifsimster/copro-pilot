import { api } from './api'
import type { Tache, ApiResponse } from '@/types'

export const tachesApi = {
  getAll: (filters?: {
    statut?: string
    priorite?: string
    copropriete_id?: number
  }) =>
    api.get<{ data: Tache[] }>('/taches', filters),

  getByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Tache[] }>(`/taches/copropriete/${coproprieteId}`),

  getOverdue: () =>
    api.get<{ data: Tache[] }>('/taches/overdue'),

  getById: (id: number) =>
    api.get<{ data: Tache }>(`/taches/${id}`),

  create: (data: Partial<Tache>) =>
    api.post<ApiResponse<Tache>>('/taches', data),

  update: (id: number, data: Partial<Tache>) =>
    api.put<ApiResponse<Tache>>(`/taches/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/taches/${id}`),
}
