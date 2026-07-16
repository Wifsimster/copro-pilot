import { api } from './api'
import type { BalanceLine } from '@/lib/repriseGestion'

export interface BalanceValidation {
  valid: boolean
  totals: { debit: number; credit: number; ecart: number }
  lineErrors: { index: number; message: string }[]
  duplicateComptes: string[]
}

export const repriseGestionApi = {
  validerBalance: (coproprieteId: number, lignes: BalanceLine[]) =>
    api.post<{ data: BalanceValidation }>(
      '/reprise-gestion/valider-balance',
      { copropriete_id: coproprieteId, lignes }
    ),
}
