import { api } from './api'
import type { Document, ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api'

export const documentsApi = {
  getAllByCopropriete: (coproprieteId: number, params?: { categorie?: string; entite_type?: string; search?: string }) =>
    api.get<{ data: Document[] }>(`/documents/copropriete/${coproprieteId}`, params as Record<string, string>),

  getById: (id: number) =>
    api.get<{ data: Document }>(`/documents/${id}`),

  getByEntity: (entiteType: string, entiteId: number) =>
    api.get<{ data: Document[] }>(`/documents/entity/${entiteType}/${entiteId}`),

  create: (data: Partial<Document>) =>
    api.post<ApiResponse<Document>>('/documents', data),

  upload: async (file: File, metadata: {
    copropriete_id: number
    nom: string
    categorie?: string
    description?: string
    entite_type?: string
    entite_id?: number
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new Error(errorBody.error || `HTTP ${response.status}`)
    }

    return response.json() as Promise<ApiResponse<Document>>
  },

  getDownloadUrl: (id: number) =>
    `${API_BASE_URL}/documents/${id}/download`,

  update: (id: number, data: Partial<Document>) =>
    api.put<ApiResponse<Document>>(`/documents/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/documents/${id}`),
}
