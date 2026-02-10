import { api } from './api'
import type { Sinistre, ApiResponse } from '@/types'

export const sinistresApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Sinistre[] }>(`/sinistres/copropriete/${coproprieteId}`),

  getAllByAssurance: (assuranceId: number) =>
    api.get<{ data: Sinistre[] }>(`/sinistres/assurance/${assuranceId}`),

  getById: (id: number) =>
    api.get<{ data: Sinistre }>(`/sinistres/${id}`),

  create: (data: Partial<Sinistre>) =>
    api.post<ApiResponse<Sinistre>>('/sinistres', data),

  update: (id: number, data: Partial<Sinistre>) =>
    api.put<ApiResponse<Sinistre>>(`/sinistres/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/sinistres/${id}`),
}
