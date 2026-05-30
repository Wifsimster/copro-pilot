import { toast } from 'sonner'
import type { BudgetPrevisionnel } from '@/types'
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react'

type ExportMutation = { mutate: (arg: number) => void; isPending: boolean }

interface ExportsExcelSectionProps {
  budgets: BudgetPrevisionnel[] | undefined
  selectedCoproId: number
  selectedBudgetExcel: number | ''
  setSelectedBudgetExcel: (v: number | '') => void
  exportCoproprietairesExcel: ExportMutation
  exportBalanceComptesExcel: ExportMutation
  exportEtatChargesExcel: ExportMutation
  exportEtatImpayesExcel: ExportMutation
  handleExport: (mutate: ExportMutation, id: number | '', label: string) => void
  handleExportCopro: (mutate: ExportMutation, label: string) => void
}

export default function ExportsExcelSection({
  budgets,
  selectedCoproId,
  selectedBudgetExcel,
  setSelectedBudgetExcel,
  exportCoproprietairesExcel,
  exportBalanceComptesExcel,
  exportEtatChargesExcel,
  exportEtatImpayesExcel,
  handleExport,
  handleExportCopro,
}: ExportsExcelSectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Tableaux Excel</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Liste des coproprietaires Excel */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Liste des coproprietaires</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte la liste complete des coproprietaires au format Excel.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button type="button"
              onClick={() => {
                exportCoproprietairesExcel.mutate(selectedCoproId)
                toast.success('Export "Liste des coproprietaires" lance')
              }}
              disabled={exportCoproprietairesExcel.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportCoproprietairesExcel.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter Excel
            </button>
          </div>
        </div>

        {/* Balance des comptes Excel */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Balance des comptes</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte la balance des comptes de la copropriete au format Excel.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button type="button"
              onClick={() => handleExportCopro(exportBalanceComptesExcel, 'Balance des comptes')}
              disabled={exportBalanceComptesExcel.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportBalanceComptesExcel.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter Excel
            </button>
          </div>
        </div>

        {/* Etat des charges Excel */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Etat des charges</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte l'etat des charges par budget au format Excel.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <select
              value={selectedBudgetExcel}
              onChange={(e) => setSelectedBudgetExcel(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
            >
              <option value="">Selectionner un budget</option>
              {budgets?.map((b: BudgetPrevisionnel) => (
                <option key={b.id} value={b.id}>
                  Budget {b.annee} - {Number(b.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </option>
              ))}
            </select>
            <button type="button"
              onClick={() => handleExport(exportEtatChargesExcel, selectedBudgetExcel, 'Etat des charges')}
              disabled={selectedBudgetExcel === '' || exportEtatChargesExcel.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportEtatChargesExcel.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter Excel
            </button>
          </div>
        </div>

        {/* Etat des impayes Excel */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Etat des impayes</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte l'etat des impayes de la copropriete au format Excel.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button type="button"
              onClick={() => handleExportCopro(exportEtatImpayesExcel, 'Etat des impayes Excel')}
              disabled={exportEtatImpayesExcel.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportEtatImpayesExcel.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
