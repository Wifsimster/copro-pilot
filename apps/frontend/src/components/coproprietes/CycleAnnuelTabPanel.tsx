import { ListChecks } from 'lucide-react'
import type { TacheAnnuelle } from '@/types'
import { CycleAnnuelChecklist } from '@/components/coproprietes/CycleAnnuelChecklist'

interface CycleAnnuelTabPanelProps {
  cycleAnnuel: TacheAnnuelle[] | undefined
  currentYear: number
  onInitialize: () => void
  isInitializing: boolean
  onRefresh: () => void
  isRefreshing: boolean
}

export function CycleAnnuelTabPanel({ cycleAnnuel, currentYear, onInitialize, isInitializing, onRefresh, isRefreshing }: CycleAnnuelTabPanelProps) {
  return (
    <div className="space-y-4">
      {(!cycleAnnuel || cycleAnnuel.length === 0) ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-800">
          <ListChecks className="mx-auto size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">
            Aucun cycle annuel initialise pour {currentYear}
          </p>
          <button type="button"
            onClick={onInitialize}
            disabled={isInitializing}
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isInitializing ? 'Initialisation...' : `Initialiser le cycle ${currentYear}`}
          </button>
        </div>
      ) : (
        <CycleAnnuelChecklist
          taches={cycleAnnuel}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      )}
    </div>
  )
}
