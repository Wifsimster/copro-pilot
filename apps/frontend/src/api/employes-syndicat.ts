import { api } from './api'
import type { EmployeSyndicat, ApiResponse } from '@/types'

export const employesSyndicatApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: EmployeSyndicat[] }>(`/employes-syndicat/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: EmployeSyndicat }>(`/employes-syndicat/${id}`),

  create: (data: Partial<EmployeSyndicat>) =>
    api.post<ApiResponse<EmployeSyndicat>>('/employes-syndicat', data),

  update: (id: number, data: Partial<EmployeSyndicat>) =>
    api.put<ApiResponse<EmployeSyndicat>>(`/employes-syndicat/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/employes-syndicat/${id}`),
}
