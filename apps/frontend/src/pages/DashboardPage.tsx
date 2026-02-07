import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useDashboardStats } from '@/hooks/useStats'
import { useAuthStore } from '@/store/authStore'
import {
  Building2,
  Users,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
  Home,
  UserCheck,
  PiggyBank,
  Receipt,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function timeUntil(dateStr: string): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86_400_000)
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'demain'
  if (diffDays < 7) return `dans ${diffDays} jours`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `dans ${weeks} sem.`
  }
  const months = Math.floor(diffDays / 30)
  return `dans ${months} mois`
}

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const URGENCE_COLORS: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  moyenne:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const URGENCE_BORDER: Record<string, string> = {
  faible: 'border-l-gray-400',
  moyenne: 'border-l-yellow-500',
  haute: 'border-l-orange-500',
  critique: 'border-l-red-500',
}

const STATUT_INCIDENT_COLORS: Record<string, string> = {
  ouvert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-7 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
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
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="ml-3 flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stat card descriptions
// ---------------------------------------------------------------------------

function getStatDescription(
  key: string,
  stats: { counts: Record<string, number> } | undefined,
): string {
  if (!stats) return ''
  switch (key) {
    case 'incidents':
      return stats.counts.incidents_ouverts === 0
        ? 'Aucun incident'
        : `${stats.counts.incidents_ouverts} en cours`
    case 'ag':
      return stats.counts.prochaines_ag === 0
        ? 'Aucune AG planifiee'
        : `${stats.counts.prochaines_ag} a venir`
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const firstName = user?.firstname || ''

  const statCards = [
    {
      key: 'coproprietes',
      label: 'Coproprietes',
      value: stats?.counts.coproprietes ?? '—',
      icon: Building2,
      color: 'bg-blue-500',
      link: '/coproprietes',
      description: '',
    },
    {
      key: 'coproprietaires',
      label: 'Coproprietaires',
      value: stats?.counts.coproprietaires ?? '—',
      icon: Users,
      color: 'bg-green-500',
      link: '/coproprietaires',
      description: '',
    },
    {
      key: 'incidents',
      label: 'Incidents ouverts',
      value: stats?.counts.incidents_ouverts ?? '—',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      link: '/travaux',
      description: getStatDescription('incidents', stats),
    },
    {
      key: 'ag',
      label: 'Prochaines AG',
      value: stats?.counts.prochaines_ag ?? '—',
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/assemblees',
      description: getStatDescription('ag', stats),
    },
  ]

  const financeCards = [
    {
      key: 'lots',
      label: 'Lots',
      value: stats?.counts.lots ?? '—',
      icon: Home,
      color: 'bg-cyan-500',
      link: '/coproprietes',
    },
    {
      key: 'locataires',
      label: 'Locataires',
      value: stats?.counts.locataires ?? '—',
      icon: UserCheck,
      color: 'bg-teal-500',
      link: '/coproprietes',
    },
    {
      key: 'impayes',
      label: 'Appels en cours',
      value: stats ? formatEuro(stats.counts.impayes) : '—',
      icon: Receipt,
      color: 'bg-amber-500',
      link: '/charges',
    },
    {
      key: 'fonds_travaux',
      label: 'Fonds travaux',
      value: stats ? formatEuro(stats.counts.fonds_travaux) : '—',
      icon: PiggyBank,
      color: 'bg-emerald-500',
      link: '/charges',
    },
  ]

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
  ]

  // ---- Loading skeleton ----
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-1">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Finance cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-44 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>

        {/* Lists skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ListSkeleton />
          <ListSkeleton />
        </div>
      </div>
    )
  }

  // ---- Loaded state ----
  return (
    <div className="space-y-6">
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link to={stat.link} className="block">
              <Card className="py-0 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.color} text-white`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Finance & property cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financeCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
          >
            <Link to={stat.link} className="block">
              <Card className="py-0 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.color} text-white`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        {quickActions.map((qa) => (
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

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent incidents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <Card className="py-0">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold text-foreground">
                Incidents ouverts
              </h2>
              <Link
                to="/travaux"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Voir tout
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {!stats?.recent_incidents.length ? (
              <div className="flex flex-col items-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun incident ouvert
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recent_incidents.map((incident) => (
                  <Link
                    key={incident.id}
                    to={`/travaux?copropriete=${incident.copropriete_id}`}
                    className={`flex items-center justify-between border-l-3 px-4 py-3 transition-colors hover:bg-accent/50 ${URGENCE_BORDER[incident.urgence] ?? ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {incident.titre}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{incident.copropriete_nom}</span>
                        <span>&middot;</span>
                        <span>{timeAgo(incident.date_signalement)}</span>
                      </div>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${URGENCE_COLORS[incident.urgence]}`}
                      >
                        {incident.urgence}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_INCIDENT_COLORS[incident.statut] ?? ''}`}
                      >
                        {incident.statut === 'en_cours'
                          ? 'en cours'
                          : incident.statut}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Upcoming AGs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <Card className="py-0">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold text-foreground">
                Prochaines AG
              </h2>
              <Link
                to="/assemblees"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Voir tout
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {!stats?.prochaines_ag.length ? (
              <div className="flex flex-col items-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucune AG a venir
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.prochaines_ag.map((ag) => (
                  <Link
                    key={ag.id}
                    to={`/assemblees/${ag.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(ag.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {ag.heure && ` - ${ag.heure}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{ag.copropriete_nom}</span>
                        <span>&middot;</span>
                        <span>{timeUntil(ag.date)}</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {ag.type === 'ordinaire'
                          ? 'Ordinaire'
                          : 'Extraordinaire'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
