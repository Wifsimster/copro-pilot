import { CompteBancaireFormDialog } from '@/components/comptes-bancaires/CompteBancaireFormDialog'
import type { CompteBancaire } from '@/types'
import { Plus, Trash2, Pencil, CreditCard, CheckCircle, XCircle } from 'lucide-react'

const TYPE_COMPTE_LABELS: Record<string, string> = {
  courant: 'Courant',
  fonds_travaux: 'Fonds travaux',
  emprunt: 'Emprunt',
}

const TYPE_COMPTE_COLORS: Record<string, string> = {
  courant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  fonds_travaux: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  emprunt: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

type ComptesTabPanelProps = {
  comptes: CompteBancaire[] | undefined
  loadingComptes: boolean
  selectedCompteId: number | undefined
  selectedCoproId: number
  showCompteDialog: boolean
  editingCompte: CompteBancaire | null
  onNewCompte: () => void
  onSelectCompte: (id: number) => void
  onEditCompte: (compte: CompteBancaire) => void
  onDeleteCompte: (id: number) => void
  onCompteDialogOpenChange: (open: boolean) => void
  onCompteSubmit: (data: Partial<CompteBancaire>) => Promise<void>
  compteSubmitLoading: boolean
}

export function ComptesTabPanel({
  comptes,
  loadingComptes,
  selectedCompteId,
  selectedCoproId,
  showCompteDialog,
  editingCompte,
  onNewCompte,
  onSelectCompte,
  onEditCompte,
  onDeleteCompte,
  onCompteDialogOpenChange,
  onCompteSubmit,
  compteSubmitLoading,
}: ComptesTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Comptes bancaires</h2>
        <button type="button"
          onClick={onNewCompte}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouveau compte
        </button>
      </div>

      {loadingComptes ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !comptes || comptes.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <CreditCard className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun compte bancaire enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Banque</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">IBAN</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Solde</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((compte: CompteBancaire) => (
                <tr
                  key={compte.id}
                  className={`border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30 cursor-pointer ${
                    selectedCompteId === compte.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                  }`}
                  onClick={() => onSelectCompte(compte.id)}
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{compte.banque}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300 font-mono text-xs">{compte.iban}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COMPTE_COLORS[compte.type]}`}>
                      {TYPE_COMPTE_LABELS[compte.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={Number(compte.solde) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {Number(compte.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {compte.actif ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="size-3.5" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-stone-400">
                        <XCircle className="size-3.5" /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button type="button"
                        onClick={() => onEditCompte(compte)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDeleteCompte(compte.id)}
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

      <CompteBancaireFormDialog
        open={showCompteDialog}
        onOpenChange={onCompteDialogOpenChange}
        coproprieteId={selectedCoproId}
        defaultValues={editingCompte || undefined}
        title={editingCompte ? 'Modifier le compte bancaire' : 'Nouveau compte bancaire'}
        onSubmit={onCompteSubmit}
        isLoading={compteSubmitLoading}
      />
    </div>
  )
}
