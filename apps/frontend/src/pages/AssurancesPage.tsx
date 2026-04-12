import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useAssurancesByCopropriete, useCreateAssurance, useUpdateAssurance, useDeleteAssurance } from '@/hooks/useAssurances'
import { useSinistresByCopropriete, useCreateSinistre, useUpdateSinistre, useDeleteSinistre } from '@/hooks/useSinistres'
import { useIncidentsByCopropriete } from '@/hooks/useIncidents'
import { AssuranceFormDialog } from '@/components/assurances/AssuranceFormDialog'
import { SinistreFormDialog } from '@/components/assurances/SinistreFormDialog'
import type { Assurance, Sinistre } from '@/types'
import { Shield, Plus, Trash2, Pencil, FileWarning } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  multirisque_immeuble: 'Multirisque immeuble',
  responsabilite_civile: 'Responsabilite civile',
  dommages_ouvrage: 'Dommages-ouvrage',
  protection_juridique: 'Protection juridique',
  autre: 'Autre',
}

const STATUT_ASSURANCE_LABELS: Record<string, string> = {
  actif: 'Actif',
  expire: 'Expire',
  resilie: 'Resilie',
}

const STATUT_ASSURANCE_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  resilie: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUT_SINISTRE_LABELS: Record<string, string> = {
  declare: 'Declare',
  en_instruction: 'En instruction',
  accepte: 'Accepte',
  refuse: 'Refuse',
  clos: 'Clos',
}

const STATUT_SINISTRE_COLORS: Record<string, string> = {
  declare: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_instruction: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepte: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  refuse: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  clos: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

type Tab = 'assurances' | 'sinistres'

export default function AssurancesPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])
  const [activeTab, setActiveTab] = useState<Tab>('assurances')
  const [showAssuranceDialog, setShowAssuranceDialog] = useState(false)
  const [showSinistreDialog, setShowSinistreDialog] = useState(false)
  const [editingAssurance, setEditingAssurance] = useState<Assurance | null>(null)
  const [editingSinistre, setEditingSinistre] = useState<Sinistre | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'assurance' | 'sinistre', id: number } | null>(null)

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
          <Shield className="h-12 w-12 text-stone-400 dark:text-stone-500" />
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

          {/* Assurances tab */}
          {activeTab === 'assurances' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Polices d'assurance</h2>
                <button
                  onClick={() => setShowAssuranceDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle assurance
                </button>
              </div>

              {loadingAssurances ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !assurances || assurances.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Shield className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune assurance enregistree</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Compagnie</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">N° police</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prime annuelle</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Echeance</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {assurances.map((assurance: Assurance) => (
                        <tr key={assurance.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{assurance.compagnie}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{assurance.numero_police || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{TYPE_LABELS[assurance.type] || assurance.type}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {assurance.prime_annuelle
                              ? Number(assurance.prime_annuelle).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_ASSURANCE_COLORS[assurance.statut]}`}>
                              {STATUT_ASSURANCE_LABELS[assurance.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {assurance.date_fin
                              ? new Date(assurance.date_fin).toLocaleDateString('fr-FR')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingAssurance(assurance); setShowAssuranceDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'assurance', id: assurance.id })}
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

              <AssuranceFormDialog
                open={showAssuranceDialog}
                onOpenChange={(open) => { setShowAssuranceDialog(open); if (!open) setEditingAssurance(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingAssurance || undefined}
                title={editingAssurance ? 'Modifier l\'assurance' : 'Nouvelle assurance'}
                onSubmit={async (data) => {
                  if (editingAssurance) {
                    await updateAssurance.mutateAsync({ id: editingAssurance.id, data })
                  } else {
                    await createAssurance.mutateAsync(data)
                  }
                  setShowAssuranceDialog(false)
                  setEditingAssurance(null)
                }}
                isLoading={editingAssurance ? updateAssurance.isPending : createAssurance.isPending}
              />
            </div>
          )}

          {/* Sinistres tab */}
          {activeTab === 'sinistres' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Sinistres</h2>
                <button
                  onClick={() => setShowSinistreDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Declarer un sinistre
                </button>
              </div>

              {loadingSinistres ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !sinistres || sinistres.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileWarning className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun sinistre enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">N° sinistre</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Assurance</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant estime</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Indemnise</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sinistres.map((sinistre: Sinistre) => (
                        <tr key={sinistre.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{sinistre.numero_sinistre || '—'}</td>
                          <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{sinistre.description || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{sinistre.assurance_compagnie || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {sinistre.montant_estime
                              ? Number(sinistre.montant_estime).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {sinistre.montant_indemnise
                              ? Number(sinistre.montant_indemnise).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_SINISTRE_COLORS[sinistre.statut]}`}>
                              {STATUT_SINISTRE_LABELS[sinistre.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {new Date(sinistre.date_sinistre).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingSinistre(sinistre); setShowSinistreDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'sinistre', id: sinistre.id })}
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

              <SinistreFormDialog
                open={showSinistreDialog}
                onOpenChange={(open) => { setShowSinistreDialog(open); if (!open) setEditingSinistre(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingSinistre || undefined}
                title={editingSinistre ? 'Modifier le sinistre' : 'Declarer un sinistre'}
                assurances={assurances || []}
                incidents={incidents || []}
                onSubmit={async (data) => {
                  if (editingSinistre) {
                    await updateSinistre.mutateAsync({ id: editingSinistre.id, data })
                  } else {
                    await createSinistre.mutateAsync(data)
                  }
                  setShowSinistreDialog(false)
                  setEditingSinistre(null)
                }}
                isLoading={editingSinistre ? updateSinistre.isPending : createSinistre.isPending}
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
          if (deleteTarget?.type === 'assurance') deleteAssurance.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'sinistre') deleteSinistre.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
