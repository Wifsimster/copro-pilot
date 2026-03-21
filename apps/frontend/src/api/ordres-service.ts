import { api } from './api'
import type { OrdreService, ApiResponse } from '@/types'

export const ordresServiceApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: OrdreService[] }>(`/ordres-service/copropriete/${coproprieteId}`),

  getAllByIncident: (incidentId: number) =>
    api.get<{ data: OrdreService[] }>(`/ordres-service/incident/${incidentId}`),

  getById: (id: number) =>
    api.get<{ data: OrdreService }>(`/ordres-service/${id}`),

  create: (data: Partial<OrdreService>) =>
    api.post<ApiResponse<OrdreService>>('/ordres-service', data),

  update: (id: number, data: Partial<OrdreService>) =>
    api.put<ApiResponse<OrdreService>>(`/ordres-service/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/ordres-service/${id}`),
}
