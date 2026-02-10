import { api } from './api'
import type { ApiResponse, MouvementBancaire } from '@/types'

export const mouvementsBancairesApi = {
  getAllByCompte: (compteId: number) =>
    api.get<{ data: MouvementBancaire[] }>(`/mouvements-bancaires/compte/${compteId}`),

  getById: (id: number) =>
    api.get<{ data: MouvementBancaire }>(`/mouvements-bancaires/${id}`),

  create: (data: Partial<MouvementBancaire>) =>
    api.post<ApiResponse<MouvementBancaire>>('/mouvements-bancaires', data),

  update: (id: number, data: Partial<MouvementBancaire>) =>
    api.put<ApiResponse<MouvementBancaire>>(`/mouvements-bancaires/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/mouvements-bancaires/${id}`),

  getSoldeCompte: (compteId: number) =>
    api.get<{ data: { total_credits: number; total_debits: number; solde: number } }>(`/mouvements-bancaires/solde/${compteId}`),
}
