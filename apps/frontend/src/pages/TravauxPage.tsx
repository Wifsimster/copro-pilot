import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useIncidentsByCopropriete, useCreateIncident, useUpdateIncident, useDeleteIncident } from '@/hooks/useIncidents'
import { useInterventionsByCopropriete, useCreateIntervention, useUpdateIntervention, useDeleteIntervention } from '@/hooks/useInterventions'
import { useCarnetEntretienByCopropriete, useCreateCarnetEntretien, useUpdateCarnetEntretien, useDeleteCarnetEntretien } from '@/hooks/useCarnetEntretien'
import { IncidentFormDialog } from '@/components/incidents/IncidentFormDialog'
import { InterventionFormDialog } from '@/components/incidents/InterventionFormDialog'
import { CarnetEntretienFormDialog } from '@/components/incidents/CarnetEntretienFormDialog'
import type { Incident, Intervention, CarnetEntretien } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { Wrench, Plus, Trash2, Pencil, AlertTriangle, Hammer, BookOpen } from 'lucide-react'

const URGENCE_LABELS: Record<string, string> = {
  faible: 'Faible',
  moyenne: 'Moyenne',
  haute: 'Haute',
  critique: 'Critique',
}

const URGENCE_COLORS: Record<string, string> = {
  faible: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  moyenne: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUT_INCIDENT_LABELS: Record<string, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Resolu',
  ferme: 'Ferme',
}

const STATUT_INCIDENT_COLORS: Record<string, string> = {
  ouvert: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolu: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ferme: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

const STATUT_INTERVENTION_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  planifiee: 'Planifiee',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
}

