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

export function useImporterBalance() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- writes accounting écritures on another page; no local query to update here
  return useMutation({
    mutationFn: ({
      coproprieteId,
      annee,
      lignes,
    }: {
      coproprieteId: number
      annee: number
      lignes: BalanceLine[]
    }) => repriseGestionApi.importerBalance(coproprieteId, annee, lignes),
  })
}
