import { api } from './api'
import type { FondsTravaux, ApiResponse } from '@/types'

export const fondsTravauxApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: FondsTravaux[] }>(`/fonds-travaux/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: FondsTravaux }>(`/fonds-travaux/${id}`),

  create: (data: Partial<FondsTravaux>) =>
    api.post<ApiResponse<FondsTravaux>>('/fonds-travaux', data),

  update: (id: number, data: Partial<FondsTravaux>) =>
    api.put<ApiResponse<FondsTravaux>>(`/fonds-travaux/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/fonds-travaux/${id}`),
}
