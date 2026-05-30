import { CarnetEntretienFormDialog } from '@/components/incidents/CarnetEntretienFormDialog'
import type { CarnetEntretien } from '@/types'
import { Plus, Trash2, Pencil, BookOpen } from 'lucide-react'

interface CarnetEntretienTabProps {
  coproprieteId: number
  carnetEntretien: CarnetEntretien[] | undefined
  loading: boolean
  showDialog: boolean
  editing: CarnetEntretien | null
  onCreate: () => void
  onEdit: (entree: CarnetEntretien) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function CarnetEntretienTab({
  coproprieteId,
  carnetEntretien,
  loading,
  showDialog,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isSubmitting,
}: CarnetEntretienTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Carnet d'entretien</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouvelle entree
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !carnetEntretien || carnetEntretien.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <BookOpen className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune entree dans le carnet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Titre</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {carnetEntretien.map((entree: CarnetEntretien) => (
                <tr key={entree.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{entree.titre}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{entree.categorie || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{entree.prestataire || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {entree.montant
                      ? Number(entree.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(entree.date_realisation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(entree)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(entree.id)}
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

      <CarnetEntretienFormDialog
        open={showDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={coproprieteId}
        defaultValues={editing || undefined}
        title={editing ? 'Modifier l\'entree' : 'Nouvelle entree au carnet'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
