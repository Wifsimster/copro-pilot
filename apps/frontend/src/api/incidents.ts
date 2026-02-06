import { api } from './api'
import type { Incident, ApiResponse } from '@/types'

export const incidentsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Incident[] }>(`/incidents/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Incident }>(`/incidents/${id}`),

  create: (data: Partial<Incident>) =>
    api.post<ApiResponse<Incident>>('/incidents', data),

  update: (id: number, data: Partial<Incident>) =>
    api.put<ApiResponse<Incident>>(`/incidents/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/incidents/${id}`),
}
