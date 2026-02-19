import { useNavigate } from 'react-router-dom'
import { useExtranetDashboard } from '@/hooks/useExtranet'
import {
  Calendar,
  AlertCircle,
  Bell,
} from 'lucide-react'
import {
  useExtranetContext,
  formatEur,
  Section,
  StatCard,
} from '@/components/extranet/shared'

const URGENCE_COLORS: Record<string, string> = {
  faible:
    'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  moyenne:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  haute:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critique:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ExtranetDashboardPage() {
  const { profil } = useExtranetContext()
  const { data: dashboard, isLoading } = useExtranetDashboard()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!dashboard) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune donnee disponible.
      </p>
    )
  }

  const solde = Number(dashboard.compte.solde)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue {profil.coproprietaire.prenom}{' '}
          {profil.coproprietaire.nom}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Solde du compte"
          value={formatEur(solde)}
          color={
            solde > 0
              ? 'text-red-600'
              : solde < 0
                ? 'text-green-600'
                : undefined
          }
        />
        <StatCard
          label="Notifications non lues"
          value={String(dashboard.unreadNotifications)}
        />
        <StatCard
          label="Prochaines AG"
          value={String(dashboard.upcomingAGs.length)}
        />
        <StatCard
          label="Incidents en cours"
          value={String(dashboard.openIncidents.length)}
        />
      </div>

      {/* Debit warning */}
      {solde > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Vous avez un solde debiteur de {formatEur(solde)}. Merci
          de regulariser votre situation.
        </div>
      )}

      {/* Unread notifications alert */}
      {dashboard.unreadNotifications > 0 && (
        <div
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="size-4 shrink-0" />
          Vous avez {dashboard.unreadNotifications} notification
          {dashboard.unreadNotifications > 1 ? 's' : ''} non lue
          {dashboard.unreadNotifications > 1 ? 's' : ''}.
        </div>
      )}

      {/* Upcoming AGs */}
      {dashboard.upcomingAGs.length > 0 && (
        <Section
          title="Prochaines assemblees generales"
          icon={Calendar}
        >
          {dashboard.upcomingAGs.map(ag => (
            <div
              key={ag.id}
              className="flex items-center justify-between rounded border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  AG {ag.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ag.copropriete_nom} —{' '}
                  {new Date(ag.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {ag.heure ? ` a ${ag.heure}` : ''}
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {ag.statut}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Open incidents */}
      {dashboard.openIncidents.length > 0 && (
        <Section title="Incidents en cours" icon={AlertCircle}>
          {dashboard.openIncidents.map(incident => (
            <div
              key={incident.id}
              className="flex items-center justify-between rounded border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {incident.titre}
                </p>
                <p className="text-xs text-muted-foreground">
                  {incident.copropriete_nom} —{' '}
                  {new Date(
                    incident.date_signalement
                  ).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${URGENCE_COLORS[incident.urgence] ?? 'bg-gray-100 text-gray-700'}`}
              >
                {incident.urgence}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Quick actions */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Acces rapide
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/extranet/compte')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Mon compte
          </button>
          <button
            onClick={() => navigate('/extranet/documents')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Mes documents
          </button>
          <button
            onClick={() => navigate('/extranet/charges')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Mes charges
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Notifications
          </button>
        </div>
      </div>
    </div>
  )
}
