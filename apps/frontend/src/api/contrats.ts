import { api } from './api'
import type { ApiResponse, Contrat } from '@/types'

export const contratsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Contrat[] }>(`/contrats/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Contrat }>(`/contrats/${id}`),

  getByPrestataire: (prestataireId: number) =>
    api.get<{ data: Contrat[] }>(`/contrats/prestataire/${prestataireId}`),

  getExpiringSoon: (coproprieteId: number) =>
    api.get<{ data: Contrat[] }>(`/contrats/echeances/${coproprieteId}`),

  create: (data: Partial<Contrat>) =>
    api.post<ApiResponse<Contrat>>('/contrats', data),

  update: (id: number, data: Partial<Contrat>) =>
    api.put<ApiResponse<Contrat>>(`/contrats/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/contrats/${id}`),
}
