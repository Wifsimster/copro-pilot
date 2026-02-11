import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comptabiliteApi } from '@/api/comptabilite-reglementaire'
import type { CompteComptable, EcritureComptable } from '@/types'

export const COMPTABILITE_KEY = ['comptabilite-reglementaire'] as const

// Exercices
export function useExercices(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'exercices', coproprieteId],
    queryFn: async () => {
      const res = await comptabiliteApi.getExercices(coproprieteId!)
      return res.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateExercice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { copropriete_id: number; annee: number; date_debut: string; date_fin: string }) =>
      comptabiliteApi.createExercice(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPTABILITE_KEY }) },
  })
}

export function useClotureExercice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comptabiliteApi.clotureExercice(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPTABILITE_KEY }) },
  })
}

// Plan comptable
export function usePlanComptable(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'plan-comptable', coproprieteId],
    queryFn: async () => {
      const res = await comptabiliteApi.getPlanComptable(coproprieteId!)
      return res.data
    },
    enabled: !!coproprieteId,
  })
}

export function useInitialiserPlanComptable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (coproprieteId: number) => comptabiliteApi.initialiserPlanComptable(coproprieteId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPTABILITE_KEY }) },
  })
}

export function useCreateCompte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CompteComptable>) => comptabiliteApi.createCompte(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPTABILITE_KEY }) },
  })
}

// Journal
export function useJournal(exerciceId: number | undefined, params?: { dateDebut?: string; dateFin?: string; compteCode?: string }) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'journal', exerciceId, params],
    queryFn: async () => {
      const res = await comptabiliteApi.getJournal(exerciceId!, params)
      return res.data
    },
    enabled: !!exerciceId,
  })
}

export function useCreateEcriture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EcritureComptable>) => comptabiliteApi.createEcriture(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPTABILITE_KEY }) },
  })
}

export function useGenererEcritures() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exerciceId: number) => comptabiliteApi.genererEcritures(exerciceId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPTABILITE_KEY }) },
  })
}

// Grand livre & Balance
export function useGrandLivre(exerciceId: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'grand-livre', exerciceId],
    queryFn: async () => {
      const res = await comptabiliteApi.getGrandLivre(exerciceId!)
      return res.data
    },
    enabled: !!exerciceId,
  })
}

export function useBalance(exerciceId: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'balance', exerciceId],
    queryFn: async () => {
      const res = await comptabiliteApi.getBalance(exerciceId!)
      return res.data
    },
    enabled: !!exerciceId,
  })
}

// Annexes
export function useAnnexe1(coproprieteId: number | undefined, annee: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'annexe1', coproprieteId, annee],
    queryFn: async () => {
      const res = await comptabiliteApi.getAnnexe1(coproprieteId!, annee!)
      return res.data
    },
    enabled: !!coproprieteId && !!annee,
  })
}

export function useAnnexe2(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'annexe2', coproprieteId],
    queryFn: async () => {
      const res = await comptabiliteApi.getAnnexe2(coproprieteId!)
      return res.data
    },
    enabled: !!coproprieteId,
  })
}

export function useAnnexe3(coproprieteId: number | undefined, annee: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'annexe3', coproprieteId, annee],
    queryFn: async () => {
      const res = await comptabiliteApi.getAnnexe3(coproprieteId!, annee!)
      return res.data
    },
    enabled: !!coproprieteId && !!annee,
  })
}

export function useAnnexe4(coproprieteId: number | undefined, annee: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'annexe4', coproprieteId, annee],
    queryFn: async () => {
      const res = await comptabiliteApi.getAnnexe4(coproprieteId!, annee!)
      return res.data
    },
    enabled: !!coproprieteId && !!annee,
  })
}

export function useAnnexe5(coproprieteId: number | undefined, annee: number | undefined) {
  return useQuery({
    queryKey: [...COMPTABILITE_KEY, 'annexe5', coproprieteId, annee],
    queryFn: async () => {
      const res = await comptabiliteApi.getAnnexe5(coproprieteId!, annee!)
      return res.data
    },
    enabled: !!coproprieteId && !!annee,
  })
}
