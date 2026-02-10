import { api } from './api'
import type { Assurance, ApiResponse } from '@/types'

export const assurancesApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Assurance[] }>(`/assurances/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Assurance }>(`/assurances/${id}`),

  create: (data: Partial<Assurance>) =>
    api.post<ApiResponse<Assurance>>('/assurances', data),

  update: (id: number, data: Partial<Assurance>) =>
    api.put<ApiResponse<Assurance>>(`/assurances/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/assurances/${id}`),
}
