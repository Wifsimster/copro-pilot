import { api } from './api'
import type { ConvocationAG, DestinataireConvocation, DelaiVerification, ApiResponse } from '@/types'

export const convocationsApi = {
  getByAgId: (agId: number) =>
    api.get<{ data: ConvocationAG[] }>(`/convocations/ag/${agId}`),

  getById: (id: number) =>
    api.get<{ data: ConvocationAG }>(`/convocations/${id}`),

  create: (data: Partial<ConvocationAG>) =>
    api.post<ApiResponse<ConvocationAG>>('/convocations', data),

  update: (id: number, data: Partial<ConvocationAG>) =>
    api.put<ApiResponse<ConvocationAG>>(`/convocations/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/convocations/${id}`),

  getDestinataires: (convocationId: number) =>
    api.get<{ data: DestinataireConvocation[] }>(`/convocations/${convocationId}/destinataires`),

  addDestinataire: (data: Partial<DestinataireConvocation>) =>
    api.post<ApiResponse<DestinataireConvocation>>('/convocations/destinataires', data),

  updateDestinataire: (id: number, data: Partial<DestinataireConvocation>) =>
    api.put<ApiResponse<DestinataireConvocation>>(`/convocations/destinataires/${id}`, data),

  deleteDestinataire: (id: number) =>
    api.delete<{ message: string }>(`/convocations/destinataires/${id}`),

  genererDestinataires: (convocationId: number) =>
    api.post<{ data: DestinataireConvocation[]; message: string }>(`/convocations/${convocationId}/generer-destinataires`, {}),

  envoyer: (convocationId: number) =>
    api.post<ApiResponse<ConvocationAG>>(`/convocations/${convocationId}/envoyer`, {}),

  verifierDelai: (agId: number) =>
    api.get<{ data: DelaiVerification }>(`/convocations/delai/${agId}`),
}
