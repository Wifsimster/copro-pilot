import { api } from './api'
import type { SignatureRequest } from '@/types'

export interface RequestSignaturePayload {
  documentId: number
  agId?: number
  signatories: Array<{
    email: string
    nom: string
    prenom: string
    coproprietaire_id?: number
  }>
}

export const signaturesApi = {
  requestSignature: (data: RequestSignaturePayload) =>
    api.post<{ data: SignatureRequest; message: string }>('/signatures', data),

  getById: (id: number, sync?: boolean) =>
    api.get<{ data: SignatureRequest }>(
      `/signatures/${id}`,
      sync ? { sync: 'true' } : undefined
    ),

  getByDocument: (documentId: number) =>
    api.get<{ data: SignatureRequest[] }>(
      `/signatures/document/${documentId}`
    ),

  cancel: (id: number) =>
    api.post<{ data: SignatureRequest; message: string }>(
      `/signatures/${id}/cancel`
    ),
}
