import { api } from './api'
import type {
  AgAnnexe1,
  AgAnnexe2,
  AgAnnexe3,
  AgAnnexe4,
  AgAnnexe5,
  AgReportPack,
} from '@/types'

type AnnexeResponseMap = {
  1: AgAnnexe1
  2: AgAnnexe2
  3: AgAnnexe3
  4: AgAnnexe4
  5: AgAnnexe5
}

export const agReportsApi = {
  getAnnexe: <N extends keyof AnnexeResponseMap>(
    coproprieteId: number,
    numero: N,
    annee: number
  ) =>
    api.get<{ data: AnnexeResponseMap[N] }>(
      `/ag-reports/${coproprieteId}/annexe/${numero}`,
      { annee }
    ),

  getPackComplet: (coproprieteId: number, annee: number) =>
    api.get<{ data: AgReportPack }>(
      `/ag-reports/${coproprieteId}/pack-complet`,
      { annee }
    ),
}
