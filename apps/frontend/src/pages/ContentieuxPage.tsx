import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useRelancesByCopropriete, useCreateRelance, useUpdateRelance, useDeleteRelance } from '@/hooks/useRelances'
import { useProceduresByCopropriete, useCreateProcedure, useUpdateProcedure, useDeleteProcedure } from '@/hooks/useProcedures'
import { RelanceFormDialog } from '@/components/contentieux/RelanceFormDialog'
import { ProcedureFormDialog } from '@/components/contentieux/ProcedureFormDialog'
import type { Relance, Procedure } from '@/types'
import { Scale, Plus, Trash2, Pencil, Mail } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { TabBar } from '@/components/layout/TabBar'

const TYPE_RELANCE_LABELS: Record<string, string> = {
  amiable: 'Amiable',
  mise_en_demeure: 'Mise en demeure',
  contentieux: 'Contentieux',
}

const TYPE_RELANCE_COLORS: Record<string, string> = {
  amiable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  mise_en_demeure: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  contentieux: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUT_RELANCE_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  envoyee: 'Envoyee',
  accusee_reception: 'Accusee reception',
  sans_effet: 'Sans effet',
}

const STATUT_RELANCE_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  envoyee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  accusee_reception: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  sans_effet: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUT_PROCEDURE_LABELS: Record<string, string> = {
  en_preparation: 'En preparation',
  en_cours: 'En cours',
  audience_fixee: 'Audience fixee',
  juge: 'Juge',
  execute: 'Execute',
  clos: 'Clos',
}

const STATUT_PROCEDURE_COLORS: Record<string, string> = {
  en_preparation: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  en_cours: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  audience_fixee: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  juge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  execute: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  clos: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

type Tab = 'relances' | 'procedures'

export default function ContentieuxPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])
  const [activeTab, setActiveTab] = useState<Tab>('relances')
  const [showRelanceDialog, setShowRelanceDialog] = useState(false)
  const [showProcedureDialog, setShowProcedureDialog] = useState(false)
  const [editingRelance, setEditingRelance] = useState<Relance | null>(null)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'relance' | 'procedure', id: number } | null>(null)

  const { data: relances, isLoading: loadingRelances, isError: isErrorRelances, error: errorRelances } = useRelancesByCopropriete(selectedCoproId)
  const { data: procedures, isLoading: loadingProcedures, isError: isErrorProcedures, error: errorProcedures } = useProceduresByCopropriete(selectedCoproId)
  const createRelance = useCreateRelance()
  const updateRelance = useUpdateRelance()
  const deleteRelance = useDeleteRelance()
  const createProcedure = useCreateProcedure()
  const updateProcedure = useUpdateProcedure()
  const deleteProcedure = useDeleteProcedure()

  const contentieuxError = errorRelances || errorProcedures
  const hasContentieuxError = isErrorRelances || isErrorProcedures

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Contentieux & Recouvrement</h1>
          <p className="text-stone-500 dark:text-stone-400">Suivi des relances et procedures de recouvrement des impayes</p>
        </div>
      </div>

      {hasContentieuxError && <ErrorAlert error={contentieuxError as Error} message="Impossible de charger les donnees contentieux" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Scale className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <TabBar
            tabs={[
              { key: 'relances', label: 'Relances', icon: Mail },
              { key: 'procedures', label: 'Procedures', icon: Scale },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as Tab)}
          />

          {/* Relances tab */}
          {activeTab === 'relances' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Relances</h2>
                <button type="button"
                  onClick={() => setShowRelanceDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouvelle relance
                </button>
              </div>

              {loadingRelances ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !relances || relances.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Mail className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune relance enregistree</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Coproprietaire</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant du</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Mode d'envoi</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {relances.map((relance: Relance) => (
                        <tr key={relance.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {relance.coproprietaire_nom && relance.coproprietaire_prenom
                              ? `${relance.coproprietaire_prenom} ${relance.coproprietaire_nom}`
                              : `#${relance.coproprietaire_id}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_RELANCE_COLORS[relance.type]}`}>
                              {TYPE_RELANCE_LABELS[relance.type]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {Number(relance.montant_du).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{relance.mode_envoi || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_RELANCE_COLORS[relance.statut]}`}>
                              {STATUT_RELANCE_LABELS[relance.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {new Date(relance.date_relance).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { setEditingRelance(relance); setShowRelanceDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button type="button"
                                onClick={() => setDeleteTarget({ type: 'relance', id: relance.id })}
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

              <RelanceFormDialog
                open={showRelanceDialog}
                onOpenChange={(open) => { setShowRelanceDialog(open); if (!open) setEditingRelance(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingRelance || undefined}
                title={editingRelance ? 'Modifier la relance' : 'Nouvelle relance'}
                onSubmit={async (data) => {
                  if (editingRelance) {
                    await updateRelance.mutateAsync({ id: editingRelance.id, data })
                  } else {
                    await createRelance.mutateAsync(data)
                  }
                  setShowRelanceDialog(false)
                  setEditingRelance(null)
                }}
                isLoading={editingRelance ? updateRelance.isPending : createRelance.isPending}
              />
            </div>
          )}

          {/* Procedures tab */}
          {activeTab === 'procedures' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Procedures</h2>
                <button type="button"
                  onClick={() => setShowProcedureDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle procedure
                </button>
              </div>

              {loadingProcedures ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !procedures || procedures.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Scale className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune procedure enregistree</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Coproprietaire</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Avocat</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Tribunal</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant reclame</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {procedures.map((procedure: Procedure) => (
                        <tr key={procedure.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {procedure.coproprietaire_nom && procedure.coproprietaire_prenom
                              ? `${procedure.coproprietaire_prenom} ${procedure.coproprietaire_nom}`
                              : `#${procedure.coproprietaire_id}`}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{procedure.avocat || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{procedure.tribunal || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {procedure.montant_reclame
                              ? Number(procedure.montant_reclame).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_PROCEDURE_COLORS[procedure.statut]}`}>
                              {STATUT_PROCEDURE_LABELS[procedure.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { setEditingProcedure(procedure); setShowProcedureDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button type="button"
                                onClick={() => setDeleteTarget({ type: 'procedure', id: procedure.id })}
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

              <ProcedureFormDialog
                open={showProcedureDialog}
                onOpenChange={(open) => { setShowProcedureDialog(open); if (!open) setEditingProcedure(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingProcedure || undefined}
                title={editingProcedure ? 'Modifier la procedure' : 'Nouvelle procedure'}
                onSubmit={async (data) => {
                  if (editingProcedure) {
                    await updateProcedure.mutateAsync({ id: editingProcedure.id, data })
                  } else {
                    await createProcedure.mutateAsync(data)
                  }
                  setShowProcedureDialog(false)
                  setEditingProcedure(null)
                }}
                isLoading={editingProcedure ? updateProcedure.isPending : createProcedure.isPending}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === 'relance') deleteRelance.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'procedure') deleteProcedure.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
