import { RefreshCw, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import type { TacheAnnuelle, StatutTacheAnnuelle } from '@/types'

const STATUT_CONFIG: Record<
  StatutTacheAnnuelle,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color:
      'text-green-600 dark:text-green-400',
    label: 'Fait',
  },
  in_progress: {
    icon: Clock,
    color:
      'text-yellow-600 dark:text-yellow-400',
    label: 'En cours',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    label: 'En retard',
  },
  pending: {
    icon: Circle,
    color:
      'text-stone-400 dark:text-stone-500',
    label: 'A faire',
  },
}

interface CycleAnnuelChecklistProps {
  taches: TacheAnnuelle[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function CycleAnnuelChecklist({
  taches,
  onRefresh,
  isRefreshing,
}: CycleAnnuelChecklistProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
          Cycle annuel de conformite
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Actualiser
          </button>
        )}
      </div>

      {taches.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <Circle className="h-8 w-8 text-stone-300 dark:text-stone-600" />
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Aucun cycle initialisé pour cette année
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
          {taches.map((tache) => {
            const config = STATUT_CONFIG[tache.statut]
            const Icon = config.icon
            return (
              <div
                key={tache.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${config.color}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      tache.statut === 'completed'
                        ? 'text-stone-500 line-through dark:text-stone-500'
                        : 'text-stone-900 dark:text-white'
                    }`}
                  >
                    {tache.tache_label}
                  </p>
                  {tache.date_completion && (
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      Fait le{' '}
                      {new Date(
                        tache.date_completion
                      ).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    tache.statut === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : tache.statut === 'overdue'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : tache.statut === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                  }`}
                >
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
