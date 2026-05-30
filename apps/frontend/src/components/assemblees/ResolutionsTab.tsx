import { Plus, Trash2, Pencil, FileText } from 'lucide-react'
import { ResolutionFormDialog } from '@/components/assemblees/ResolutionFormDialog'
import type { Resolution } from '@/types'

const MAJORITE_LABELS: Record<string, string> = {
  article_24: 'Art. 24',
  article_25: 'Art. 25',
  article_26: 'Art. 26',
  unanimite: 'Unanimite',
}

const RESULTAT_LABELS: Record<string, string> = {
  adoptee: 'Adoptee',
  rejetee: 'Rejetee',
  ajournee: 'Ajournee',
}

const RESULTAT_COLORS: Record<string, string> = {
  adoptee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejetee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ajournee: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

interface ResolutionsTabProps {
  agId: number | undefined
  resolutions: Resolution[] | undefined
  nextNumero: number
  showResolutionDialog: boolean
  editingResolution: Resolution | null
  createIsPending: boolean
  updateIsPending: boolean
  onShowDialog: () => void
  onEdit: (res: Resolution) => void
  onDeleteTarget: (id: number) => void
  onSetResultat: (resId: number, resultat: string) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Resolution>) => Promise<void>
}

export function ResolutionsTab({
  agId,
  resolutions,
  nextNumero,
  showResolutionDialog,
  editingResolution,
  createIsPending,
  updateIsPending,
  onShowDialog,
  onEdit,
  onDeleteTarget,
  onSetResultat,
  onDialogOpenChange,
  onSubmit,
}: ResolutionsTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Resolutions</h2>
        <button type="button"
          onClick={onShowDialog}
          disabled={createIsPending}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {(!resolutions || resolutions.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <FileText className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune resolution enregistree</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
          {resolutions.map((res: Resolution) => (
            <div key={res.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900 dark:text-white">#{res.numero}</span>
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                      {MAJORITE_LABELS[res.majorite]}
                    </span>
                    {res.resultat && (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RESULTAT_COLORS[res.resultat]}`}>
                        {RESULTAT_LABELS[res.resultat]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-900 dark:text-white">{res.titre}</p>
                  {res.description && (
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{res.description}</p>
                  )}
                  {(res.voix_pour > 0 || res.voix_contre > 0 || res.abstentions > 0) && (
                    <div className="mt-2 flex gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <span className="text-green-600">Pour: {res.voix_pour}</span>
                      <span className="text-red-600">Contre: {res.voix_contre}</span>
                      <span>Abstentions: {res.abstentions}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {!res.resultat && (
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onSetResultat(res.id, 'adoptee')}
                        className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        Adopter
                      </button>
                      <button type="button"
                        onClick={() => onSetResultat(res.id, 'rejetee')}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                  <button type="button"
                    onClick={() => onEdit(res)}
                    className="rounded p-1 text-stone-400 hover:text-emerald-700"
                    aria-label="Modifier"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button type="button"
                    onClick={() => onDeleteTarget(res.id)}
                    className="rounded p-1 text-stone-400 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {agId && (
        <ResolutionFormDialog
          open={showResolutionDialog || !!editingResolution}
          onOpenChange={onDialogOpenChange}
          agId={agId}
          numero={nextNumero}
          defaultValues={editingResolution ?? undefined}
          title={editingResolution ? `Modifier la resolution #${editingResolution.numero}` : undefined}
          onSubmit={onSubmit}
          isLoading={editingResolution ? updateIsPending : createIsPending}
        />
      )}
    </div>
  )
}
