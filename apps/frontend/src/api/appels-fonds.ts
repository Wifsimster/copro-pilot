import { api } from './api'
import type { AppelFonds, AppelFondsLigne, ApiResponse } from '@/types'

export const appelsFondsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: AppelFonds[] }>(`/appels-fonds/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: AppelFonds }>(`/appels-fonds/${id}`),

  create: (data: Partial<AppelFonds>) =>
    api.post<ApiResponse<AppelFonds>>('/appels-fonds', data),

  update: (id: number, data: Partial<AppelFonds>) =>
    api.put<ApiResponse<AppelFonds>>(`/appels-fonds/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/appels-fonds/${id}`),

  getLignes: (appelFondsId: number) =>
    api.get<{ data: AppelFondsLigne[] }>(`/appels-fonds/${appelFondsId}/lignes`),

  createLigne: (data: Partial<AppelFondsLigne>) =>
    api.post<ApiResponse<AppelFondsLigne>>('/appels-fonds/lignes', data),

  updateLigne: (id: number, data: Partial<AppelFondsLigne>) =>
    api.put<ApiResponse<AppelFondsLigne>>(`/appels-fonds/lignes/${id}`, data),

  deleteLigne: (id: number) =>
    api.delete<{ message: string }>(`/appels-fonds/lignes/${id}`),
}
