import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useIncidentsByCopropriete, useCreateIncident, useUpdateIncident, useDeleteIncident } from '@/hooks/useIncidents'
import { useInterventionsByCopropriete, useCreateIntervention, useUpdateIntervention, useDeleteIntervention } from '@/hooks/useInterventions'
import { useCarnetEntretienByCopropriete, useCreateCarnetEntretien, useUpdateCarnetEntretien, useDeleteCarnetEntretien } from '@/hooks/useCarnetEntretien'
import { IncidentsTab } from '@/components/incidents/IncidentsTab'
import { InterventionsTab } from '@/components/incidents/InterventionsTab'
import { CarnetEntretienTab } from '@/components/incidents/CarnetEntretienTab'
import type { Incident, Intervention, CarnetEntretien } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { AlertTriangle, Hammer, BookOpen } from 'lucide-react'

type Tab = 'incidents' | 'interventions' | 'carnet'

export default function TravauxPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])
  const [ui, setUi] = useState<{
    activeTab: Tab
    showIncidentDialog: boolean
    showInterventionDialog: boolean
    showCarnetDialog: boolean
    editingIncident: Incident | null
    editingIntervention: Intervention | null
    editingCarnet: CarnetEntretien | null
    deleteTarget: { type: 'incident' | 'intervention' | 'carnet', id: number } | null
  }>({
    activeTab: 'incidents',
    showIncidentDialog: false,
    showInterventionDialog: false,
    showCarnetDialog: false,
    editingIncident: null,
    editingIntervention: null,
    editingCarnet: null,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, showIncidentDialog, showInterventionDialog, showCarnetDialog, editingIncident, editingIntervention, editingCarnet, deleteTarget } = ui

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

          {/* Incidents tab */}
          {activeTab === 'incidents' && (
            <IncidentsTab
              coproprieteId={selectedCoproId}
              incidents={incidents}
              loading={loadingIncidents}
              showDialog={showIncidentDialog}
              editing={editingIncident}
              onCreate={() => patchUi({ showIncidentDialog: true })}
              onEdit={(incident) => { patchUi({ editingIncident: incident }); patchUi({ showIncidentDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'incident', id } })}
              onDialogOpenChange={(open) => { patchUi({ showIncidentDialog: open }); if (!open) patchUi({ editingIncident: null }) }}
              onSubmit={async (data) => {
                if (editingIncident) {
                  await updateIncident.mutateAsync({ id: editingIncident.id, data })
                } else {
                  await createIncident.mutateAsync(data)
                }
                patchUi({ showIncidentDialog: false })
                patchUi({ editingIncident: null })
              }}
              isSubmitting={editingIncident ? updateIncident.isPending : createIncident.isPending}
            />
          )}

          {/* Interventions tab */}
          {activeTab === 'interventions' && (
            <InterventionsTab
              coproprieteId={selectedCoproId}
              interventions={interventions}
              loading={loadingInterventions}
              showDialog={showInterventionDialog}
              editing={editingIntervention}
              onCreate={() => patchUi({ showInterventionDialog: true })}
              onEdit={(inter) => { patchUi({ editingIntervention: inter }); patchUi({ showInterventionDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'intervention', id } })}
              onDialogOpenChange={(open) => { patchUi({ showInterventionDialog: open }); if (!open) patchUi({ editingIntervention: null }) }}
              onSubmit={async (data) => {
                if (editingIntervention) {
                  await updateIntervention.mutateAsync({ id: editingIntervention.id, data })
                } else {
                  await createIntervention.mutateAsync(data)
                }
                patchUi({ showInterventionDialog: false })
                patchUi({ editingIntervention: null })
              }}
              isSubmitting={editingIntervention ? updateIntervention.isPending : createIntervention.isPending}
            />
          )}

          {/* Carnet d'entretien tab */}
          {activeTab === 'carnet' && (
            <CarnetEntretienTab
              coproprieteId={selectedCoproId}
              carnetEntretien={carnetEntretien}
              loading={loadingCarnet}
              showDialog={showCarnetDialog}
              editing={editingCarnet}
              onCreate={() => patchUi({ showCarnetDialog: true })}
              onEdit={(entree) => { patchUi({ editingCarnet: entree }); patchUi({ showCarnetDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'carnet', id } })}
              onDialogOpenChange={(open) => { patchUi({ showCarnetDialog: open }); if (!open) patchUi({ editingCarnet: null }) }}
              onSubmit={async (data) => {
                if (editingCarnet) {
                  await updateCarnet.mutateAsync({ id: editingCarnet.id, data })
                } else {
                  await createCarnet.mutateAsync(data)
                }
                patchUi({ showCarnetDialog: false })
                patchUi({ editingCarnet: null })
              }}
              isSubmitting={editingCarnet ? updateCarnet.isPending : createCarnet.isPending}
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
          if (deleteTarget?.type === 'incident') deleteIncident.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'intervention') deleteIntervention.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'carnet') deleteCarnet.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </div>
  )
}
