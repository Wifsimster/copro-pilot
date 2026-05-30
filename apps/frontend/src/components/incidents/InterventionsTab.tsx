import { InterventionFormDialog } from '@/components/incidents/InterventionFormDialog'
import type { Intervention } from '@/types'
import { Plus, Trash2, Pencil, Hammer } from 'lucide-react'

const STATUT_INTERVENTION_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  planifiee: 'Planifiee',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
}

const STATUT_INTERVENTION_COLORS: Record<string, string> = {
  en_attente: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  planifiee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface InterventionsTabProps {
  coproprieteId: number
  interventions: Intervention[] | undefined
  loading: boolean
  showDialog: boolean
  editing: Intervention | null
  onCreate: () => void
  onEdit: (inter: Intervention) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function InterventionsTab({
  coproprieteId,
  interventions,
  loading,
  showDialog,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isSubmitting,
}: InterventionsTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Interventions</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouvelle intervention
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !interventions || interventions.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <Hammer className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune intervention enregistree</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Devis</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Facture</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((inter: Intervention) => (
                <tr key={inter.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-900 dark:text-white">
                    {inter.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{inter.prestataire || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {inter.montant_devis
                      ? Number(inter.montant_devis).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {inter.montant_facture
                      ? Number(inter.montant_facture).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_INTERVENTION_COLORS[inter.statut]}`}>
                      {STATUT_INTERVENTION_LABELS[inter.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(inter)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(inter.id)}
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

      <InterventionFormDialog
        open={showDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={coproprieteId}
        defaultValues={editing || undefined}
        title={editing ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
