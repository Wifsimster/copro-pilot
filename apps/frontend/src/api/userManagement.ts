import { api } from './api'

export interface CoproprietaireUser {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  banned: boolean
  createdAt: string
  coproprietes: { id: number; nom: string }[]
}

export interface BulkCreationPreview {
  toCreate: {
    coproprietaireId: number
    nom: string
    prenom: string
    email: string
  }[]
  toLink: {
    coproprietaireId: number
    nom: string
    prenom: string
    email: string
    existingUserId: string
  }[]
  noEmail: {
    coproprietaireId: number
    nom: string
    prenom: string
  }[]
}

export interface BulkCreationResults {
  created: {
    coproprietaireId: number
    email: string
    userId: string
  }[]
  linked: {
    coproprietaireId: number
    email: string
    userId: string
  }[]
  errors: {
    coproprietaireId: number
    email: string
    error: string
  }[]
}

export const userManagementApi = {
  listCoproprietaireUsers: () =>
    api.get<{ data: CoproprietaireUser[] }>(
      '/user-management/coproprietaires'
    ),

  getUserDetails: (userId: string) =>
    api.get<{ data: CoproprietaireUser }>(
      `/user-management/coproprietaires/${userId}`
    ),

  triggerPasswordReset: (userId: string) =>
    api.post<{ message: string }>(
      '/user-management/reset-password',
      { userId }
    ),

  setPasswordDirectly: (
    userId: string,
    newPassword: string
  ) =>
    api.post<{ message: string }>(
      '/user-management/set-password',
      { userId, newPassword }
    ),

  getBulkCreationPreview: (coproprieteId: number) =>
    api.get<{ data: BulkCreationPreview }>(
      `/user-management/bulk-preview/${coproprieteId}`
    ),

  bulkCreateUsers: (coproprieteId: number) =>
    api.post<{ data: BulkCreationResults }>(
      `/user-management/bulk-create/${coproprieteId}`
    ),

  setInitialPassword: (newPassword: string) =>
    api.post<{ message: string }>(
      '/user-management/set-initial-password',
      { newPassword }
    ),
}
