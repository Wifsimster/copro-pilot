import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useSyndicDashboard } from '@/hooks/useStats'
import { useAuthStore } from '@/store/authStore'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { AlertTriangle, Calendar, Receipt, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import AlertsBanner from '@/components/dashboard/AlertsBanner'
import DailyTasks from '@/components/dashboard/DailyTasks'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import {
  StatCardSkeleton,
  ListSkeleton,
} from '@/components/dashboard/skeletons'
// The two recharts-backed charts are loaded lazily so recharts lands in its
// own chunk rather than the dashboard's initial bundle.
const ImpayesChart = lazy(() => import('@/components/dashboard/ImpayesChart'))
const IncidentsChart = lazy(
  () => import('@/components/dashboard/IncidentsChart')
)
import RecouvrementGauge from '@/components/dashboard/RecouvrementGauge'
import EcheancesCard from '@/components/dashboard/EcheancesCard'

// Stable empty defaults so lazily-rendered charts keep referential equality
// across renders when the API has not returned data yet.
const EMPTY_IMPAYES: never[] = []
const EMPTY_INCIDENTS: Record<string, number> = {}
const CHART_FALLBACK = (
  <div className="h-64 animate-pulse rounded-xl bg-muted" />
)

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

export default function DashboardPage() {
  const selectedCoproprieteId = useCoproprieteStore(
    s => s.selectedCoproprieteId
  )
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
  } = useSyndicDashboard(selectedCoproprieteId)
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
      label: 'Ajouter une copropriété',
      icon: Plus,
      action: () => navigate('/coproprietes'),
    },
    {
      label: 'Gérer les charges',
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
    <LazyMotion features={domAnimation}>
      <div className="space-y-5">
        {isError && (
          <ErrorAlert
            error={error}
            message="Impossible de charger le tableau de bord"
          />
        )}

        {/* Welcome header */}
        <m.div
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
        </m.div>

        {/* Alerts banner */}
        {dashboard && dashboard.alerts.length > 0 && (
          <AlertsBanner alerts={dashboard.alerts} />
        )}

        {/* Metrics grid */}
        {dashboard && (
          <MetricsGrid
            metrics={dashboard.metrics as unknown as Record<string, number>}
            delay={0.1}
          />
        )}

        {/* KPI Charts */}
        {dashboard && (
          <div className="space-y-5">
            {/* Row 1: Impayes chart (2/3) + Recouvrement gauge (1/3) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <m.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
              >
                <Suspense fallback={CHART_FALLBACK}>
                  <ImpayesChart
                    data={dashboard.impayes_evolution ?? EMPTY_IMPAYES}
                  />
                </Suspense>
              </m.div>
              <m.div
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
              >
                <RecouvrementGauge value={dashboard.taux_recouvrement ?? 0} />
              </m.div>
            </div>

            {/* Row 2: Incidents chart (1/3) + Echeances card (2/3) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <m.div
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
              >
                <Suspense fallback={CHART_FALLBACK}>
                  <IncidentsChart
                    data={dashboard.incidents_par_statut ?? EMPTY_INCIDENTS}
                  />
                </Suspense>
              </m.div>
              <m.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
              >
                <EcheancesCard
                  echeances={dashboard.prochaines_echeances ?? []}
                />
              </m.div>
            </div>
          </div>
        )}

        {/* Tasks + Activity side by side */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <m.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
            <DailyTasks tasks={dashboard?.tasks ?? []} />
          </m.div>

          <m.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
          >
            <ActivityFeed activity={dashboard?.activity ?? []} />
          </m.div>
        </div>

        {/* Quick actions */}
        <m.div
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
              <qa.icon className="size-4" />
              {qa.label}
            </Button>
          ))}
        </m.div>
      </div>
    </LazyMotion>
  )
}
