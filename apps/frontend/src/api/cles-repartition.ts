import { api } from './api'
import type { CleRepartition, LotCleRepartition, ApiResponse } from '@/types'

export const clesRepartitionApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: CleRepartition[] }>(`/cles-repartition/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: CleRepartition }>(`/cles-repartition/${id}`),

  create: (data: Partial<CleRepartition>) =>
    api.post<ApiResponse<CleRepartition>>('/cles-repartition', data),

  update: (id: number, data: Partial<CleRepartition>) =>
    api.put<ApiResponse<CleRepartition>>(`/cles-repartition/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/cles-repartition/${id}`),

  setLotQuotePart: (lotId: number, cleId: number, quotePart: number) =>
    api.put<ApiResponse<LotCleRepartition>>(`/cles-repartition/lot/${lotId}/cle/${cleId}`, { quote_part: quotePart }),

  removeLotQuotePart: (lotId: number, cleId: number) =>
    api.delete<{ message: string }>(`/cles-repartition/lot/${lotId}/cle/${cleId}`),
}
