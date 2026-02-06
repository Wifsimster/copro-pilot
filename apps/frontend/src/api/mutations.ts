import { api } from './api'
import type { Mutation, ApiResponse } from '@/types'

export const mutationsApi = {
  getAllByLot: (lotId: number) =>
    api.get<{ data: Mutation[] }>(`/mutations/lot/${lotId}`),

  create: (data: Partial<Mutation>) =>
    api.post<ApiResponse<Mutation>>('/mutations', data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/mutations/${id}`),
}
