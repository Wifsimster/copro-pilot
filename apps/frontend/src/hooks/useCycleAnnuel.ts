import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCycleAnnuel,
  getCycleAnnuelSummary,
  initializeCycle,
  refreshCycle,
  updateTache,
  generateAppelsFromBudget,
} from '@/api/cycle-annuel'
import type { TacheAnnuelle } from '@/types'

export function useCycleAnnuel(
  coproprieteId: number | undefined,
  annee?: number
) {
  return useQuery({
    queryKey: ['cycle-annuel', coproprieteId, annee],
    queryFn: () =>
      getCycleAnnuel(coproprieteId!, annee).then(
        (r) => r.data
      ),
    enabled: !!coproprieteId,
  })
}

export function useCycleAnnuelSummary(
  coproprieteId: number | undefined,
  annee?: number
) {
  return useQuery({
    queryKey: ['cycle-annuel-summary', coproprieteId, annee],
    queryFn: () =>
      getCycleAnnuelSummary(coproprieteId!, annee).then(
        (r) => r.data
      ),
    enabled: !!coproprieteId,
  })
}

export function useInitializeCycle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      coproprieteId,
      annee,
    }: {
      coproprieteId: number
      annee: number
    }) => initializeCycle(coproprieteId, annee),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycle-annuel'] })
      qc.invalidateQueries({
        queryKey: ['cycle-annuel-summary'],
      })
    },
  })
}

export function useRefreshCycle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      coproprieteId,
      annee,
    }: {
      coproprieteId: number
      annee?: number
    }) => refreshCycle(coproprieteId, annee),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycle-annuel'] })
      qc.invalidateQueries({
        queryKey: ['cycle-annuel-summary'],
      })
    },
  })
}

export function useUpdateTache() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<TacheAnnuelle>
    }) => updateTache(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycle-annuel'] })
      qc.invalidateQueries({
        queryKey: ['cycle-annuel-summary'],
      })
    },
  })
}

export function useGenerateAppelsFromBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (budgetId: number) =>
      generateAppelsFromBudget(budgetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appels-fonds'] })
      qc.invalidateQueries({ queryKey: ['cycle-annuel'] })
    },
  })
}
