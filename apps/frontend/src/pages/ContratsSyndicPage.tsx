import { useState } from 'react'
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
  resilie: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  en_attente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

type Tab = 'contrats' | 'propositions'

export default function ContratsSyndicPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [activeTab, setActiveTab] = useState<Tab>('contrats')

  const [showContratDialog, setShowContratDialog] = useState(false)
  const [editingContrat, setEditingContrat] = useState<ContratSyndic | null>(null)
  const [showPropositionDialog, setShowPropositionDialog] = useState(false)
  const [editingProposition, setEditingProposition] = useState<PropositionSyndic | null>(null)

  const { data: contrats, isLoading: loadingContrats } = useContratsSyndicByCopropriete(selectedCoproId)
  const { data: propositions, isLoading: loadingPropositions } = usePropositionsSyndicByCopropriete(selectedCoproId)

  const createContrat = useCreateContratSyndic()
  const updateContrat = useUpdateContratSyndic()
  const deleteContrat = useDeleteContratSyndic()
  const createProposition = useCreatePropositionSyndic()
  const updateProposition = useUpdatePropositionSyndic()
  const deleteProposition = useDeletePropositionSyndic()

  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false
    const diff = new Date(dateStr).getTime() - Date.now()
    return diff > 0 && diff < 180 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contrat de syndic</h1>
          <p className="text-gray-500 dark:text-zinc-400">Gestion du contrat de syndic et mise en concurrence</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <FileSignature className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {([
              { key: 'contrats' as Tab, label: 'Contrats de syndic', icon: FileSignature },
              { key: 'propositions' as Tab, label: 'Mise en concurrence', icon: Users },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contrats tab */}
          {activeTab === 'contrats' && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contrats de syndic</h2>
                <button
                  onClick={() => setShowContratDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau contrat
                </button>
              </div>

              {loadingContrats ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !contrats || contrats.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileSignature className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun contrat de syndic enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Syndic</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Periode du mandat</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Forfait annuel</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contrats.map((contrat: ContratSyndic) => (
                        <tr key={contrat.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {contrat.syndic_nom}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            <div className="flex items-center gap-1">
                              {new Date(contrat.date_debut).toLocaleDateString('fr-FR')}
                              <span className="text-gray-400">→</span>
                              <span className={isExpiringSoon(contrat.date_fin) ? 'text-orange-500 font-medium' : ''}>
                                {new Date(contrat.date_fin).toLocaleDateString('fr-FR')}
                              </span>
                              {isExpiringSoon(contrat.date_fin) && (
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
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
                              <button
                                onClick={() => { setEditingContrat(contrat); setShowContratDialog(true) }}
                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce contrat de syndic ?')) deleteContrat.mutate(contrat.id)
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600"
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
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Propositions de syndic</h2>
                <button
                  onClick={() => setShowPropositionDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle proposition
                </button>
              </div>

              {loadingPropositions ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !propositions || propositions.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Users className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune proposition de syndic enregistree</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Syndic</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Date de reception</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Montant propose</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Retenue</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {propositions.map((proposition: PropositionSyndic) => (
                        <tr key={proposition.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {proposition.syndic_nom}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {new Date(proposition.date_reception).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {proposition.montant_propose
                              ? Number(proposition.montant_propose).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {proposition.retenue ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Retenue
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-zinc-700 dark:text-zinc-400">
                                Non retenue
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingProposition(proposition); setShowPropositionDialog(true) }}
                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cette proposition ?')) deleteProposition.mutate(proposition.id)
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600"
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
    </div>
  )
}
