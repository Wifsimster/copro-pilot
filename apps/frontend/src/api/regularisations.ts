import { api } from './api'
import type { Regularisation, ApiResponse } from '@/types'

export interface CreateRegularisationInput {
  copropriete_id: number
  annee: number
  charges_reelles: number
  provisions: number
  statut?: 'brouillon' | 'validee'
}

export const regularisationsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Regularisation[] }>(
      `/regularisations/copropriete/${coproprieteId}`
    ),

  getById: (id: number) =>
    api.get<{ data: Regularisation }>(`/regularisations/${id}`),

  create: (data: CreateRegularisationInput) =>
    api.post<ApiResponse<Regularisation>>('/regularisations', data),

  genererAppel: (id: number) =>
    api.post<ApiResponse<unknown>>(`/regularisations/${id}/generer-appel`),
}
