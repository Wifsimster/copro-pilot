import { api } from './api'
import type { AssembleeGenerale, Resolution, PresenceAG, ApiResponse } from '@/types'

export const assembleesApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: AssembleeGenerale[] }>(`/assemblees/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: AssembleeGenerale }>(`/assemblees/${id}`),

  create: (data: Partial<AssembleeGenerale>) =>
    api.post<ApiResponse<AssembleeGenerale>>('/assemblees', data),

  update: (id: number, data: Partial<AssembleeGenerale>) =>
    api.put<ApiResponse<AssembleeGenerale>>(`/assemblees/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/assemblees/${id}`),

  getResolutions: (agId: number) =>
    api.get<{ data: Resolution[] }>(`/assemblees/${agId}/resolutions`),

  createResolution: (data: Partial<Resolution>) =>
    api.post<ApiResponse<Resolution>>('/assemblees/resolutions', data),

  updateResolution: (id: number, data: Partial<Resolution>) =>
    api.put<ApiResponse<Resolution>>(`/assemblees/resolutions/${id}`, data),

  deleteResolution: (id: number) =>
    api.delete<{ message: string }>(`/assemblees/resolutions/${id}`),

  getPresences: (agId: number) =>
    api.get<{ data: PresenceAG[] }>(`/assemblees/${agId}/presences`),

  setPresence: (data: Partial<PresenceAG>) =>
    api.post<ApiResponse<PresenceAG>>('/assemblees/presences', data),

  deletePresence: (id: number) =>
    api.delete<{ message: string }>(`/assemblees/presences/${id}`),
}
