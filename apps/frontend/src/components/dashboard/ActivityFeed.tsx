import { Link } from 'react-router-dom'
import type { ActivityType, DashboardActivity } from '@/types'
import {
  AlertTriangle,
  Calendar,
  Receipt,
  Wrench,
  FileUp,
  AlertOctagon,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { timeAgo } from './format'

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  incident: AlertTriangle,
  paiement: Receipt,
  intervention: Wrench,
  document: FileUp,
  ag: Calendar,
  sinistre: AlertOctagon,
}

export default function ActivityFeed({
  activity,
}: {
  activity: DashboardActivity[]
}) {
  return (
    <Card className="py-0">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Activite recente
        </h2>
      </div>
      {activity.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <FileUp className="size-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune activite recente
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {activity.map(item => {
            const Icon = ACTIVITY_ICONS[item.type] || FileUp
            return (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.copropriete_nom && (
                      <>
                        <span>{item.copropriete_nom}</span>
                        <span>&middot;</span>
                      </>
                    )}
                    <span>{timeAgo(item.date)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
