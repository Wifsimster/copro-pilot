import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { useAssemblee, useCreateResolution, useUpdateResolution, useDeleteResolution, useSetPresence, useDeletePresence, useGenererPv } from '@/hooks/useAssemblees'
import { useConvocationsByAg, useDelaiVerification, useCreateConvocation, useUpdateConvocation, useDeleteConvocation, useGenererDestinataires, useEnvoyerConvocation } from '@/hooks/useConvocations'
import { convocationsApi } from '@/api/convocations'
import { ResolutionFormDialog } from '@/components/assemblees/ResolutionFormDialog'
import { PresenceFormDialog } from '@/components/assemblees/PresenceFormDialog'
import { ConvocationFormDialog } from '@/components/assemblees/ConvocationFormDialog'
import type { Resolution, PresenceAG, ConvocationAG, DestinataireConvocation } from '@/types'
import { ArrowLeft, Plus, Trash2, Pencil, Vote, Users, FileText, Download, Loader2, Mail, Send, UserPlus, AlertTriangle, CheckCircle2, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CONVOCATIONS_QUERY_KEY } from '@/hooks/useConvocations'

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiee',
  convoquee: 'Convoquee',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
}

const STATUT_COLORS: Record<string, string> = {
  planifiee: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  convoquee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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

const CONVOC_STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  validee: 'Validee',
  envoyee: 'Envoyee',
  cloturee: 'Cloturee',
}

const CONVOC_STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  validee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  envoyee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cloturee: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const DEST_STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  envoyee: 'Envoyee',
  recue: 'Recue',
  ar_signe: 'AR signe',
}

const DEST_STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  envoyee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  recue: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ar_signe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const MODE_ENVOI_LABELS: Record<string, string> = {
  email: 'Email',
  courrier_recommande: 'Courrier recommande',
  les_deux: 'Email + Courrier',
}

type Tab = 'resolutions' | 'presences' | 'convocations'

