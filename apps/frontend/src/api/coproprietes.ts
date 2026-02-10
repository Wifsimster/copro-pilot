import { api } from './api'
import type { Copropriete, ApiResponse, FicheSynthetique } from '@/types'

export interface CoproprieteWithStats extends Copropriete {
  nombre_lots: number
  total_tantiemes: number
  nombre_coproprietaires: number
}

export const coproprietesApi = {
  getAll: () =>
    api.get<{ data: CoproprieteWithStats[] }>('/coproprietes'),

  getById: (id: number) =>
    api.get<{ data: CoproprieteWithStats }>(`/coproprietes/${id}`),

  create: (data: Partial<Copropriete>) =>
    api.post<ApiResponse<Copropriete>>('/coproprietes', data),

  update: (id: number, data: Partial<Copropriete>) =>
    api.put<ApiResponse<Copropriete>>(`/coproprietes/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/coproprietes/${id}`),

  getFicheSynthetique: (id: number) =>
    api.get<{ data: FicheSynthetique }>(`/coproprietes/${id}/fiche-synthetique`),
}
