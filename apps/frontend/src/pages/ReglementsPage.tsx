import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
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
import { ReglementsTab } from '@/components/reglements/ReglementsTab'
import { ArticlesTab } from '@/components/reglements/ArticlesTab'
import type { ReglementCopropriete, ArticleReglement } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { FileText, ListOrdered } from 'lucide-react'

type Tab = 'reglements' | 'articles'

export default function ReglementsPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [ui, setUi] = useState<{
    activeTab: Tab
    showReglementDialog: boolean
    showArticleDialog: boolean
    editingReglement: ReglementCopropriete | null
    editingArticle: ArticleReglement | null
    selectedReglementId: number | undefined
    deleteTarget: { type: 'reglement' | 'article', id: number } | null
  }>({
    activeTab: 'reglements',
    showReglementDialog: false,
    showArticleDialog: false,
    editingReglement: null,
    editingArticle: null,
    selectedReglementId: undefined,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, showReglementDialog, showArticleDialog, editingReglement, editingArticle, selectedReglementId, deleteTarget } = ui

  const { data: reglements, isLoading: loadingReglements } = useReglementsByCopropriete(selectedCoproId)
  const { data: articles, isLoading: loadingArticles } = useArticlesByReglement(selectedReglementId)
  const createReglement = useCreateReglement()
  const updateReglement = useUpdateReglement()
  const deleteReglement = useDeleteReglement()
  const createArticle = useCreateArticleReglement()
  const updateArticle = useUpdateArticleReglement()
  const deleteArticle = useDeleteArticleReglement()

  // Switch tabs, auto-selecting the first reglement the first time the user
  // opens the articles tab (handled here rather than in an effect).
  const handleTabChange = (tab: Tab) => {
    patchUi({ activeTab: tab })
    if (
      tab === 'articles' &&
      !selectedReglementId &&
      reglements &&
      reglements.length > 0
    ) {
      patchUi({ selectedReglementId: reglements[0].id })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Règlement de copropriété</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion du règlement et de ses articles</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <NoCoproprieteSelected />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
            {([
              { key: 'reglements' as Tab, label: 'Règlements', icon: FileText },
              { key: 'articles' as Tab, label: 'Articles', icon: ListOrdered },
            ]).map((tab) => (
              <button type="button"
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reglements tab */}
          {activeTab === 'reglements' && (
            <ReglementsTab
              reglements={reglements}
              loadingReglements={loadingReglements}
              coproprieteId={selectedCoproId}
              showReglementDialog={showReglementDialog}
              editingReglement={editingReglement}
              onCreate={() => patchUi({ showReglementDialog: true })}
              onEdit={(reglement) => { patchUi({ editingReglement: reglement }); patchUi({ showReglementDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'reglement', id } })}
              onDialogOpenChange={(open) => { patchUi({ showReglementDialog: open }); if (!open) patchUi({ editingReglement: null }) }}
              onSubmit={async (data) => {
                if (editingReglement) {
                  await updateReglement.mutateAsync({ id: editingReglement.id, data })
                } else {
                  await createReglement.mutateAsync(data)
                }
                patchUi({ showReglementDialog: false })
                patchUi({ editingReglement: null })
              }}
              isLoading={editingReglement ? updateReglement.isPending : createReglement.isPending}
            />
          )}

          {/* Articles tab */}
          {activeTab === 'articles' && (
            <ArticlesTab
              reglements={reglements}
              articles={articles}
              loadingArticles={loadingArticles}
              selectedReglementId={selectedReglementId}
              showArticleDialog={showArticleDialog}
              editingArticle={editingArticle}
              onSelectReglement={(id) => patchUi({ selectedReglementId: id })}
              onCreate={() => patchUi({ showArticleDialog: true })}
              onEdit={(article) => { patchUi({ editingArticle: article }); patchUi({ showArticleDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'article', id } })}
              onDialogOpenChange={(open) => { patchUi({ showArticleDialog: open }); if (!open) patchUi({ editingArticle: null }) }}
              onSubmit={async (data) => {
                if (editingArticle) {
                  await updateArticle.mutateAsync({ id: editingArticle.id, data })
                } else {
                  await createArticle.mutateAsync(data)
                }
                patchUi({ showArticleDialog: false })
                patchUi({ editingArticle: null })
              }}
              isLoading={editingArticle ? updateArticle.isPending : createArticle.isPending}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && patchUi({ deleteTarget: null })}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === 'reglement') deleteReglement.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'article') deleteArticle.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </div>
  )
}
