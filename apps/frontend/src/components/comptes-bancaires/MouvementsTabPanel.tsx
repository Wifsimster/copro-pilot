import { MouvementBancaireFormDialog } from '@/components/comptes-bancaires/MouvementBancaireFormDialog'
import type { CompteBancaire, MouvementBancaire } from '@/types'
import { Plus, Trash2, Pencil, ChevronDown, ArrowDownUp, CheckCircle, XCircle } from 'lucide-react'

const TYPE_COMPTE_LABELS: Record<string, string> = {
  courant: 'Courant',
  fonds_travaux: 'Fonds travaux',
  emprunt: 'Emprunt',
}

const TYPE_MOUVEMENT_COLORS: Record<string, string> = {
  credit: 'text-green-600 dark:text-green-400',
  debit: 'text-red-600 dark:text-red-400',
}

type MouvementsTabPanelProps = {
  comptes: CompteBancaire[] | undefined
  mouvements: MouvementBancaire[] | undefined
  loadingMouvements: boolean
  selectedCompteId: number | undefined
  showMouvementDialog: boolean
  editingMouvement: MouvementBancaire | null
  onSelectCompteId: (id: number | undefined) => void
  onNewMouvement: () => void
  onEditMouvement: (mouvement: MouvementBancaire) => void
  onDeleteMouvement: (id: number) => void
  onMouvementDialogOpenChange: (open: boolean) => void
  onMouvementSubmit: (data: Partial<MouvementBancaire>) => Promise<void>
  mouvementSubmitLoading: boolean
}

export function MouvementsTabPanel({
  comptes,
  mouvements,
  loadingMouvements,
  selectedCompteId,
  showMouvementDialog,
  editingMouvement,
  onSelectCompteId,
  onNewMouvement,
  onEditMouvement,
  onDeleteMouvement,
  onMouvementDialogOpenChange,
  onMouvementSubmit,
  mouvementSubmitLoading,
}: MouvementsTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Mouvements bancaires</h2>
          {/* Compte selector */}
          <div className="relative">
            <select
              value={selectedCompteId || ''}
              onChange={(e) => onSelectCompteId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="appearance-none rounded-lg border border-stone-300 bg-white px-3 py-1.5 pr-8 text-sm text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
            >
              <option value="">Selectionner un compte…</option>
              {comptes?.map((c: CompteBancaire) => (
                <option key={c.id} value={c.id}>{c.banque} ({TYPE_COMPTE_LABELS[c.type]})</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-stone-400" />
          </div>
        </div>
        {selectedCompteId && (
          <button type="button"
            onClick={onNewMouvement}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
          >
            <Plus className="size-4" />
            Nouveau mouvement
          </button>
        )}
      </div>

      {!selectedCompteId ? (
        <div className="flex flex-col items-center py-12">
          <ArrowDownUp className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un compte pour voir ses mouvements</p>
        </div>
      ) : loadingMouvements ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !mouvements || mouvements.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <ArrowDownUp className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun mouvement enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Libelle</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Reference</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Rapproche</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map((mouvement: MouvementBancaire) => (
                <tr key={mouvement.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 text-stone-900 dark:text-white">
                    {new Date(mouvement.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{mouvement.libelle}</td>
                  <td className={`px-4 py-3 font-medium ${TYPE_MOUVEMENT_COLORS[mouvement.type]}`}>
                    {mouvement.type === 'credit' ? '+' : '-'}
                    {Number(mouvement.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{mouvement.categorie || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{mouvement.reference || '—'}</td>
                  <td className="px-4 py-3">
                    {mouvement.rapproche ? (
                      <CheckCircle className="size-4 text-green-500" />
                    ) : (
                      <XCircle className="size-4 text-stone-300 dark:text-stone-600" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEditMouvement(mouvement)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDeleteMouvement(mouvement.id)}
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

      {selectedCompteId && (
        <MouvementBancaireFormDialog
          open={showMouvementDialog}
          onOpenChange={onMouvementDialogOpenChange}
          compteId={selectedCompteId}
          defaultValues={editingMouvement || undefined}
          title={editingMouvement ? 'Modifier le mouvement' : 'Nouveau mouvement'}
          onSubmit={onMouvementSubmit}
          isLoading={mouvementSubmitLoading}
        />
      )}
    </div>
  )
}
