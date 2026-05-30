import { useState } from 'react'
import { toast } from 'sonner'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useBudgetsByCopropriete } from '@/hooks/useBudgets'
import { useAssembleesByCopropriete } from '@/hooks/useAssemblees'
import {
  useExportBudgetPdf,
  useExportFeuillePresencePdf,
  useExportCarnetEntretienPdf,
  useExportEtatImpayesPdf,
  useExportCoproprietairesExcel,
  useExportBalanceComptesExcel,
  useExportEtatChargesExcel,
  useExportEtatImpayesExcel,
} from '@/hooks/useExports'
import type { BudgetPrevisionnel, AssembleeGenerale } from '@/types'
import { FileText, FileSpreadsheet, Download, Loader2, FileDown } from 'lucide-react'

export default function ExportsPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)

  const { data: budgets } = useBudgetsByCopropriete(selectedCoproId)
  const { data: assemblees } = useAssembleesByCopropriete(selectedCoproId)

  const [selectedBudgetPdf, setSelectedBudgetPdf] = useState<number | ''>('')
  const [selectedAgPdf, setSelectedAgPdf] = useState<number | ''>('')
  const [selectedBudgetExcel, setSelectedBudgetExcel] = useState<number | ''>('')

  const exportBudgetPdf = useExportBudgetPdf()
  const exportFeuillePresencePdf = useExportFeuillePresencePdf()
  const exportCarnetEntretienPdf = useExportCarnetEntretienPdf()
  const exportEtatImpayesPdf = useExportEtatImpayesPdf()
  const exportCoproprietairesExcel = useExportCoproprietairesExcel()
  const exportBalanceComptesExcel = useExportBalanceComptesExcel()
  const exportEtatChargesExcel = useExportEtatChargesExcel()
  const exportEtatImpayesExcel = useExportEtatImpayesExcel()

  const handleExport = (
    mutate: { mutate: (arg: number) => void; isPending: boolean },
    id: number | '',
    label: string,
  ) => {
    if (id === '') return
    mutate.mutate(id)
    toast.success(`Export "${label}" lance`)
  }

  const handleExportCopro = (
    mutate: { mutate: (arg: number) => void; isPending: boolean },
    label: string,
  ) => {
    if (!selectedCoproId) return
    mutate.mutate(selectedCoproId)
    toast.success(`Export "${label}" lance`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Exports & Rapports</h1>
        <p className="text-stone-500 dark:text-stone-400">
          Generez et telechargez vos documents PDF et tableaux Excel
        </p>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <FileDown className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
            Aucune copropriete selectionnee
          </h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            Selectionnez une copropriete dans le menu lateral pour acceder aux exports.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* PDF Section */}
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
                        Budget {b.annee} — {Number(b.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
                    <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
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
                        AG du {new Date(ag.date).toLocaleDateString('fr-FR')} — {ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
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
                    <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
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
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Exporter PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Excel Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Tableaux Excel</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Liste des coproprietaires Excel */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                    <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Exporter Excel
                  </button>
                </div>
              </div>

              {/* Balance des comptes Excel */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                    <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Exporter Excel
                  </button>
                </div>
              </div>

              {/* Etat des charges Excel */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                    <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                        Budget {b.annee} — {Number(b.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
        </div>
      )}
    </div>
  )
}
