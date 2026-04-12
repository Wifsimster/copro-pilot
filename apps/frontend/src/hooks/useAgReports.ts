import { useQuery } from '@tanstack/react-query'
import { agReportsApi } from '@/api/ag-reports'

export const AG_REPORTS_QUERY_KEY = ['ag-reports'] as const

export function useAgAnnexe(
  coproprieteId: number | undefined,
  numero: 1 | 2 | 3 | 4 | 5,
  annee: number | undefined
) {
  return useQuery({
    queryKey: [
      ...AG_REPORTS_QUERY_KEY,
      'annexe',
      coproprieteId,
      numero,
      annee,
    ],
    queryFn: async () => {
      const response = await agReportsApi.getAnnexe(
        coproprieteId!,
        numero,
        annee!
      )
      return response.data
    },
    enabled: !!coproprieteId && !!annee,
  })
}

export function useAgPackComplet(
  coproprieteId: number | undefined,
  annee: number | undefined
) {
  return useQuery({
    queryKey: [
      ...AG_REPORTS_QUERY_KEY,
      'pack-complet',
      coproprieteId,
      annee,
    ],
    queryFn: async () => {
      const response = await agReportsApi.getPackComplet(
        coproprieteId!,
        annee!
      )
      return response.data
    },
    enabled: !!coproprieteId && !!annee,
  })
}
