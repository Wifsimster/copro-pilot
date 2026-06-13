import { Link } from 'react-router-dom'
import type { DashboardTask } from '@/types'
import {
  Calendar,
  Receipt,
  Wrench,
  Mail,
  ListChecks,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const TASK_ICONS: Record<string, LucideIcon> = {
  intervention: Wrench,
  ag: Calendar,
  appel_fonds: Receipt,
  cycle_annuel: ListChecks,
  relance: Mail,
}

export default function DailyTasks({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <Card className="py-0">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Taches de la semaine
        </h2>
        {tasks.length > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {tasks.length}
          </span>
        )}
      </div>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <ListChecks className="size-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune tache cette semaine
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map(task => {
            const Icon = TASK_ICONS[task.type] || ListChecks
            return (
              <Link
                key={task.id}
                to={task.link}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    task.priority === 'haute'
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.copropriete_nom && (
                      <>
                        <span>{task.copropriete_nom}</span>
                        <span>&middot;</span>
                      </>
                    )}
                    <span>{task.description}</span>
                  </div>
                </div>
                {task.priority === 'haute' && (
                  <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    urgent
                  </span>
                )}
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
