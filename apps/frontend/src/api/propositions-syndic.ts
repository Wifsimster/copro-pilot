import { api } from './api'
import type { ApiResponse, PropositionSyndic } from '@/types'

export const propositionsSyndicApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: PropositionSyndic[] }>(`/propositions-syndic/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: PropositionSyndic }>(`/propositions-syndic/${id}`),

  create: (data: Partial<PropositionSyndic>) =>
    api.post<ApiResponse<PropositionSyndic>>('/propositions-syndic', data),

  update: (id: number, data: Partial<PropositionSyndic>) =>
    api.put<ApiResponse<PropositionSyndic>>(`/propositions-syndic/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/propositions-syndic/${id}`),
}
