import { api } from './api'
import type { ApiResponse, Prestataire } from '@/types'

export const prestatairesApi = {
  getAll: () =>
    api.get<{ data: Prestataire[] }>('/prestataires'),

  getById: (id: number) =>
    api.get<{ data: Prestataire }>(`/prestataires/${id}`),

  create: (data: Partial<Prestataire>) =>
    api.post<ApiResponse<Prestataire>>('/prestataires', data),

  update: (id: number, data: Partial<Prestataire>) =>
    api.put<ApiResponse<Prestataire>>(`/prestataires/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/prestataires/${id}`),
}
