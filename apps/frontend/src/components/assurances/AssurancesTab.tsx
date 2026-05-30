import { Shield, Plus, Trash2, Pencil } from 'lucide-react'
import { AssuranceFormDialog } from '@/components/assurances/AssuranceFormDialog'
import type { Assurance } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  multirisque_immeuble: 'Multirisque immeuble',
  responsabilite_civile: 'Responsabilite civile',
  dommages_ouvrage: 'Dommages-ouvrage',
  protection_juridique: 'Protection juridique',
  autre: 'Autre',
}

const STATUT_ASSURANCE_LABELS: Record<string, string> = {
  actif: 'Actif',
  expire: 'Expire',
  resilie: 'Resilie',
}

const STATUT_ASSURANCE_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  resilie: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface AssurancesTabProps {
  assurances: Assurance[] | undefined
  loadingAssurances: boolean
  showAssuranceDialog: boolean
  editingAssurance: Assurance | null
  selectedCoproId: number
  isSubmitting: boolean
  onNew: () => void
  onEdit: (assurance: Assurance) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Assurance>) => Promise<void>
}

export function AssurancesTab({
  assurances,
  loadingAssurances,
  showAssuranceDialog,
  editingAssurance,
  selectedCoproId,
  isSubmitting,
  onNew,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
}: AssurancesTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Polices d'assurance</h2>
        <button type="button"
          onClick={onNew}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouvelle assurance
        </button>
      </div>

      {loadingAssurances ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !assurances || assurances.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <Shield className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune assurance enregistree</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Compagnie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">N° police</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prime annuelle</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Echeance</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {assurances.map((assurance: Assurance) => (
                <tr key={assurance.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{assurance.compagnie}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{assurance.numero_police || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{TYPE_LABELS[assurance.type] || assurance.type}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {assurance.prime_annuelle
                      ? Number(assurance.prime_annuelle).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_ASSURANCE_COLORS[assurance.statut]}`}>
                      {STATUT_ASSURANCE_LABELS[assurance.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {assurance.date_fin
                      ? new Date(assurance.date_fin).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(assurance)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(assurance.id)}
                        className="rounded p-1 text-stone-400 hover:text-red-600"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssuranceFormDialog
        open={showAssuranceDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={selectedCoproId}
        defaultValues={editingAssurance || undefined}
        title={editingAssurance ? 'Modifier l\'assurance' : 'Nouvelle assurance'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
