import { api } from './api'
import type { ApiResponse, CompteBancaire } from '@/types'

export const comptesBancairesApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: CompteBancaire[] }>(`/comptes-bancaires/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: CompteBancaire }>(`/comptes-bancaires/${id}`),

  create: (data: Partial<CompteBancaire>) =>
    api.post<ApiResponse<CompteBancaire>>('/comptes-bancaires', data),

  update: (id: number, data: Partial<CompteBancaire>) =>
    api.put<ApiResponse<CompteBancaire>>(`/comptes-bancaires/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/comptes-bancaires/${id}`),

  getSoldeTotal: (coproprieteId: number) =>
    api.get<{ data: { solde_total: number } }>(`/comptes-bancaires/solde/${coproprieteId}`),
}
