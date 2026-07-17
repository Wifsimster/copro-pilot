import { api } from './api'
import type { BalanceLine } from '@/lib/repriseGestion'

export interface BalanceValidation {
  valid: boolean
  totals: { debit: number; credit: number; ecart: number }
  lineErrors: { index: number; message: string }[]
  duplicateComptes: string[]
}

export interface RepriseImportResult {
  exercice: { id: number; annee: number; date_debut: string }
  ecritures_count: number
}

export const repriseGestionApi = {
  validerBalance: (coproprieteId: number, lignes: BalanceLine[]) =>
    api.post<{ data: BalanceValidation }>(
      '/reprise-gestion/valider-balance',
      { copropriete_id: coproprieteId, lignes }
    ),

  importerBalance: (
    coproprieteId: number,
    annee: number,
    lignes: BalanceLine[]
  ) =>
    api.post<{ data: RepriseImportResult }>(
      '/reprise-gestion/importer-balance',
      { copropriete_id: coproprieteId, annee, lignes }
    ),
}
