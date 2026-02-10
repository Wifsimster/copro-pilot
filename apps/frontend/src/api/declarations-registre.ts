import { api } from './api'
import type { DeclarationRegistre, DonneesDeclarees, ApiResponse } from '@/types'

export const declarationsRegistreApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: DeclarationRegistre[] }>(`/declarations-registre/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: DeclarationRegistre }>(`/declarations-registre/${id}`),

  create: (data: Partial<DeclarationRegistre>) =>
    api.post<ApiResponse<DeclarationRegistre>>('/declarations-registre', data),

  update: (id: number, data: Partial<DeclarationRegistre>) =>
    api.put<ApiResponse<DeclarationRegistre>>(`/declarations-registre/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/declarations-registre/${id}`),

  preparerDonnees: (coproprieteId: number, annee: number) =>
    api.get<{ data: DonneesDeclarees }>(`/declarations-registre/copropriete/${coproprieteId}/preparer/${annee}`),
}
