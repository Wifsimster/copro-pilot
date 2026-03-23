import { useNavigate } from 'react-router-dom'
import { useExtranetDashboard } from '@/hooks/useExtranet'
import {
  Building2,
  Calendar,
  AlertTriangle,
  Bell,
  Users,
  Wallet,
  ChevronRight,
} from 'lucide-react'
import {
  useExtranetContext,
  formatEur,
} from '@/components/extranet/shared'

const ROLE_LABELS: Record<string, string> = {
  president: 'Président',
  membre: 'Membre',
  suppleant: 'Suppléant',
}

const ROLE_COLORS: Record<string, string> = {
  president:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  membre:
    'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  suppleant:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

function DashboardCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  href,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sublabel?: string
  color?: string
  href?: string
  badge?: { text: string; className: string }
}) {
  const navigate = useNavigate()
  const isClickable = !!href

  return (
    <button
      type="button"
      onClick={isClickable ? () => navigate(href) : undefined}
      className={`flex w-full items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors ${isClickable ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'}`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <p className={`text-lg font-semibold ${color ?? ''}`}>
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">
            {sublabel}
          </p>
        )}
        {badge && (
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      {isClickable && (
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  )
}

export default function ExtranetDashboardPage() {
  const { profil, currentCoproId } = useExtranetContext()
  const { data: dashboard, isLoading } = useExtranetDashboard()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune donnée disponible.
      </p>
    )
  }

  const selectedCopro = profil.coproprietes.find(
    c => c.id === currentCoproId
  )
  const conseilRole = profil.conseilSyndical.find(
    cs => cs.copropriete_id === currentCoproId
  )?.role
  const userLots = profil.lots.filter(
    l => l.copropriete_id === currentCoproId
  )
  const totalTantiemes = userLots.reduce(
    (sum, l) => sum + l.tantiemes,
    0
  )
  const solde = Number(dashboard.compte.solde)
  const nextAG = dashboard.upcomingAGs[0]

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Bonjour {profil.coproprietaire.prenom}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {today}
        </p>
      </div>

      {/* Solde debiteur warning */}
      {solde > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Solde débiteur : {formatEur(solde)}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Merci de régulariser votre situation.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Solde */}
        <DashboardCard
          icon={Wallet}
          label="Mon solde"
          value={formatEur(solde)}
          sublabel={`${formatEur(dashboard.compte.total_paye)} payé sur ${formatEur(dashboard.compte.total_du)} appelé`}
          color={
            solde > 0
              ? 'text-red-600'
              : solde < 0
                ? 'text-green-600'
                : undefined
          }
          href="/extranet/compte"
        />

        {/* Ma copropriete */}
        {selectedCopro && (
          <DashboardCard
            icon={Building2}
            label="Ma copropriété"
            value={selectedCopro.nom}
            sublabel={`${userLots.length} lot${userLots.length > 1 ? 's' : ''} — ${totalTantiemes} tantièmes`}
            href="/extranet/profil"
          />
        )}

        {/* Prochaine AG */}
        {nextAG && (
          <DashboardCard
            icon={Calendar}
            label="Prochaine assemblée"
            value={`AG ${nextAG.type}`}
            sublabel={`${new Date(nextAG.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${nextAG.heure ? ` a ${nextAG.heure}` : ''}${nextAG.lieu ? ` - ${nextAG.lieu}` : ''}`}
            badge={{
              text: nextAG.statut,
              className:
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            }}
          />
        )}

        {/* Notifications */}
        {dashboard.unreadNotifications > 0 && (
          <DashboardCard
            icon={Bell}
            label="Notifications"
            value={`${dashboard.unreadNotifications} non lue${dashboard.unreadNotifications > 1 ? 's' : ''}`}
            href="/notifications"
          />
        )}
      </div>

      {/* Conseil syndical badge */}
      {conseilRole && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
          <Users className="size-5 text-primary" />
          <p className="text-sm">
            Vous êtes{' '}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[conseilRole] ?? ROLE_COLORS.membre}`}
            >
              {ROLE_LABELS[conseilRole] ?? conseilRole}
            </span>{' '}
            du conseil syndical.
          </p>
          <button
            type="button"
            onClick={() => navigate('/extranet/conseil-syndical')}
            className="ml-auto text-xs font-medium text-primary hover:underline"
          >
            Voir
          </button>
        </div>
      )}

      {/* Open incidents */}
      {dashboard.openIncidents.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-3">
            <AlertTriangle className="size-5 text-primary" />
            <h3 className="text-sm font-semibold">
              Incidents en cours ({dashboard.openIncidents.length})
            </h3>
          </div>
          <div className="space-y-2">
            {dashboard.openIncidents.map(incident => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {incident.titre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      incident.date_signalement
                    ).toLocaleDateString('fr-FR')}{' '}
                    - {incident.copropriete_nom}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {incident.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