const STATUT_INTERVENTION_COLORS: Record<string, string> = {
  en_attente: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  planifiee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

type Tab = 'incidents' | 'interventions' | 'carnet'

export default function TravauxPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])
  const [activeTab, setActiveTab] = useState<Tab>('incidents')
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)
  const [showInterventionDialog, setShowInterventionDialog] = useState(false)
  const [showCarnetDialog, setShowCarnetDialog] = useState(false)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null)

  const { data: incidents, isLoading: loadingIncidents } = useIncidentsByCopropriete(selectedCoproId)
  const { data: interventions, isLoading: loadingInterventions } = useInterventionsByCopropriete(selectedCoproId)
  const { data: carnetEntretien, isLoading: loadingCarnet } = useCarnetEntretienByCopropriete(selectedCoproId)
  const createIncident = useCreateIncident()
  const updateIncident = useUpdateIncident()
  const deleteIncident = useDeleteIncident()
  const createIntervention = useCreateIntervention()
  const updateIntervention = useUpdateIntervention()
  const deleteIntervention = useDeleteIntervention()
  const createCarnet = useCreateCarnetEntretien()
  const updateCarnet = useUpdateCarnetEntretien()
  const deleteCarnet = useDeleteCarnetEntretien()
  const [editingCarnet, setEditingCarnet] = useState<CarnetEntretien | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Travaux & Incidents</h1>
          <p className="text-stone-500 dark:text-stone-400">Suivi des incidents, interventions et carnet d'entretien</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <NoCoproprieteSelected />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
            {([
              { key: 'incidents' as Tab, label: 'Incidents', icon: AlertTriangle },
              { key: 'interventions' as Tab, label: 'Interventions', icon: Hammer },
              { key: 'carnet' as Tab, label: "Carnet d'entretien", icon: BookOpen },
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

          {/* Incidents tab */}
          {activeTab === 'incidents' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Incidents</h2>
                <button
                  onClick={() => setShowIncidentDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Signaler un incident
                </button>
              </div>

              {loadingIncidents ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !incidents || incidents.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <AlertTriangle className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun incident signale</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Titre</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Urgence</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((incident: Incident) => (
                        <tr key={incident.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{incident.titre}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{incident.categorie || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${URGENCE_COLORS[incident.urgence]}`}>
                              {URGENCE_LABELS[incident.urgence]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_INCIDENT_COLORS[incident.statut]}`}>
                              {STATUT_INCIDENT_LABELS[incident.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {new Date(incident.date_signalement).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingIncident(incident); setShowIncidentDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cet incident ?')) deleteIncident.mutate(incident.id)
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

              <IncidentFormDialog
                open={showIncidentDialog}
                onOpenChange={(open) => { setShowIncidentDialog(open); if (!open) setEditingIncident(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingIncident || undefined}
                title={editingIncident ? 'Modifier l\'incident' : 'Signaler un incident'}
                onSubmit={async (data) => {
                  if (editingIncident) {
                    await updateIncident.mutateAsync({ id: editingIncident.id, data })
                  } else {
                    await createIncident.mutateAsync(data)
                  }
                  setShowIncidentDialog(false)
                  setEditingIncident(null)
                }}
                isLoading={editingIncident ? updateIncident.isPending : createIncident.isPending}
              />
            </div>
          )}

          {/* Interventions tab */}
          {activeTab === 'interventions' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Interventions</h2>
                <button
                  onClick={() => setShowInterventionDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle intervention
                </button>
              </div>

              {loadingInterventions ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !interventions || interventions.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Hammer className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune intervention enregistree</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Devis</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Facture</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {interventions.map((inter: Intervention) => (
                        <tr key={inter.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="max-w-xs truncate px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {inter.description || '—'}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{inter.prestataire || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {inter.montant_devis
                              ? Number(inter.montant_devis).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {inter.montant_facture
                              ? Number(inter.montant_facture).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_INTERVENTION_COLORS[inter.statut]}`}>
                              {STATUT_INTERVENTION_LABELS[inter.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingIntervention(inter); setShowInterventionDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cette intervention ?')) deleteIntervention.mutate(inter.id)
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

              <InterventionFormDialog
                open={showInterventionDialog}
                onOpenChange={(open) => { setShowInterventionDialog(open); if (!open) setEditingIntervention(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingIntervention || undefined}
                title={editingIntervention ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
                onSubmit={async (data) => {
                  if (editingIntervention) {
                    await updateIntervention.mutateAsync({ id: editingIntervention.id, data })
                  } else {
                    await createIntervention.mutateAsync(data)
                  }
                  setShowInterventionDialog(false)
                  setEditingIntervention(null)
                }}
                isLoading={editingIntervention ? updateIntervention.isPending : createIntervention.isPending}
              />
            </div>
          )}

          {/* Carnet d'entretien tab */}
          {activeTab === 'carnet' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Carnet d'entretien</h2>
                <button
                  onClick={() => setShowCarnetDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle entree
                </button>
              </div>

              {loadingCarnet ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !carnetEntretien || carnetEntretien.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <BookOpen className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune entree dans le carnet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Titre</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carnetEntretien.map((entree: CarnetEntretien) => (
                        <tr key={entree.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{entree.titre}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{entree.categorie || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{entree.prestataire || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {entree.montant
                              ? Number(entree.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {new Date(entree.date_realisation).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingCarnet(entree); setShowCarnetDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cette entree ?')) deleteCarnet.mutate(entree.id)
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

              <CarnetEntretienFormDialog
                open={showCarnetDialog}
                onOpenChange={(open) => { setShowCarnetDialog(open); if (!open) setEditingCarnet(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingCarnet || undefined}
                title={editingCarnet ? 'Modifier l\'entree' : 'Nouvelle entree au carnet'}
                onSubmit={async (data) => {
                  if (editingCarnet) {
                    await updateCarnet.mutateAsync({ id: editingCarnet.id, data })
                  } else {
                    await createCarnet.mutateAsync(data)
                  }
                  setShowCarnetDialog(false)
                  setEditingCarnet(null)
                }}
                isLoading={editingCarnet ? updateCarnet.isPending : createCarnet.isPending}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
