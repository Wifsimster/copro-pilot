import { api } from './api'
import type { Relance, ApiResponse } from '@/types'

export const relancesApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Relance[] }>(`/relances/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Relance }>(`/relances/${id}`),

  create: (data: Partial<Relance>) =>
    api.post<ApiResponse<Relance>>('/relances', data),

  update: (id: number, data: Partial<Relance>) =>
    api.put<ApiResponse<Relance>>(`/relances/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/relances/${id}`),
}
