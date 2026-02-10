import { api } from './api'
import type { ApiResponse, MembreConseilSyndical } from '@/types'

export const conseilSyndicalApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: MembreConseilSyndical[] }>(`/conseil-syndical/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: MembreConseilSyndical }>(`/conseil-syndical/${id}`),

  create: (data: Partial<MembreConseilSyndical>) =>
    api.post<ApiResponse<MembreConseilSyndical>>('/conseil-syndical', data),

  update: (id: number, data: Partial<MembreConseilSyndical>) =>
    api.put<ApiResponse<MembreConseilSyndical>>(`/conseil-syndical/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/conseil-syndical/${id}`),
}
