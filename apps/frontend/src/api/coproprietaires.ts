import { api } from './api'
import type { Coproprietaire, Lot, ApiResponse } from '@/types'

export interface CoproprietaireWithLots extends Coproprietaire {
  lots: (Lot & { copropriete_nom: string })[]
}

export const coproprietairesApi = {
  getAll: () =>
    api.get<{ data: Coproprietaire[] }>('/coproprietaires'),

  getById: (id: number) =>
    api.get<{ data: CoproprietaireWithLots }>(`/coproprietaires/${id}`),

  create: (data: Partial<Coproprietaire>) =>
    api.post<ApiResponse<Coproprietaire>>('/coproprietaires', data),

  update: (id: number, data: Partial<Coproprietaire>) =>
    api.put<ApiResponse<Coproprietaire>>(`/coproprietaires/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/coproprietaires/${id}`),

  search: (query: string) =>
    api.get<{ data: Coproprietaire[] }>('/coproprietaires/search', { q: query }),
}
