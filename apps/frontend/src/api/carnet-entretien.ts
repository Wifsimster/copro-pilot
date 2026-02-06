import { api } from './api'
import type { CarnetEntretien, ApiResponse } from '@/types'

export const carnetEntretienApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: CarnetEntretien[] }>(`/carnet-entretien/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: CarnetEntretien }>(`/carnet-entretien/${id}`),

  create: (data: Partial<CarnetEntretien>) =>
    api.post<ApiResponse<CarnetEntretien>>('/carnet-entretien', data),

  update: (id: number, data: Partial<CarnetEntretien>) =>
    api.put<ApiResponse<CarnetEntretien>>(`/carnet-entretien/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/carnet-entretien/${id}`),
}
