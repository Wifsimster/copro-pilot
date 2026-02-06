import { api } from './api'
import type { Paiement, SoldeCoproprietaire, ApiResponse } from '@/types'

export const paiementsApi = {
  getAllByCoproprietaire: (coproprietaireId: number) =>
    api.get<{ data: Paiement[] }>(`/paiements/coproprietaire/${coproprietaireId}`),

  getAllByAppelFonds: (appelFondsId: number) =>
    api.get<{ data: Paiement[] }>(`/paiements/appel-fonds/${appelFondsId}`),

  getById: (id: number) =>
    api.get<{ data: Paiement }>(`/paiements/${id}`),

  create: (data: Partial<Paiement>) =>
    api.post<ApiResponse<Paiement>>('/paiements', data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/paiements/${id}`),

  getSoldeCoproprietaire: (coproprietaireId: number) =>
    api.get<{ data: SoldeCoproprietaire }>(`/paiements/solde/${coproprietaireId}`),
}
