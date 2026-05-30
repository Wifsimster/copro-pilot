import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { AssembleeGenerale, DelaiVerification } from '@/types'

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

interface PresenceStats {
  presents: number
  representes: number
  absents: number
  totalTantiemes: number
}

interface AssembleeHeaderProps {
  ag: AssembleeGenerale
  agId: number | undefined
  agLabel: string
  delai: DelaiVerification | undefined
  presenceStats: PresenceStats | null
  genererPvIsPending: boolean
  onGenererPv: () => void
}

export function AssembleeHeader({
  ag,
  agId,
  agLabel,
  delai,
  presenceStats,
  genererPvIsPending,
  onGenererPv,
}: AssembleeHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/assemblees"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="size-5" />
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
          <button type="button"
            onClick={onGenererPv}
            disabled={genererPvIsPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {genererPvIsPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
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
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
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
    </>
  )
}
