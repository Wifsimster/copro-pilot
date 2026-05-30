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
import { FileDown } from 'lucide-react'
import ExportsPdfSection from '@/components/exports/ExportsPdfSection'
import ExportsExcelSection from '@/components/exports/ExportsExcelSection'

const handleExport = (
  mutate: { mutate: (arg: number) => void; isPending: boolean },
  id: number | '',
  label: string,
) => {
  if (id === '') return
  mutate.mutate(id)
  toast.success(`Export "${label}" lance`)
}

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
          <ExportsPdfSection
            budgets={budgets}
            assemblees={assemblees}
            selectedBudgetPdf={selectedBudgetPdf}
            setSelectedBudgetPdf={setSelectedBudgetPdf}
            selectedAgPdf={selectedAgPdf}
            setSelectedAgPdf={setSelectedAgPdf}
            exportBudgetPdf={exportBudgetPdf}
            exportFeuillePresencePdf={exportFeuillePresencePdf}
            exportCarnetEntretienPdf={exportCarnetEntretienPdf}
            exportEtatImpayesPdf={exportEtatImpayesPdf}
            handleExport={handleExport}
            handleExportCopro={handleExportCopro}
          />

          <ExportsExcelSection
            budgets={budgets}
            selectedCoproId={selectedCoproId}
            selectedBudgetExcel={selectedBudgetExcel}
            setSelectedBudgetExcel={setSelectedBudgetExcel}
            exportCoproprietairesExcel={exportCoproprietairesExcel}
            exportBalanceComptesExcel={exportBalanceComptesExcel}
            exportEtatChargesExcel={exportEtatChargesExcel}
            exportEtatImpayesExcel={exportEtatImpayesExcel}
            handleExport={handleExport}
            handleExportCopro={handleExportCopro}
          />
        </div>
      )}
    </div>
  )
}
