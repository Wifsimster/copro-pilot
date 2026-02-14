import { ListChecks } from 'lucide-react'
import type { CycleAnnuelSummary } from '@/types'

interface CycleAnnuelCardProps {
  summary: CycleAnnuelSummary | undefined
  annee: number
  isLoading?: boolean
}

export function CycleAnnuelCard({
  summary,
  annee,
  isLoading,
}: CycleAnnuelCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    )
  }

  const percentage = summary?.percentage ?? 0
  const completed = summary?.completed ?? 0
  const total = summary?.total ?? 0

  const barColor =
    percentage >= 80
      ? 'bg-green-500'
      : percentage >= 50
        ? 'bg-yellow-500'
        : percentage > 0
          ? 'bg-orange-500'
          : 'bg-gray-300 dark:bg-zinc-600'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <ListChecks className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Conformite {annee}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {percentage}%
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
          <span>
            {completed}/{total} taches
          </span>
          <span>{percentage}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
