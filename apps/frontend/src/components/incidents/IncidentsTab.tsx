import { IncidentFormDialog } from '@/components/incidents/IncidentFormDialog'
import type { Incident } from '@/types'
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react'

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

interface IncidentsTabProps {
  coproprieteId: number
  incidents: Incident[] | undefined
  loading: boolean
  showDialog: boolean
  editing: Incident | null
  onCreate: () => void
  onEdit: (incident: Incident) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function IncidentsTab({
  coproprieteId,
  incidents,
  loading,
  showDialog,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isSubmitting,
}: IncidentsTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Incidents</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Signaler un incident
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <AlertTriangle className="size-10 text-stone-300 dark:text-stone-600" />
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
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
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
                      <button type="button"
                        onClick={() => onEdit(incident)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(incident.id)}
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

      <IncidentFormDialog
        open={showDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={coproprieteId}
        defaultValues={editing || undefined}
        title={editing ? 'Modifier l\'incident' : 'Signaler un incident'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
