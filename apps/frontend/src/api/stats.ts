import { api } from './api'

export interface DashboardStats {
  counts: {
    coproprietes: number
    coproprietaires: number
    incidents_ouverts: number
    prochaines_ag: number
  }
  recent_incidents: Array<{
    id: number
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
  getDashboard: () => api.get<{ data: DashboardStats }>('/stats/dashboard'),
}
