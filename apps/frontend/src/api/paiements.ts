import { api } from './api'
import type { Paiement, SoldeCoproprietaire, ApiResponse } from '@/types'

export const paiementsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Paiement[] }>(`/paiements/copropriete/${coproprieteId}`),

  getAllByCoproprietaire: (coproprietaireId: number) =>
    api.get<{ data: Paiement[] }>(`/paiements/coproprietaire/${coproprietaireId}`),

  getAllByAppelFonds: (appelFondsId: number) =>
    api.get<{ data: Paiement[] }>(`/paiements/appel-fonds/${appelFondsId}`),

  getById: (id: number) =>
    api.get<{ data: Paiement }>(`/paiements/${id}`),

  create: (data: Partial<Paiement>) =>
    api.post<ApiResponse<Paiement>>('/paiements', data),

  update: (id: number, data: Partial<Paiement>) =>
    api.put<ApiResponse<Paiement>>(`/paiements/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/paiements/${id}`),

  getSoldeCoproprietaire: (coproprietaireId: number) =>
    api.get<{ data: SoldeCoproprietaire }>(`/paiements/solde/${coproprietaireId}`),
}
