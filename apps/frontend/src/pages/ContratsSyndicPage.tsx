import { useState } from 'react'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useContratsSyndicByCopropriete,
  useCreateContratSyndic,
  useUpdateContratSyndic,
  useDeleteContratSyndic,
} from '@/hooks/useContratsSyndic'
import {
  usePropositionsSyndicByCopropriete,
  useCreatePropositionSyndic,
  useUpdatePropositionSyndic,
  useDeletePropositionSyndic,
} from '@/hooks/usePropositionsSyndic'
import { ContratSyndicFormDialog } from '@/components/contrats-syndic/ContratSyndicFormDialog'
import { PropositionSyndicFormDialog } from '@/components/contrats-syndic/PropositionSyndicFormDialog'
import type { ContratSyndic, PropositionSyndic } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { FileSignature, Plus, Trash2, Pencil, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'

const STATUT_LABELS: Record<string, string> = {
  en_cours: 'En cours',
  expire: 'Expire',
  resilie: 'Resilie',
  en_attente: 'En attente',
}

const STATUT_COLORS: Record<string, string> = {
  en_cours: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  resilie: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  en_attente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

type Tab = 'contrats' | 'propositions'

const isExpiringSoon = (dateStr: string | null) => {
  if (!dateStr) return false
  const diff = new Date(dateStr).getTime() - Date.now()
  return diff > 0 && diff < 180 * 24 * 60 * 60 * 1000
}

export default function ContratsSyndicPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [activeTab, setActiveTab] = useState<Tab>('contrats')

  const [showContratDialog, setShowContratDialog] = useState(false)
  const [editingContrat, setEditingContrat] = useState<ContratSyndic | null>(null)
  const [showPropositionDialog, setShowPropositionDialog] = useState(false)
  const [editingProposition, setEditingProposition] = useState<PropositionSyndic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'contrat' | 'proposition', id: number } | null>(null)

  const { data: contrats, isLoading: loadingContrats } = useContratsSyndicByCopropriete(selectedCoproId)
  const { data: propositions, isLoading: loadingPropositions } = usePropositionsSyndicByCopropriete(selectedCoproId)

  const createContrat = useCreateContratSyndic()
  const updateContrat = useUpdateContratSyndic()
  const deleteContrat = useDeleteContratSyndic()
  const createProposition = useCreatePropositionSyndic()
  const updateProposition = useUpdatePropositionSyndic()
  const deleteProposition = useDeletePropositionSyndic()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Contrat de syndic</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion du contrat de syndic et mise en concurrence</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <NoCoproprieteSelected />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
            {([
              { key: 'contrats' as Tab, label: 'Contrats de syndic', icon: FileSignature },
              { key: 'propositions' as Tab, label: 'Mise en concurrence', icon: Users },
            ]).map((tab) => (
              <button type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

          {/* Contrats tab */}
          {activeTab === 'contrats' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Contrats de syndic</h2>
                <button type="button"
                  onClick={() => setShowContratDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouveau contrat
                </button>
              </div>

              {loadingContrats ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !contrats || contrats.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileSignature className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun contrat de syndic enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Syndic</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Periode du mandat</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Forfait annuel</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contrats.map((contrat: ContratSyndic) => (
                        <tr key={contrat.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {contrat.syndic_nom}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            <div className="flex items-center gap-1">
                              {new Date(contrat.date_debut).toLocaleDateString('fr-FR')}
                              <span className="text-stone-400">→</span>
                              <span className={isExpiringSoon(contrat.date_fin) ? 'text-orange-500 font-medium' : ''}>
                                {new Date(contrat.date_fin).toLocaleDateString('fr-FR')}
                              </span>
                              {isExpiringSoon(contrat.date_fin) && (
                                <AlertTriangle className="size-3.5 text-orange-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {contrat.remuneration_forfait
                              ? Number(contrat.remuneration_forfait).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[contrat.statut]}`}>
                              {STATUT_LABELS[contrat.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { setEditingContrat(contrat); setShowContratDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => setDeleteTarget({ type: 'contrat', id: contrat.id })}
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

              <ContratSyndicFormDialog
                open={showContratDialog}
                onOpenChange={(open) => { setShowContratDialog(open); if (!open) setEditingContrat(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingContrat || undefined}
                title={editingContrat ? 'Modifier le contrat de syndic' : 'Nouveau contrat de syndic'}
                onSubmit={async (data) => {
                  if (editingContrat) {
                    await updateContrat.mutateAsync({ id: editingContrat.id, data })
                  } else {
                    await createContrat.mutateAsync(data)
                  }
                  setShowContratDialog(false)
                  setEditingContrat(null)
                }}
                isLoading={editingContrat ? updateContrat.isPending : createContrat.isPending}
              />
            </div>
          )}

          {/* Propositions tab */}
          {activeTab === 'propositions' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Propositions de syndic</h2>
                <button type="button"
                  onClick={() => setShowPropositionDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouvelle proposition
                </button>
              </div>

              {loadingPropositions ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !propositions || propositions.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Users className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune proposition de syndic enregistree</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Syndic</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date de reception</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant propose</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Retenue</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {propositions.map((proposition: PropositionSyndic) => (
                        <tr key={proposition.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {proposition.syndic_nom}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {new Date(proposition.date_reception).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {proposition.montant_propose
                              ? Number(proposition.montant_propose).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {proposition.retenue ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="size-3" />
                                Retenue
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                                Non retenue
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { setEditingProposition(proposition); setShowPropositionDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => setDeleteTarget({ type: 'proposition', id: proposition.id })}
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

              <PropositionSyndicFormDialog
                open={showPropositionDialog}
                onOpenChange={(open) => { setShowPropositionDialog(open); if (!open) setEditingProposition(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingProposition || undefined}
                title={editingProposition ? 'Modifier la proposition' : 'Nouvelle proposition'}
                onSubmit={async (data) => {
                  if (editingProposition) {
                    await updateProposition.mutateAsync({ id: editingProposition.id, data })
                  } else {
                    await createProposition.mutateAsync(data)
                  }
                  setShowPropositionDialog(false)
                  setEditingProposition(null)
                }}
                isLoading={editingProposition ? updateProposition.isPending : createProposition.isPending}
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
          if (deleteTarget?.type === 'contrat') deleteContrat.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'proposition') deleteProposition.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
