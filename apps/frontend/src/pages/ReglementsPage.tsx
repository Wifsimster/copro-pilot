import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useReglementsByCopropriete,
  useCreateReglement,
  useUpdateReglement,
  useDeleteReglement,
  useArticlesByReglement,
  useCreateArticleReglement,
  useUpdateArticleReglement,
  useDeleteArticleReglement,
} from '@/hooks/useReglements'
import { ReglementFormDialog } from '@/components/reglements/ReglementFormDialog'
import { ArticleReglementFormDialog } from '@/components/reglements/ArticleReglementFormDialog'
import type { ReglementCopropriete, ArticleReglement } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { BookOpen, Plus, Pencil, Trash2, FileText, ListOrdered } from 'lucide-react'

const DESTINATION_LABELS: Record<string, string> = {
  habitation: 'Habitation',
  commerce: 'Commerce',
  mixte: 'Mixte',
}

const DESTINATION_COLORS: Record<string, string> = {
  habitation: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  commerce: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  mixte: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

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

type Tab = 'reglements' | 'articles'

export default function ReglementsPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [activeTab, setActiveTab] = useState<Tab>('reglements')
  const [showReglementDialog, setShowReglementDialog] = useState(false)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [editingReglement, setEditingReglement] = useState<ReglementCopropriete | null>(null)
  const [editingArticle, setEditingArticle] = useState<ArticleReglement | null>(null)
  const [selectedReglementId, setSelectedReglementId] = useState<number | undefined>(undefined)

  const { data: reglements, isLoading: loadingReglements } = useReglementsByCopropriete(selectedCoproId)
  const { data: articles, isLoading: loadingArticles } = useArticlesByReglement(selectedReglementId)
  const createReglement = useCreateReglement()
  const updateReglement = useUpdateReglement()
  const deleteReglement = useDeleteReglement()
  const createArticle = useCreateArticleReglement()
  const updateArticle = useUpdateArticleReglement()
  const deleteArticle = useDeleteArticleReglement()

  // Auto-select first reglement when switching to articles tab
  useEffect(() => {
    if (activeTab === 'articles' && reglements && reglements.length > 0 && !selectedReglementId) {
      setSelectedReglementId(reglements[0].id)
    }
  }, [activeTab, reglements, selectedReglementId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Reglement de copropriete</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion du reglement et de ses articles</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <NoCoproprieteSelected />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
            {([
              { key: 'reglements' as Tab, label: 'Reglements', icon: FileText },
              { key: 'articles' as Tab, label: 'Articles', icon: ListOrdered },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reglements tab */}
          {activeTab === 'reglements' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Reglements</h2>
                <button
                  onClick={() => setShowReglementDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau reglement
                </button>
              </div>

              {loadingReglements ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !reglements || reglements.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileText className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun reglement enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date d'etablissement</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Notaire</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Destination</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reglements.map((reglement: ReglementCopropriete) => (
                        <tr key={reglement.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {new Date(reglement.date_etablissement).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{reglement.notaire || '\u2014'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DESTINATION_COLORS[reglement.destination_immeuble]}`}>
                              {DESTINATION_LABELS[reglement.destination_immeuble]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {reglement.date_derniere_modification ? (
                              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Modifie le {new Date(reglement.date_derniere_modification).toLocaleDateString('fr-FR')}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Original
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingReglement(reglement); setShowReglementDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce reglement ?')) deleteReglement.mutate(reglement.id)
                                }}
                                className="rounded p-1 text-stone-400 hover:text-red-600"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <ReglementFormDialog
                open={showReglementDialog}
                onOpenChange={(open) => { setShowReglementDialog(open); if (!open) setEditingReglement(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingReglement || undefined}
                title={editingReglement ? 'Modifier le reglement' : 'Nouveau reglement'}
                onSubmit={async (data) => {
                  if (editingReglement) {
                    await updateReglement.mutateAsync({ id: editingReglement.id, data })
                  } else {
                    await createReglement.mutateAsync(data)
                  }
                  setShowReglementDialog(false)
                  setEditingReglement(null)
                }}
                isLoading={editingReglement ? updateReglement.isPending : createReglement.isPending}
              />
            </div>
          )}

          {/* Articles tab */}
          {activeTab === 'articles' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Articles</h2>
                  {reglements && reglements.length > 0 && (
                    <select
                      value={selectedReglementId || ''}
                      onChange={(e) => setSelectedReglementId(e.target.value ? Number(e.target.value) : undefined)}
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
                  <button
                    onClick={() => setShowArticleDialog(true)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvel article
                  </button>
                )}
              </div>

              {!selectedReglementId ? (
                <div className="flex flex-col items-center py-12">
                  <BookOpen className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un reglement pour voir ses articles</p>
                </div>
              ) : loadingArticles ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !articles || articles.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <ListOrdered className="h-10 w-10 text-stone-300 dark:text-stone-600" />
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
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
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
                              <button
                                onClick={() => { setEditingArticle(article); setShowArticleDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cet article ?')) deleteArticle.mutate(article.id)
                                }}
                                className="rounded p-1 text-stone-400 hover:text-red-600"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
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
                  onOpenChange={(open) => { setShowArticleDialog(open); if (!open) setEditingArticle(null) }}
                  reglementId={selectedReglementId}
                  defaultValues={editingArticle || undefined}
                  title={editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
                  onSubmit={async (data) => {
                    if (editingArticle) {
                      await updateArticle.mutateAsync({ id: editingArticle.id, data })
                    } else {
                      await createArticle.mutateAsync(data)
                    }
                    setShowArticleDialog(false)
                    setEditingArticle(null)
                  }}
                  isLoading={editingArticle ? updateArticle.isPending : createArticle.isPending}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
