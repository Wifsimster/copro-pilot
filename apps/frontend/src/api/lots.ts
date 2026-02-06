import { api } from './api'
import type { Lot, ApiResponse } from '@/types'

export interface LotWithProprietaire extends Lot {
  proprietaire_nom: string | null
  proprietaire_prenom: string | null
  proprietaire_email?: string | null
}

export const lotsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: LotWithProprietaire[] }>(`/lots/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: LotWithProprietaire }>(`/lots/${id}`),

  create: (data: Partial<Lot>) =>
    api.post<ApiResponse<Lot>>('/lots', data),

  update: (id: number, data: Partial<Lot>) =>
    api.put<ApiResponse<Lot>>(`/lots/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/lots/${id}`),
}