export default function AssembleeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const agId = id ? parseInt(id) : undefined
  const { data: ag, isLoading } = useAssemblee(agId)
  const createResolution = useCreateResolution()
  const updateResolution = useUpdateResolution()
  const deleteResolution = useDeleteResolution()
  const setPresence = useSetPresence()
  const deletePresence = useDeletePresence()
  const genererPv = useGenererPv()

  // Convocations
  const { data: convocations } = useConvocationsByAg(agId)
  const { data: delai } = useDelaiVerification(agId)
  const createConvocation = useCreateConvocation()
  const updateConvocation = useUpdateConvocation()
  const deleteConvocation = useDeleteConvocation()
  const genererDestinataires = useGenererDestinataires()
  const envoyerConvocation = useEnvoyerConvocation()

  const [activeTab, setActiveTab] = useState<Tab>('resolutions')
  const [showResolutionDialog, setShowResolutionDialog] = useState(false)
  const [showPresenceDialog, setShowPresenceDialog] = useState(false)
  const [showConvocationDialog, setShowConvocationDialog] = useState(false)
  const [editingResolution, setEditingResolution] = useState<Resolution | null>(null)
  const [editingPresence, setEditingPresence] = useState<PresenceAG | null>(null)
  const [editingConvocation, setEditingConvocation] = useState<ConvocationAG | null>(null)
  const [expandedConvocation, setExpandedConvocation] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'resolution' | 'presence' | 'convocation', id: number } | null>(null)
  const [showSendConfirm, setShowSendConfirm] = useState<number | null>(null)

  // Fetch destinataires when expanding a convocation
  const { data: expandedDestinataires } = useQuery({
    queryKey: [...CONVOCATIONS_QUERY_KEY, 'destinataires', expandedConvocation],
    queryFn: async () => {
      const response = await convocationsApi.getDestinataires(expandedConvocation!)
      return response.data
    },
    enabled: !!expandedConvocation,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  if (!ag) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 dark:text-stone-400">Assemblee generale non trouvee</p>
        <Link to="/assemblees" className="mt-4 inline-block text-emerald-700 hover:underline">
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

  const handleEnvoyer = async (convocId: number) => {
    if (!delai?.valide) {
      setShowSendConfirm(convocId)
      return
    }
    await envoyerConvocation.mutateAsync(convocId)
  }

  const agLabel = `AG du ${new Date(ag.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Assemblées', href: '/assemblees' },
        { label: agLabel },
      ]} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/assemblees"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {agLabel}
            </h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[ag.statut]}`}>
              {STATUT_LABELS[ag.statut]}
            </span>
          </div>
          <p className="text-stone-500 dark:text-stone-400">
            {ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
            {ag.heure && ` — ${ag.heure}`}
            {ag.lieu && ` — ${ag.lieu}`}
          </p>
        </div>
        {ag.statut === 'terminee' && agId && (
          <button
            onClick={() => genererPv.mutate(agId)}
            disabled={genererPv.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {genererPv.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generer le PV
          </button>
        )}
      </div>

      {/* Delay warning */}
      {delai && ag.statut === 'planifiee' && (
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${
          delai.valide
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
            : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
        }`}>
          {delai.valide ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${delai.valide ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {delai.message}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Date limite d'envoi : {new Date(delai.date_limite_envoi).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Resolutions</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{ag.resolutions?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Presents</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{presenceStats?.presents || 0}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Representes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{presenceStats?.representes || 0}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Tantiemes representes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{presenceStats?.totalTantiemes || 0}</p>
        </div>
      </div>

      {/* Ordre du jour */}
      {ag.ordre_du_jour && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <h3 className="mb-2 font-semibold text-stone-900 dark:text-white">Ordre du jour</h3>
          <p className="whitespace-pre-wrap text-sm text-stone-600 dark:text-stone-300">{ag.ordre_du_jour}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        <button
          onClick={() => setActiveTab('resolutions')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'resolutions'
              ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
          }`}
        >
          <Vote className="h-4 w-4" />
          Resolutions
        </button>
        <button
          onClick={() => setActiveTab('presences')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'presences'
              ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
          }`}
        >
          <Users className="h-4 w-4" />
          Presences
        </button>
        <button
          onClick={() => setActiveTab('convocations')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'convocations'
              ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
          }`}
        >
          <Mail className="h-4 w-4" />
          Convocations
          {convocations && convocations.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {convocations.length}
            </span>
          )}
        </button>
      </div>

      {/* Resolutions tab */}
      {activeTab === 'resolutions' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Resolutions</h2>
            <button
              onClick={() => setShowResolutionDialog(true)}
              disabled={createResolution.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!ag.resolutions || ag.resolutions.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <FileText className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune resolution enregistree</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
              {ag.resolutions.map((res: Resolution) => (
                <div key={res.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900 dark:text-white">#{res.numero}</span>
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                          {MAJORITE_LABELS[res.majorite]}
                        </span>
                        {res.resultat && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RESULTAT_COLORS[res.resultat]}`}>
                            {RESULTAT_LABELS[res.resultat]}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-stone-900 dark:text-white">{res.titre}</p>
                      {res.description && (
                        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{res.description}</p>
                      )}
                      {(res.voix_pour > 0 || res.voix_contre > 0 || res.abstentions > 0) && (
                        <div className="mt-2 flex gap-4 text-xs text-stone-500 dark:text-stone-400">
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
                        onClick={() => setEditingResolution(res)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'resolution', id: res.id })}
                        className="rounded p-1 text-stone-400 hover:text-red-600"
                        aria-label="Supprimer"
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
              open={showResolutionDialog || !!editingResolution}
              onOpenChange={(open) => { setShowResolutionDialog(open); if (!open) setEditingResolution(null) }}
              agId={agId}
              numero={nextNumero}
              defaultValues={editingResolution ?? undefined}
              title={editingResolution ? `Modifier la resolution #${editingResolution.numero}` : undefined}
              onSubmit={async (data) => {
                if (editingResolution) {
                  await updateResolution.mutateAsync({ id: editingResolution.id, data })
                } else {
                  await createResolution.mutateAsync(data)
                }
                setShowResolutionDialog(false)
                setEditingResolution(null)
              }}
              isLoading={editingResolution ? updateResolution.isPending : createResolution.isPending}
            />
          )}
        </div>
      )}

      {/* Presences tab */}
      {activeTab === 'presences' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Feuille de presence</h2>
            <button
              onClick={() => setShowPresenceDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!ag.presences || ag.presences.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <Users className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune presence enregistree</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Coproprietaire</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Represente par</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Tantiemes</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {ag.presences.map((p) => (
                    <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                        {p.coproprietaire_prenom} {p.coproprietaire_nom}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.statut === 'present'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : p.statut === 'represente'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                        }`}>
                          {p.statut === 'present' ? 'Present' : p.statut === 'represente' ? 'Represente' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {p.represente_par_nom ? `${p.represente_par_prenom} ${p.represente_par_nom}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{p.tantiemes}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingPresence(p)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                            aria-label="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'presence', id: p.id })}
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

          {agId && (
            <PresenceFormDialog
              open={showPresenceDialog || !!editingPresence}
              onOpenChange={(open) => { setShowPresenceDialog(open); if (!open) setEditingPresence(null) }}
              agId={agId}
              defaultValues={editingPresence ?? undefined}
              title={editingPresence ? 'Modifier la presence' : 'Ajouter une presence'}
              onSubmit={async (data) => {
                await setPresence.mutateAsync(data)
                setShowPresenceDialog(false)
                setEditingPresence(null)
              }}
              isLoading={setPresence.isPending}
            />
          )}
        </div>
      )}

      {/* Convocations tab */}
      {activeTab === 'convocations' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Convocations</h2>
              <button
                onClick={() => setShowConvocationDialog(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" />
                Nouvelle convocation
              </button>
            </div>

            {(!convocations || convocations.length === 0) ? (
              <div className="flex flex-col items-center py-12">
                <Mail className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune convocation creee</p>
                <p className="text-xs text-stone-400 dark:text-stone-500">Creez une convocation pour envoyer aux coproprietaires</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
                {convocations.map((convoc: ConvocationAG) => (
                  <div key={convoc.id}>
                    <div className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONVOC_STATUT_COLORS[convoc.statut]}`}>
                              {CONVOC_STATUT_LABELS[convoc.statut]}
                            </span>
                            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                              {MODE_ENVOI_LABELS[convoc.mode_envoi]}
                            </span>
                          </div>
                          {convoc.date_envoi && (
                            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                              Envoyee le {new Date(convoc.date_envoi).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {convoc.notes && (
                            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{convoc.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {convoc.statut === 'brouillon' && (
                            <>
                              <button
                                onClick={() => genererDestinataires.mutate(convoc.id)}
                                disabled={genererDestinataires.isPending}
                                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                title="Generer les destinataires"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                Destinataires
                              </button>
                              <button
                                onClick={() => handleEnvoyer(convoc.id)}
                                disabled={envoyerConvocation.isPending}
                                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Envoyer la convocation"
                              >
                                {envoyerConvocation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                Envoyer
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setExpandedConvocation(expandedConvocation === convoc.id ? null : convoc.id)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                            title="Voir les destinataires"
                            aria-label="Voir les destinataires"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {convoc.statut === 'brouillon' && (
                            <button
                              onClick={() => setEditingConvocation(convoc)}
                              className="rounded p-1 text-stone-400 hover:text-emerald-700"
                              aria-label="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {convoc.statut === 'brouillon' && (
                            <button
                              onClick={() => setDeleteTarget({ type: 'convocation', id: convoc.id })}
                              className="rounded p-1 text-stone-400 hover:text-red-600"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded destinataires */}
                    {expandedConvocation === convoc.id && (
                      <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-3 dark:border-stone-700/50 dark:bg-stone-800/50">
                        <h4 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                          Destinataires
                          {expandedDestinataires && (
                            <span className="ml-1 text-stone-400">({expandedDestinataires.length})</span>
                          )}
                        </h4>
                        {!expandedDestinataires ? (
                          <div className="flex items-center gap-2 py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                            <span className="text-sm text-stone-400">Chargement...</span>
                          </div>
                        ) : expandedDestinataires.length === 0 ? (
                          <p className="text-sm text-stone-400 dark:text-stone-500">
                            Aucun destinataire. Cliquez "Destinataires" pour generer la liste.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-left text-stone-500 dark:text-stone-400">
                                  <th className="pb-2 pr-4">Nom</th>
                                  <th className="pb-2 pr-4">Email</th>
                                  <th className="pb-2 pr-4">Mode</th>
                                  <th className="pb-2 pr-4">Statut</th>
                                  <th className="pb-2 pr-4">Reception</th>
                                  <th className="pb-2">AR</th>
                                </tr>
                              </thead>
                              <tbody>
                                {expandedDestinataires.map((dest: DestinataireConvocation) => (
                                  <tr key={dest.id} className="border-t border-stone-100 dark:border-stone-700/50">
                                    <td className="py-2 pr-4 font-medium text-stone-900 dark:text-white">
                                      {dest.coproprietaire_prenom} {dest.coproprietaire_nom}
                                    </td>
                                    <td className="py-2 pr-4 text-stone-500 dark:text-stone-400">
                                      {dest.email_envoye_a || '—'}
                                    </td>
                                    <td className="py-2 pr-4 text-stone-500 dark:text-stone-400">
                                      {dest.mode_envoi ? (dest.mode_envoi === 'email' ? 'Email' : 'Courrier') : '—'}
                                    </td>
                                    <td className="py-2 pr-4">
                                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${DEST_STATUT_COLORS[dest.statut]}`}>
                                        {DEST_STATUT_LABELS[dest.statut]}
                                      </span>
                                    </td>
                                    <td className="py-2 pr-4 text-stone-500 dark:text-stone-400">
                                      {dest.date_reception ? new Date(dest.date_reception).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="py-2 text-stone-500 dark:text-stone-400">
                                      {dest.date_ar ? new Date(dest.date_ar).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {agId && (
            <ConvocationFormDialog
              open={showConvocationDialog || !!editingConvocation}
              onOpenChange={(open) => { setShowConvocationDialog(open); if (!open) setEditingConvocation(null) }}
              agId={agId}
              defaultValues={editingConvocation ?? undefined}
              title={editingConvocation ? 'Modifier la convocation' : 'Nouvelle convocation'}
              onSubmit={async (data) => {
                if (editingConvocation) {
                  await updateConvocation.mutateAsync({ id: editingConvocation.id, data })
                } else {
                  await createConvocation.mutateAsync(data)
                }
                setShowConvocationDialog(false)
                setEditingConvocation(null)
              }}
              isLoading={editingConvocation ? updateConvocation.isPending : createConvocation.isPending}
            />
          )}
        </div>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === 'resolution') deleteResolution.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'presence') deletePresence.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'convocation') deleteConvocation.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />

      <ConfirmDialog
        open={showSendConfirm !== null}
        onOpenChange={(o) => !o && setShowSendConfirm(null)}
        title="Delai legal non respecte"
        description="Le delai legal de 21 jours n'est pas respecte. Envoyer quand meme ?"
        variant="default"
        onConfirm={() => {
          envoyerConvocation.mutateAsync(showSendConfirm!)
          setShowSendConfirm(null)
        }}
      />
    </div>
  )
}
