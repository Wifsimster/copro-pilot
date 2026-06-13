import { useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import type { AlertSeverity, AlertCategory, DashboardAlert } from '@/types'
import {
  AlertTriangle,
  Calendar,
  FileText,
  Shield,
  ClipboardCheck,
  Receipt,
  Briefcase,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { border: string; bg: string; badge: string }
> = {
  critique: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  haute: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    badge:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
  moyenne: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    badge:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  info: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
}

const CATEGORY_ICONS: Record<AlertCategory, LucideIcon> = {
  incident: AlertTriangle,
  ag: Calendar,
  contrat: FileText,
  assurance: Shield,
  diagnostic: ClipboardCheck,
  impaye: Receipt,
  contrat_syndic: Briefcase,
}

export default function AlertsBanner({ alerts }: { alerts: DashboardAlert[] }) {
  const [expanded, setExpanded] = useState(true)

  if (alerts.length === 0) return null

  const critiques = alerts.filter(a => a.severity === 'critique')
  const hautes = alerts.filter(a => a.severity === 'haute')
  const moyennes = alerts.filter(a => a.severity === 'moyenne')

  const summaryParts: string[] = []
  if (critiques.length > 0)
    summaryParts.push(
      `${critiques.length} critique${critiques.length > 1 ? 's' : ''}`
    )
  if (hautes.length > 0)
    summaryParts.push(`${hautes.length} haute${hautes.length > 1 ? 's' : ''}`)
  if (moyennes.length > 0)
    summaryParts.push(
      `${moyennes.length} moyenne${moyennes.length > 1 ? 's' : ''}`
    )

  return (
    <m.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-red-200 py-0 dark:border-red-800/40">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between bg-red-50 px-4 py-3 text-left dark:bg-red-950/20"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-800 dark:text-red-300">
              {alerts.length} alerte
              {alerts.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400">
              ({summaryParts.join(', ')})
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="size-4 text-red-600 dark:text-red-400" />
          ) : (
            <ChevronDown className="size-4 text-red-600 dark:text-red-400" />
          )}
        </button>

        {expanded && (
          <div className="divide-y divide-border">
            {alerts.map(alert => {
              const style = SEVERITY_STYLES[alert.severity]
              const Icon = CATEGORY_ICONS[alert.category] || AlertTriangle
              return (
                <Link
                  key={alert.id}
                  to={alert.link}
                  className={`flex items-center gap-3 border-l-3 px-4 py-3 transition-colors hover:bg-accent/50 ${style.border}`}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {alert.copropriete_nom && (
                        <>
                          <span>{alert.copropriete_nom}</span>
                          <span>&middot;</span>
                        </>
                      )}
                      <span>{alert.description}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}
                  >
                    {alert.severity}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </m.div>
  )
}
