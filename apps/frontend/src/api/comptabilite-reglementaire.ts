import { api } from './api'
import type {
  ExerciceComptable,
  CompteComptable,
  EcritureComptable,
  LigneBalance,
  LigneGrandLivre,
  ApiResponse,
} from '@/types'

export const comptabiliteApi = {
  // Exercices
  getExercices: (coproprieteId: number) =>
    api.get<{ data: ExerciceComptable[] }>(`/comptabilite/exercices/${coproprieteId}`),

  getExercice: (id: number) =>
    api.get<{ data: ExerciceComptable }>(`/comptabilite/exercice/${id}`),

  createExercice: (data: { copropriete_id: number; annee: number; date_debut: string; date_fin: string }) =>
    api.post<ApiResponse<ExerciceComptable>>('/comptabilite/exercice', data),

  clotureExercice: (id: number) =>
    api.post<ApiResponse<ExerciceComptable>>(`/comptabilite/exercice/${id}/cloture`),

  // Plan comptable
  getPlanComptable: (coproprieteId: number) =>
    api.get<{ data: CompteComptable[] }>(`/comptabilite/plan-comptable/${coproprieteId}`),

  initialiserPlanComptable: (coproprieteId: number) =>
    api.post<{ data: CompteComptable[]; message: string }>('/comptabilite/plan-comptable/initialiser', { copropriete_id: coproprieteId }),

  createCompte: (data: Partial<CompteComptable>) =>
    api.post<ApiResponse<CompteComptable>>('/comptabilite/plan-comptable', data),

  updateCompte: (id: number, data: Partial<CompteComptable>) =>
    api.put<ApiResponse<CompteComptable>>(`/comptabilite/plan-comptable/${id}`, data),

  // Journal / Ecritures
  getJournal: (exerciceId: number, params?: { dateDebut?: string; dateFin?: string; compteCode?: string }) =>
    api.get<{ data: EcritureComptable[] }>(`/comptabilite/journal/${exerciceId}`, params as Record<string, string>),

  createEcriture: (data: Partial<EcritureComptable>) =>
    api.post<ApiResponse<EcritureComptable>>('/comptabilite/ecriture', data),

  genererEcritures: (exerciceId: number) =>
    api.post<{ count: number; message: string }>(`/comptabilite/generer-ecritures/${exerciceId}`),

  // Grand livre & Balance
  getGrandLivre: (exerciceId: number) =>
    api.get<{ data: { totals: LigneGrandLivre[]; ecritures: EcritureComptable[] } }>(`/comptabilite/grand-livre/${exerciceId}`),

  getBalance: (exerciceId: number) =>
    api.get<{ data: LigneBalance[] }>(`/comptabilite/balance/${exerciceId}`),

  // Annexes
  getAnnexe1: (coproprieteId: number, annee: number) =>
    api.get<{ data: unknown }>(`/comptabilite/annexe1/${coproprieteId}`, { annee }),

  getAnnexe2: (coproprieteId: number) =>
    api.get<{ data: unknown }>(`/comptabilite/annexe2/${coproprieteId}`),

  getAnnexe3: (coproprieteId: number, annee: number) =>
    api.get<{ data: unknown }>(`/comptabilite/annexe3/${coproprieteId}`, { annee }),

  getAnnexe4: (coproprieteId: number, annee: number) =>
    api.get<{ data: unknown }>(`/comptabilite/annexe4/${coproprieteId}`, { annee }),

  getAnnexe5: (coproprieteId: number, annee: number) =>
    api.get<{ data: unknown }>(`/comptabilite/annexe5/${coproprieteId}`, { annee }),
}
