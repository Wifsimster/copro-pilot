import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useStats'
import { Building2, Users, AlertTriangle, Calendar } from 'lucide-react'

const URGENCE_COLORS: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  moyenne: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUT_INCIDENT_COLORS: Record<string, string> = {
  ouvert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  const statCards = [
    { label: 'Coproprietes', value: stats?.counts.coproprietes ?? '—', icon: Building2, color: 'bg-blue-500', link: '/coproprietes' },
    { label: 'Coproprietaires', value: stats?.counts.coproprietaires ?? '—', icon: Users, color: 'bg-green-500', link: '/coproprietaires' },
    { label: 'Incidents ouverts', value: stats?.counts.incidents_ouverts ?? '—', icon: AlertTriangle, color: 'bg-orange-500', link: '/travaux' },
    { label: 'Prochaines AG', value: stats?.counts.prochaines_ag ?? '—', icon: Calendar, color: 'bg-purple-500', link: '/assemblees' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Vue d'ensemble de vos coproprietes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block h-7 w-8 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent incidents */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incidents ouverts</h2>
            <Link to="/travaux" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Voir tout
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !stats?.recent_incidents.length ? (
            <div className="flex flex-col items-center py-8">
              <AlertTriangle className="h-8 w-8 text-gray-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Aucun incident ouvert</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-700/50">
              {stats.recent_incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{incident.titre}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{incident.copropriete_nom}</p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${URGENCE_COLORS[incident.urgence]}`}>
                      {incident.urgence}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_INCIDENT_COLORS[incident.statut]}`}>
                      {incident.statut === 'en_cours' ? 'en cours' : incident.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming AGs */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prochaines AG</h2>
            <Link to="/assemblees" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Voir tout
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !stats?.prochaines_ag.length ? (
            <div className="flex flex-col items-center py-8">
              <Calendar className="h-8 w-8 text-gray-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Aucune AG a venir</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-700/50">
              {stats.prochaines_ag.map((ag) => (
                <Link key={ag.id} to={`/assemblees/${ag.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(ag.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {ag.heure && ` - ${ag.heure}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{ag.copropriete_nom}</p>
                  </div>
                  <div className="ml-3">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
