import { useMutation } from '@tanstack/react-query'
import { repriseGestionApi } from '@/api/reprise-gestion'
import type { BalanceLine } from '@/lib/repriseGestion'

export function useValiderBalance() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- read-only validation, nothing to invalidate
  return useMutation({
    mutationFn: ({
      coproprieteId,
      lignes,
    }: {
      coproprieteId: number
      lignes: BalanceLine[]
    }) => repriseGestionApi.validerBalance(coproprieteId, lignes),
  })
}
