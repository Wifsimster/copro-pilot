import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAssemblee, useCreateResolution, useUpdateResolution, useDeleteResolution, useSetPresence, useDeletePresence } from '@/hooks/useAssemblees'
import { ResolutionFormDialog } from '@/components/assemblees/ResolutionFormDialog'
import { PresenceFormDialog } from '@/components/assemblees/PresenceFormDialog'
import type { Resolution } from '@/types'
import { ArrowLeft, Plus, Trash2, Vote, Users, FileText } from 'lucide-react'

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiee',
  convoquee: 'Convoquee',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
}

const STATUT_COLORS: Record<string, string> = {
  planifiee: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  convoquee: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const MAJORITE_LABELS: Record<string, string> = {
  article_24: 'Art. 24',
  article_25: 'Art. 25',
  article_26: 'Art. 26',
  unanimite: 'Unanimite',
}

const RESULTAT_LABELS: Record<string, string> = {
  adoptee: 'Adoptee',
  rejetee: 'Rejetee',
  ajournee: 'Ajournee',
}

const RESULTAT_COLORS: Record<string, string> = {
  adoptee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejetee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ajournee: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

type Tab = 'resolutions' | 'presences'

export default function AssembleeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const agId = id ? parseInt(id) : undefined
  const { data: ag, isLoading } = useAssemblee(agId)
  const createResolution = useCreateResolution()
  const updateResolution = useUpdateResolution()
  const deleteResolution = useDeleteResolution()
  const setPresence = useSetPresence()
  const deletePresence = useDeletePresence()
  const [activeTab, setActiveTab] = useState<Tab>('resolutions')
  const [showResolutionDialog, setShowResolutionDialog] = useState(false)
  const [showPresenceDialog, setShowPresenceDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!ag) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-zinc-400">Assemblee generale non trouvee</p>
        <Link to="/assemblees" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour aux assemblees
        </Link>
      </div>
    )
  }

  const nextNumero = (ag.resolutions?.length || 0) + 1

  const handleSetResultat = async (resId: number, resultat: string) => {
    await updateResolution.mutateAsync({ id: resId, data: { resultat } as Partial<Resolution> })
  }

  const presenceStats = ag.presences ? {
    presents: ag.presences.filter((p) => p.statut === 'present').length,
    representes: ag.presences.filter((p) => p.statut === 'represente').length,
    absents: ag.presences.filter((p) => p.statut === 'absent').length,
    totalTantiemes: ag.presences.reduce((s, p) => s + (p.statut !== 'absent' ? p.tantiemes : 0), 0),
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/assemblees"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AG du {new Date(ag.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[ag.statut]}`}>
              {STATUT_LABELS[ag.statut]}
            </span>
          </div>
          <p className="text-gray-500 dark:text-zinc-400">
            {ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
            {ag.heure && ` — ${ag.heure}`}
            {ag.lieu && ` — ${ag.lieu}`}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Resolutions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{ag.resolutions?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Presents</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{presenceStats?.presents || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Representes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{presenceStats?.representes || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Tantiemes representes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{presenceStats?.totalTantiemes || 0}</p>
        </div>
      </div>

      {/* Ordre du jour */}
      {ag.ordre_du_jour && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Ordre du jour</h3>
          <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-zinc-300">{ag.ordre_du_jour}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setActiveTab('resolutions')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'resolutions'
              ? 'bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'
          }`}
        >
          <Vote className="h-4 w-4" />
          Resolutions
        </button>
        <button
          onClick={() => setActiveTab('presences')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'presences'
              ? 'bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'
          }`}
        >
          <Users className="h-4 w-4" />
          Presences
        </button>
      </div>

      {/* Resolutions tab */}
      {activeTab === 'resolutions' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resolutions</h2>
            <button
              onClick={() => setShowResolutionDialog(true)}
              disabled={createResolution.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!ag.resolutions || ag.resolutions.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <FileText className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune resolution enregistree</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-700/50">
              {ag.resolutions.map((res: Resolution) => (
                <div key={res.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">#{res.numero}</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-zinc-700 dark:text-zinc-300">
                          {MAJORITE_LABELS[res.majorite]}
                        </span>
                        {res.resultat && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RESULTAT_COLORS[res.resultat]}`}>
                            {RESULTAT_LABELS[res.resultat]}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{res.titre}</p>
                      {res.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{res.description}</p>
                      )}
                      {(res.voix_pour > 0 || res.voix_contre > 0 || res.abstentions > 0) && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-zinc-400">
                          <span className="text-green-600">Pour: {res.voix_pour}</span>
                          <span className="text-red-600">Contre: {res.voix_contre}</span>
                          <span>Abstentions: {res.abstentions}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!res.resultat && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSetResultat(res.id, 'adoptee')}
                            className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            Adopter
                          </button>
                          <button
                            onClick={() => handleSetResultat(res.id, 'rejetee')}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Supprimer cette resolution ?')) deleteResolution.mutate(res.id)
                        }}
                        className="rounded p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {agId && (
            <ResolutionFormDialog
              open={showResolutionDialog}
              onOpenChange={setShowResolutionDialog}
              agId={agId}
              numero={nextNumero}
              onSubmit={async (data) => {
                await createResolution.mutateAsync(data)
                setShowResolutionDialog(false)
              }}
              isLoading={createResolution.isPending}
            />
          )}
        </div>
      )}

      {/* Presences tab */}
      {activeTab === 'presences' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Feuille de presence</h2>
            <button
              onClick={() => setShowPresenceDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!ag.presences || ag.presences.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <Users className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune presence enregistree</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Coproprietaire</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Represente par</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Tantiemes</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {ag.presences.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {p.coproprietaire_prenom} {p.coproprietaire_nom}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.statut === 'present'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : p.statut === 'represente'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}>
                          {p.statut === 'present' ? 'Present' : p.statut === 'represente' ? 'Represente' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {p.represente_par_nom ? `${p.represente_par_prenom} ${p.represente_par_nom}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{p.tantiemes}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (window.confirm('Retirer cette presence ?')) deletePresence.mutate(p.id)
                          }}
                          className="rounded p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {agId && (
            <PresenceFormDialog
              open={showPresenceDialog}
              onOpenChange={setShowPresenceDialog}
              agId={agId}
              onSubmit={async (data) => {
                await setPresence.mutateAsync(data)
                setShowPresenceDialog(false)
              }}
              isLoading={setPresence.isPending}
            />
          )}
        </div>
      )}
    </div>
  )
}
