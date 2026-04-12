import { api } from './api'
import type {
  ExtranetProfil,
  ExtranetCompte,
  ExtranetChargeLigne,
  ExtranetDocuments,
  ExtranetConseilSyndical,
  ExtranetDashboard,
} from '@/types'

export const extranetApi = {
  getMonProfil: () =>
    api.get<{ data: ExtranetProfil }>('/extranet/mon-profil'),

  getEspaceDocuments: (coproprieteId: number) =>
    api.get<{ data: ExtranetDocuments }>(`/extranet/documents/${coproprieteId}`),

  getMonCompte: () =>
    api.get<{ data: ExtranetCompte }>('/extranet/mon-compte'),

  getMesCharges: () =>
    api.get<{ data: ExtranetChargeLigne[] }>('/extranet/mes-charges'),

  getMesAppelsFonds: () =>
    api.get<{ data: ExtranetChargeLigne[] }>('/extranet/mes-appels-fonds'),

  getMonFondsTravaux: () =>
    api.get<{ data: unknown[] }>('/extranet/mon-fonds-travaux'),

  getDonneesConseilSyndical: (coproprieteId: number) =>
    api.get<{ data: ExtranetConseilSyndical }>(`/extranet/conseil-syndical/${coproprieteId}`),

  getDashboard: () =>
    api.get<{ data: ExtranetDashboard }>('/extranet/dashboard'),

  updateMonProfil: (data: { telephone?: string; adresse_correspondance?: string }) =>
    api.put<{ data: ExtranetProfil; message: string }>('/extranet/mon-profil', data),

  updateMonCompte: (data: { name: string }) =>
    api.put<{ data: ExtranetCompte; message: string }>('/extranet/mon-compte', data),
}
