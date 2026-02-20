import { api } from './api'
import type { SyndicDashboard } from '@/types'

export interface DashboardStats {
  counts: {
    coproprietes: number
    coproprietaires: number
    incidents_ouverts: number
    prochaines_ag: number
    lots: number
    locataires: number
    budgets: number
    impayes: number
    fonds_travaux: number
  }
  recent_incidents: Array<{
    id: number
    copropriete_id: number
    titre: string
    urgence: string
    statut: string
    date_signalement: string
    copropriete_nom: string
  }>
  prochaines_ag: Array<{
    id: number
    date: string
    heure: string | null
    type: string
    statut: string
    copropriete_nom: string
  }>
}

export const statsApi = {
  getDashboard: () =>
    api.get<{ data: DashboardStats }>('/stats/dashboard'),
  getSyndicDashboard: (coproprieteId?: number) =>
    api.get<{ data: SyndicDashboard }>(
      '/stats/syndic-dashboard',
      coproprieteId
        ? { copropriete_id: coproprieteId }
        : undefined
    ),
}
