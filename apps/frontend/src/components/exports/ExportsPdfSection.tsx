import type { BudgetPrevisionnel, AssembleeGenerale } from '@/types'
import { FileText, Download, Loader2 } from 'lucide-react'

type ExportMutation = { mutate: (arg: number) => void; isPending: boolean }

interface ExportsPdfSectionProps {
  budgets: BudgetPrevisionnel[] | undefined
  assemblees: AssembleeGenerale[] | undefined
  selectedBudgetPdf: number | ''
  setSelectedBudgetPdf: (v: number | '') => void
  selectedAgPdf: number | ''
  setSelectedAgPdf: (v: number | '') => void
  exportBudgetPdf: ExportMutation
  exportFeuillePresencePdf: ExportMutation
  exportCarnetEntretienPdf: ExportMutation
  exportEtatImpayesPdf: ExportMutation
  handleExport: (mutate: ExportMutation, id: number | '', label: string) => void
  handleExportCopro: (mutate: ExportMutation, label: string) => void
}

export default function ExportsPdfSection({
  budgets,
  assemblees,
  selectedBudgetPdf,
  setSelectedBudgetPdf,
  selectedAgPdf,
  setSelectedAgPdf,
  exportBudgetPdf,
  exportFeuillePresencePdf,
  exportCarnetEntretienPdf,
  exportEtatImpayesPdf,
  handleExport,
  handleExportCopro,
}: ExportsPdfSectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Documents PDF</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Budget previsionnel PDF */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Budget previsionnel</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte le budget previsionnel avec le detail des postes de depenses.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <select
              value={selectedBudgetPdf}
              onChange={(e) => setSelectedBudgetPdf(e.target.value ? Number(e.target.value) : '')}
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
              onClick={() => handleExport(exportBudgetPdf, selectedBudgetPdf, 'Budget previsionnel')}
              disabled={selectedBudgetPdf === '' || exportBudgetPdf.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportBudgetPdf.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter PDF
            </button>
          </div>
        </div>

        {/* Appel de fonds PDF */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Appel de fonds</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                L'export PDF des appels de fonds est disponible depuis la page Charges & Comptabilite.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500 dark:bg-stone-700 dark:text-stone-400">
              Rendez-vous dans Charges &gt; Appels de fonds pour exporter un appel specifique.
            </p>
          </div>
        </div>

        {/* Feuille de presence AG PDF */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Feuille de presence AG</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte la feuille de presence d'une assemblee generale.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <select
              value={selectedAgPdf}
              onChange={(e) => setSelectedAgPdf(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
            >
              <option value="">Selectionner une AG</option>
              {assemblees?.map((ag: AssembleeGenerale) => (
                <option key={ag.id} value={ag.id}>
                  AG du {new Date(ag.date).toLocaleDateString('fr-FR')} - {ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
                </option>
              ))}
            </select>
            <button type="button"
              onClick={() => handleExport(exportFeuillePresencePdf, selectedAgPdf, 'Feuille de presence')}
              disabled={selectedAgPdf === '' || exportFeuillePresencePdf.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportFeuillePresencePdf.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter PDF
            </button>
          </div>
        </div>

        {/* Carnet d'entretien PDF */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Carnet d'entretien</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte le carnet d'entretien complet de la copropriete.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button type="button"
              onClick={() => handleExportCopro(exportCarnetEntretienPdf, 'Carnet d\'entretien')}
              disabled={exportCarnetEntretienPdf.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportCarnetEntretienPdf.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter PDF
            </button>
          </div>
        </div>

        {/* Etat des impayes PDF */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900 dark:text-white">Etat des impayes</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Exporte l'etat des impayes de la copropriete au format PDF.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button type="button"
              onClick={() => handleExportCopro(exportEtatImpayesPdf, 'Etat des impayes PDF')}
              disabled={exportEtatImpayesPdf.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportEtatImpayesPdf.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exporter PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
