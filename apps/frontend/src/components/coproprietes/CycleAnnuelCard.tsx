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
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
            <div className="h-5 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
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
          : 'bg-stone-300 dark:bg-stone-600'

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <ListChecks className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Conformite {annee}
          </p>
          <p className="text-xl font-bold text-stone-900 dark:text-white">
            {percentage}%
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>
            {completed}/{total} taches
          </span>
          <span>{percentage}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
