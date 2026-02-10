const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api'

async function fetchExport(endpoint: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/exports${endpoint}`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error || `HTTP ${response.status}`)
  }
  return response.blob()
}

export const exportsApi = {
  // PDF exports
  budgetPdf: (budgetId: number) => fetchExport(`/budget/${budgetId}/pdf`),
  appelFondsPdf: (appelId: number) => fetchExport(`/appel-fonds/${appelId}/pdf`),
  feuillePresencePdf: (agId: number) => fetchExport(`/feuille-presence/${agId}/pdf`),
  carnetEntretienPdf: (coproprieteId: number) => fetchExport(`/carnet-entretien/${coproprieteId}/pdf`),
  etatImpayesPdf: (coproprieteId: number) => fetchExport(`/etat-impayes/${coproprieteId}/pdf`),
  // Excel exports
  coproprietairesExcel: (coproprieteId?: number) =>
    fetchExport(`/coproprietaires/excel${coproprieteId ? `?coproprieteId=${coproprieteId}` : ''}`),
  balanceComptesExcel: (coproprieteId: number) => fetchExport(`/balance-comptes/${coproprieteId}/excel`),
  etatChargesExcel: (budgetId: number) => fetchExport(`/etat-charges/${budgetId}/excel`),
  etatImpayesExcel: (coproprieteId: number) => fetchExport(`/etat-impayes/${coproprieteId}/excel`),
}
