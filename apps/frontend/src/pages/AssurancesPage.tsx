import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useAssurancesByCopropriete, useCreateAssurance, useUpdateAssurance, useDeleteAssurance } from '@/hooks/useAssurances'
import { useSinistresByCopropriete, useCreateSinistre, useUpdateSinistre, useDeleteSinistre } from '@/hooks/useSinistres'
import { useIncidentsByCopropriete } from '@/hooks/useIncidents'
import { AssurancesTab } from '@/components/assurances/AssurancesTab'
import { SinistresTab } from '@/components/assurances/SinistresTab'
import type { Assurance, Sinistre } from '@/types'
import { Shield, FileWarning } from 'lucide-react'

type Tab = 'assurances' | 'sinistres'

export default function AssurancesPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])
  const [ui, setUi] = useState<{
    activeTab: Tab
    showAssuranceDialog: boolean
    showSinistreDialog: boolean
    editingAssurance: Assurance | null
    editingSinistre: Sinistre | null
    deleteTarget: { type: 'assurance' | 'sinistre', id: number } | null
  }>({
    activeTab: 'assurances',
    showAssuranceDialog: false,
    showSinistreDialog: false,
    editingAssurance: null,
    editingSinistre: null,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, showAssuranceDialog, showSinistreDialog, editingAssurance, editingSinistre, deleteTarget } = ui

  const { data: assurances, isLoading: loadingAssurances } = useAssurancesByCopropriete(selectedCoproId)
  const { data: sinistres, isLoading: loadingSinistres } = useSinistresByCopropriete(selectedCoproId)
  const { data: incidents } = useIncidentsByCopropriete(selectedCoproId)
  const createAssurance = useCreateAssurance()
  const updateAssurance = useUpdateAssurance()
  const deleteAssurance = useDeleteAssurance()
  const createSinistre = useCreateSinistre()
  const updateSinistre = useUpdateSinistre()
  const deleteSinistre = useDeleteSinistre()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Assurances & Sinistres</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des polices d'assurance et suivi des sinistres</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Shield className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
            {([
              { key: 'assurances' as Tab, label: 'Assurances', icon: Shield },
              { key: 'sinistres' as Tab, label: 'Sinistres', icon: FileWarning },
            ]).map((tab) => (
              <button type="button"
                key={tab.key}
                onClick={() => patchUi({ activeTab: tab.key })}
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

          {/* Assurances tab */}
          {activeTab === 'assurances' && (
            <AssurancesTab
              assurances={assurances}
              loadingAssurances={loadingAssurances}
              showAssuranceDialog={showAssuranceDialog}
              editingAssurance={editingAssurance}
              selectedCoproId={selectedCoproId}
              isSubmitting={editingAssurance ? updateAssurance.isPending : createAssurance.isPending}
              onNew={() => patchUi({ showAssuranceDialog: true })}
              onEdit={(assurance) => { patchUi({ editingAssurance: assurance }); patchUi({ showAssuranceDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'assurance', id } })}
              onDialogOpenChange={(open) => { patchUi({ showAssuranceDialog: open }); if (!open) patchUi({ editingAssurance: null }) }}
              onSubmit={async (data) => {
                if (editingAssurance) {
                  await updateAssurance.mutateAsync({ id: editingAssurance.id, data })
                } else {
                  await createAssurance.mutateAsync(data)
                }
                patchUi({ showAssuranceDialog: false })
                patchUi({ editingAssurance: null })
              }}
            />
          )}

          {/* Sinistres tab */}
          {activeTab === 'sinistres' && (
            <SinistresTab
              sinistres={sinistres}
              loadingSinistres={loadingSinistres}
              showSinistreDialog={showSinistreDialog}
              editingSinistre={editingSinistre}
              selectedCoproId={selectedCoproId}
              assurances={assurances || []}
              incidents={incidents || []}
              isSubmitting={editingSinistre ? updateSinistre.isPending : createSinistre.isPending}
              onNew={() => patchUi({ showSinistreDialog: true })}
              onEdit={(sinistre) => { patchUi({ editingSinistre: sinistre }); patchUi({ showSinistreDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'sinistre', id } })}
              onDialogOpenChange={(open) => { patchUi({ showSinistreDialog: open }); if (!open) patchUi({ editingSinistre: null }) }}
              onSubmit={async (data) => {
                if (editingSinistre) {
                  await updateSinistre.mutateAsync({ id: editingSinistre.id, data })
                } else {
                  await createSinistre.mutateAsync(data)
                }
                patchUi({ showSinistreDialog: false })
                patchUi({ editingSinistre: null })
              }}
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
          if (deleteTarget?.type === 'assurance') deleteAssurance.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'sinistre') deleteSinistre.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </div>
  )
}
