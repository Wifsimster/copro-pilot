import { api } from './api'
import type { Intervention, ApiResponse } from '@/types'

export const interventionsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Intervention[] }>(`/interventions/copropriete/${coproprieteId}`),

  getAllByIncident: (incidentId: number) =>
    api.get<{ data: Intervention[] }>(`/interventions/incident/${incidentId}`),

  getById: (id: number) =>
    api.get<{ data: Intervention }>(`/interventions/${id}`),

  create: (data: Partial<Intervention>) =>
    api.post<ApiResponse<Intervention>>('/interventions', data),

  update: (id: number, data: Partial<Intervention>) =>
    api.put<ApiResponse<Intervention>>(`/interventions/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/interventions/${id}`),
}
