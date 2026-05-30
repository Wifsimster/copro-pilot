import { BookOpen, Plus, Pencil, Trash2, ListOrdered } from 'lucide-react'
import { ArticleReglementFormDialog } from '@/components/reglements/ArticleReglementFormDialog'
import type { ReglementCopropriete, ArticleReglement } from '@/types'

const CATEGORIE_LABELS: Record<string, string> = {
  parties_privatives: 'Parties privatives',
  parties_communes: 'Parties communes',
  charges: 'Charges',
  usage: 'Usage',
  travaux: 'Travaux',
  conseil_syndical: 'Conseil syndical',
  ag: 'Assemblee generale',
  autre: 'Autre',
}

const CATEGORIE_COLORS: Record<string, string> = {
  parties_privatives: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  parties_communes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  charges: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  usage: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  travaux: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  conseil_syndical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  autre: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

type ArticlesTabProps = {
  reglements: ReglementCopropriete[] | undefined
  articles: ArticleReglement[] | undefined
  loadingArticles: boolean
  selectedReglementId: number | undefined
  showArticleDialog: boolean
  editingArticle: ArticleReglement | null
  onSelectReglement: (id: number | undefined) => void
  onCreate: () => void
  onEdit: (article: ArticleReglement) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<ArticleReglement>) => Promise<void>
  isLoading: boolean
}

export function ArticlesTab({
  reglements,
  articles,
  loadingArticles,
  selectedReglementId,
  showArticleDialog,
  editingArticle,
  onSelectReglement,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isLoading,
}: ArticlesTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Articles</h2>
          {reglements && reglements.length > 0 && (
            <select
              value={selectedReglementId || ''}
              onChange={(e) => onSelectReglement(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-700 dark:text-white"
            >
              {reglements.map((r: ReglementCopropriete) => (
                <option key={r.id} value={r.id}>
                  Reglement du {new Date(r.date_etablissement).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          )}
        </div>
        {selectedReglementId && (
          <button type="button"
            onClick={onCreate}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
          >
            <Plus className="size-4" />
            Nouvel article
          </button>
        )}
      </div>

      {!selectedReglementId ? (
        <div className="flex flex-col items-center py-12">
          <BookOpen className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un reglement pour voir ses articles</p>
        </div>
      ) : loadingArticles ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !articles || articles.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <ListOrdered className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun article enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Numero</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Titre</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Ordre</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article: ArticleReglement) => (
                <tr key={article.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{article.numero}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{article.titre}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[article.categorie]}`}>
                      {CATEGORIE_LABELS[article.categorie]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{article.ordre}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(article)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(article.id)}
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

      {selectedReglementId && (
        <ArticleReglementFormDialog
          open={showArticleDialog}
          onOpenChange={onDialogOpenChange}
          reglementId={selectedReglementId}
          defaultValues={editingArticle || undefined}
          title={editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
