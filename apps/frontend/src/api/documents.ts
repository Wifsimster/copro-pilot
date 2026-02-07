import { api } from './api'
import type { Document, ApiResponse } from '@/types'

export const documentsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Document[] }>(`/documents/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: Document }>(`/documents/${id}`),

  create: (data: Partial<Document>) =>
    api.post<ApiResponse<Document>>('/documents', data),

  update: (id: number, data: Partial<Document>) =>
    api.put<ApiResponse<Document>>(`/documents/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/documents/${id}`),
}
