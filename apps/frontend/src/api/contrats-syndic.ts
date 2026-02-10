import { api } from './api'
import type { ApiResponse, ContratSyndic } from '@/types'

export const contratsSyndicApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: ContratSyndic[] }>(`/contrats-syndic/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: ContratSyndic }>(`/contrats-syndic/${id}`),

  create: (data: Partial<ContratSyndic>) =>
    api.post<ApiResponse<ContratSyndic>>('/contrats-syndic', data),

  update: (id: number, data: Partial<ContratSyndic>) =>
    api.put<ApiResponse<ContratSyndic>>(`/contrats-syndic/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/contrats-syndic/${id}`),
}
