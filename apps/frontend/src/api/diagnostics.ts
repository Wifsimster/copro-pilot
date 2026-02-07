import { api } from './api'
import type { Diagnostic, ApiResponse } from '@/types'

export const diagnosticsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Diagnostic[] }>(`/diagnostics/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Diagnostic }>(`/diagnostics/${id}`),

  create: (data: Partial<Diagnostic>) =>
    api.post<ApiResponse<Diagnostic>>('/diagnostics', data),

  update: (id: number, data: Partial<Diagnostic>) =>
    api.put<ApiResponse<Diagnostic>>(`/diagnostics/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/diagnostics/${id}`),
}
