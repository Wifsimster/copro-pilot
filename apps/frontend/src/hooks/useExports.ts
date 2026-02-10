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
  return useMutation({
    mutationFn: async (budgetId: number) => {
      const blob = await exportsApi.budgetPdf(budgetId)
      downloadBlob(blob, `budget-previsionnel-${budgetId}.pdf`)
    },
  })
}

export function useExportAppelFondsPdf() {
  return useMutation({
    mutationFn: async (appelId: number) => {
      const blob = await exportsApi.appelFondsPdf(appelId)
      downloadBlob(blob, `appel-fonds-${appelId}.pdf`)
    },
  })
}

export function useExportFeuillePresencePdf() {
  return useMutation({
    mutationFn: async (agId: number) => {
      const blob = await exportsApi.feuillePresencePdf(agId)
      downloadBlob(blob, `feuille-presence-ag-${agId}.pdf`)
    },
  })
}

export function useExportCarnetEntretienPdf() {
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.carnetEntretienPdf(coproprieteId)
      downloadBlob(blob, `carnet-entretien-${coproprieteId}.pdf`)
    },
  })
}

export function useExportEtatImpayesPdf() {
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.etatImpayesPdf(coproprieteId)
      downloadBlob(blob, `etat-impayes-${coproprieteId}.pdf`)
    },
  })
}

export function useExportCoproprietairesExcel() {
  return useMutation({
    mutationFn: async (coproprieteId?: number) => {
      const blob = await exportsApi.coproprietairesExcel(coproprieteId)
      downloadBlob(blob, `coproprietaires${coproprieteId ? `-${coproprieteId}` : ''}.xlsx`)
    },
  })
}

export function useExportBalanceComptesExcel() {
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.balanceComptesExcel(coproprieteId)
      downloadBlob(blob, `balance-comptes-${coproprieteId}.xlsx`)
    },
  })
}

export function useExportEtatChargesExcel() {
  return useMutation({
    mutationFn: async (budgetId: number) => {
      const blob = await exportsApi.etatChargesExcel(budgetId)
      downloadBlob(blob, `etat-charges-${budgetId}.xlsx`)
    },
  })
}

export function useExportEtatImpayesExcel() {
  return useMutation({
    mutationFn: async (coproprieteId: number) => {
      const blob = await exportsApi.etatImpayesExcel(coproprieteId)
      downloadBlob(blob, `etat-impayes-${coproprieteId}.xlsx`)
    },
  })
}
