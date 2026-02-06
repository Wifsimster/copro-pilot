import { api } from './api'
import type { PartieCommune, ApiResponse } from '@/types'

export const partiesCommunesApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: PartieCommune[] }>(`/parties-communes/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: PartieCommune }>(`/parties-communes/${id}`),

  create: (data: Partial<PartieCommune>) =>
    api.post<ApiResponse<PartieCommune>>('/parties-communes', data),

  update: (id: number, data: Partial<PartieCommune>) =>
    api.put<ApiResponse<PartieCommune>>(`/parties-communes/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/parties-communes/${id}`),
}
