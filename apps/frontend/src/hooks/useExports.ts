import { useMutation } from '@tanstack/react-query'
import { exportsApi } from '@/api/exports'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export function useExportBudgetPdf() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (budgetId: number) => {
      const blob = await exportsApi.budgetPdf(budgetId)
      downloadBlob(blob, `budget-previsionnel-${budgetId}.pdf`)
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useExportAppelFondsPdf() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (appelId: number) => {
      const blob = await exportsApi.appelFondsPdf(appelId)
      downloadBlob(blob, `appel-fonds-${appelId}.pdf`)
    },
  })
}

export function useExportFeuillePresencePdf() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (agId: number) => {
      const blob = await exportsApi.feuillePresencePdf(agId)
      downloadBlob(blob, `feuille-presence-ag-${agId}.pdf`)
    },
  })
}

export function useExportCarnetEntretienPdf() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.carnetEntretienPdf(coproprieteId)
      downloadBlob(blob, `carnet-entretien-${coproprieteId}.pdf`)
    },
  })
}

export function useExportEtatImpayesPdf() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.etatImpayesPdf(coproprieteId)
      downloadBlob(blob, `etat-impayes-${coproprieteId}.pdf`)
    },
  })
}

export function useExportCoproprietairesExcel() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (coproprieteId?: number) => {
      const blob = await exportsApi.coproprietairesExcel(coproprieteId)
      downloadBlob(blob, `coproprietaires${coproprieteId ? `-${coproprieteId}` : ''}.xlsx`)
    },
  })
}

export function useExportBalanceComptesExcel() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.balanceComptesExcel(coproprieteId)
      downloadBlob(blob, `balance-comptes-${coproprieteId}.xlsx`)
    },
  })
}

export function useExportEtatChargesExcel() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (budgetId: number) => {
      const blob = await exportsApi.etatChargesExcel(budgetId)
      downloadBlob(blob, `etat-charges-${budgetId}.xlsx`)
    },
  })
}

export function useExportEtatImpayesExcel() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- download only
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.etatImpayesExcel(coproprieteId)
      downloadBlob(blob, `etat-impayes-${coproprieteId}.xlsx`)
    },
  })
}
