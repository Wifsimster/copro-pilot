import { api } from './api'
import type {
  ApiResponse,
  TacheAnnuelle,
  CycleAnnuelSummary,
} from '@/types'

export function getCycleAnnuel(
  coproprieteId: number,
  annee?: number
) {
  const params: Record<string, string | number> = {}
  if (annee) params.annee = annee
  return api.get<ApiResponse<TacheAnnuelle[]>>(
    `/cycle-annuel/copropriete/${coproprieteId}`,
    params
  )
}

export function getCycleAnnuelSummary(
  coproprieteId: number,
  annee?: number
) {
  const params: Record<string, string | number> = {}
  if (annee) params.annee = annee
  return api.get<ApiResponse<CycleAnnuelSummary>>(
    `/cycle-annuel/copropriete/${coproprieteId}/summary`,
    params
  )
}

export function initializeCycle(
  coproprieteId: number,
  annee: number
) {
  return api.post<ApiResponse<TacheAnnuelle[]>>(
    `/cycle-annuel/copropriete/${coproprieteId}/initialize`,
    { annee }
  )
}

export function refreshCycle(
  coproprieteId: number,
  annee?: number
) {
  const params: Record<string, string | number> = {}
  if (annee) params.annee = annee
  return api.post<ApiResponse<TacheAnnuelle[]>>(
    `/cycle-annuel/copropriete/${coproprieteId}/refresh?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}`
  )
}

export function updateTache(
  id: number,
  data: Partial<TacheAnnuelle>
) {
  return api.put<ApiResponse<TacheAnnuelle>>(
    `/cycle-annuel/${id}`,
    data
  )
}

export function generateAppelsFromBudget(budgetId: number) {
  return api.post<ApiResponse<unknown[]>>(
    `/appels-fonds/generate-from-budget/${budgetId}`
  )
}
