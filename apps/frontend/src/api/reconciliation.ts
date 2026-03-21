import { api } from './api'
import type { SuggestedMatch } from '@/types'

export const reconciliationApi = {
  getSuggestedMatches: (compteBancaireId: number) =>
    api.get<{ data: SuggestedMatch[] }>(
      `/reconciliation/compte/${compteBancaireId}/suggestions`
    ),

  confirmMatch: (
    mouvementId: number,
    appelFondsId: number
  ) =>
    api.post<{ data: unknown; message: string }>(
      '/reconciliation/confirmer',
      { mouvementId, appelFondsId }
    ),
}
