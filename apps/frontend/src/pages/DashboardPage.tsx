import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSyndicDashboard } from '@/hooks/useStats'
import { useAuthStore } from '@/store/authStore'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import type {
  AlertSeverity,
  AlertCategory,
  DashboardAlert,
  DashboardTask,
  DashboardActivity,
  ActivityType,
} from '@/types'
import {
  AlertTriangle,
  Calendar,
  Building2,
  FileText,
  Shield,
  ClipboardCheck,
  Receipt,
  Briefcase,
  Wrench,
  FileUp,
  AlertOctagon,
  Mail,
  ListChecks,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Gavel,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/layout/ErrorAlert'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour'
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  if (diffDays < 30) return `il y a ${diffDays} j`
  const diffMonths = Math.floor(diffDays / 30)
  return `il y a ${diffMonths} mois`
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

// ---------------------------------------------------------------------------
// Icon & color maps
// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { border: string; bg: string; badge: string }
> = {
  critique: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    badge:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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

const TASK_ICONS: Record<string, LucideIcon> = {
  intervention: Wrench,
  ag: Calendar,
  appel_fonds: Receipt,
  cycle_annuel: ListChecks,
  relance: Mail,
}

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  incident: AlertTriangle,
  paiement: Receipt,
  intervention: Wrench,
  document: FileUp,
  ag: Calendar,
  sinistre: AlertOctagon,
}

const METRIC_CONFIG = [
  {
    key: 'coproprietes' as const,
    label: 'Coproprietes',
    icon: Building2,
    color: 'bg-emerald-500',
    link: '/coproprietes',
  },
  {
    key: 'incidents_ouverts' as const,
    label: 'Incidents ouverts',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    link: '/travaux',
    badgeKey: 'incidents_critiques' as const,
    badgeLabel: 'critiques',
  },
  {
    key: 'impayes' as const,
    label: 'Impayes',
    icon: Receipt,
    color: 'bg-amber-500',
    link: '/charges',
    format: 'euro' as const,
  },
  {
    key: 'prochaines_ag' as const,
    label: 'Prochaines AG',
    icon: Calendar,
    color: 'bg-purple-500',
    link: '/assemblees',
  },
  {
    key: 'contrats_expirant' as const,
    label: 'Contrats a renouveler',
    icon: FileText,
    color: 'bg-cyan-500',
    link: '/contrats',
  },
  {
    key: 'procedures_actives' as const,
    label: 'Procedures actives',
    icon: Gavel,
    color: 'bg-rose-500',
    link: '/contentieux',
  },
  {
    key: 'sinistres_ouverts' as const,
    label: 'Sinistres ouverts',
    icon: AlertOctagon,
    color: 'bg-red-500',
    link: '/assurances',
  },
]

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-6 w-12 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="py-0">
      <div className="flex items-center justify-between border-b p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="ml-3">
              <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AlertsBanner({
  alerts,
}: {
  alerts: DashboardAlert[]
}) {
  const [expanded, setExpanded] = useState(true)

  if (alerts.length === 0) return null

  const critiques = alerts.filter(
    a => a.severity === 'critique'
  )
  const hautes = alerts.filter(
    a => a.severity === 'haute'
  )
  const moyennes = alerts.filter(
    a => a.severity === 'moyenne'
  )

  const summaryParts: string[] = []
  if (critiques.length > 0)
    summaryParts.push(
      `${critiques.length} critique${critiques.length > 1 ? 's' : ''}`
    )
  if (hautes.length > 0)
    summaryParts.push(
      `${hautes.length} haute${hautes.length > 1 ? 's' : ''}`
    )
  if (moyennes.length > 0)
    summaryParts.push(
      `${moyennes.length} moyenne${moyennes.length > 1 ? 's' : ''}`
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-red-200 py-0 dark:border-red-800/40">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between bg-red-50 px-4 py-3 text-left dark:bg-red-950/20"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-800 dark:text-red-300">
              {alerts.length} alerte
              {alerts.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400">
              ({summaryParts.join(', ')})
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </button>

        {expanded && (
          <div className="divide-y divide-border">
            {alerts.map(alert => {
              const style = SEVERITY_STYLES[alert.severity]
              const Icon =
                CATEGORY_ICONS[alert.category] ||
                AlertTriangle
              return (
                <Link
                  key={alert.id}
                  to={alert.link}
                  className={`flex items-center gap-3 border-l-3 px-4 py-3 transition-colors hover:bg-accent/50 ${style.border}`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {alert.copropriete_nom && (
                        <>
                          <span>
                            {alert.copropriete_nom}
                          </span>
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
    </motion.div>
  )
}

function DailyTasks({
  tasks,
}: {
  tasks: DashboardTask[]
}) {
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
          <ListChecks className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune tache cette semaine
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map(task => {
            const Icon =
              TASK_ICONS[task.type] || ListChecks
            return (
              <Link
                key={task.id}
                to={task.link}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    task.priority === 'haute'
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.copropriete_nom && (
                      <>
                        <span>
                          {task.copropriete_nom}
                        </span>
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
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function MetricsGrid({
  metrics,
  delay = 0,
}: {
  metrics: Record<string, number>
  delay?: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRIC_CONFIG.map((cfg, i) => {
        const value = metrics[cfg.key] ?? 0
        const displayValue =
          cfg.format === 'euro' ? formatEuro(value) : value
        const badgeValue =
          'badgeKey' in cfg
            ? metrics[cfg.badgeKey as string]
            : undefined
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: delay + i * 0.04,
            }}
          >
            <Link to={cfg.link} className="block">
              <Card className="py-0 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.color} text-white`}
                  >
                    <cfg.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {cfg.label}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-bold text-foreground">
                        {displayValue}
                      </p>
                      {badgeValue != null &&
                        badgeValue > 0 && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {badgeValue}{' '}
                            {'badgeLabel' in cfg
                              ? cfg.badgeLabel
                              : ''}
                          </span>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

function ActivityFeed({
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
          <FileUp className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune activite recente
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {activity.map(item => {
            const Icon =
              ACTIVITY_ICONS[item.type] || FileUp
            return (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.copropriete_nom && (
                      <>
                        <span>
                          {item.copropriete_nom}
                        </span>
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const selectedCoproprieteId = useCoproprieteStore(
    s => s.selectedCoproprieteId
  )
  const { data: dashboard, isLoading, isError, error } =
    useSyndicDashboard(selectedCoproprieteId)
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  const firstName = user?.firstname || ''

  const quickActions = [
    {
      label: 'Signaler un incident',
      icon: AlertTriangle,
      action: () => navigate('/travaux'),
    },
    {
      label: 'Planifier une AG',
      icon: Calendar,
      action: () => navigate('/assemblees'),
    },
    {
      label: 'Ajouter une copropriete',
      icon: Plus,
      action: () => navigate('/coproprietes'),
    },
    {
      label: 'Gerer les charges',
      icon: Receipt,
      action: () => navigate('/charges'),
    },
  ]

  // ---- Loading skeleton ----
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ListSkeleton rows={5} />
          </div>
          <div className="lg:col-span-2">
            <ListSkeleton rows={5} />
          </div>
        </div>
      </div>
    )
  }

  // ---- Loaded state ----
  return (
    <div className="space-y-5">
      {isError && <ErrorAlert error={error} message="Impossible de charger le tableau de bord" />}

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {formatCurrentDate()}
        </p>
      </motion.div>

      {/* Alerts banner */}
      {dashboard && dashboard.alerts.length > 0 && (
        <AlertsBanner alerts={dashboard.alerts} />
      )}

      {/* Metrics grid */}
      {dashboard && (
        <MetricsGrid
          metrics={
            dashboard.metrics as unknown as Record<
              string,
              number
            >
          }
          delay={0.1}
        />
      )}

      {/* Tasks + Activity side by side */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <DailyTasks tasks={dashboard?.tasks ?? []} />
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <ActivityFeed
            activity={dashboard?.activity ?? []}
          />
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        {quickActions.map(qa => (
          <Button
            key={qa.label}
            variant="outline"
            size="sm"
            onClick={qa.action}
          >
            <qa.icon className="h-4 w-4" />
            {qa.label}
          </Button>
        ))}
      </motion.div>
    </div>
  )
}
