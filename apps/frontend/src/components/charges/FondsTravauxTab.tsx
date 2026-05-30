import { FondsTravauxFormDialog } from '@/components/charges/FondsTravauxFormDialog'
import type { FondsTravaux } from '@/types'
import { Plus, Trash2, Pencil, PiggyBank } from 'lucide-react'

interface FondsTravauxTabProps {
  coproprieteId: number
  fondsTravaux: FondsTravaux[] | undefined
  loading: boolean
  showDialog: boolean
  editing: FondsTravaux | null
  onCreate: () => void
  onEdit: (fonds: FondsTravaux) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function FondsTravauxTab({
  coproprieteId,
  fondsTravaux,
  loading,
  showDialog,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isSubmitting,
}: FondsTravauxTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Fonds travaux</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouveau fonds
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !fondsTravaux || fondsTravaux.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <PiggyBank className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun fonds travaux enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Annee</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Cotisation annuelle</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Solde</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {fondsTravaux.map((fonds: FondsTravaux) => (
                <tr key={fonds.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{fonds.annee}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {Number(fonds.cotisation_annuelle).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    <span className={Number(fonds.solde) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {Number(fonds.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(fonds)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(fonds.id)}
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

      <FondsTravauxFormDialog
        open={showDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={coproprieteId}
        defaultValues={editing || undefined}
        title={editing ? 'Modifier le fonds travaux' : 'Nouveau fonds travaux'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
