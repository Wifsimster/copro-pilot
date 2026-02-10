import { api } from './api'
import type { Procedure, ApiResponse } from '@/types'

export const proceduresApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Procedure[] }>(`/procedures/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Procedure }>(`/procedures/${id}`),

  create: (data: Partial<Procedure>) =>
    api.post<ApiResponse<Procedure>>('/procedures', data),

  update: (id: number, data: Partial<Procedure>) =>
    api.put<ApiResponse<Procedure>>(`/procedures/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/procedures/${id}`),
}
