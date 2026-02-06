import { api } from './api'
import type { Locataire, ApiResponse } from '@/types'

export const locatairesApi = {
  getAllByLot: (lotId: number) =>
    api.get<{ data: Locataire[] }>(`/locataires/lot/${lotId}`),

  getById: (id: number) =>
    api.get<{ data: Locataire }>(`/locataires/${id}`),

  create: (data: Partial<Locataire>) =>
    api.post<ApiResponse<Locataire>>('/locataires', data),

  update: (id: number, data: Partial<Locataire>) =>
    api.put<ApiResponse<Locataire>>(`/locataires/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/locataires/${id}`),
}
