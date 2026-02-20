import { useNavigate } from 'react-router-dom'
import { useExtranetDashboard } from '@/hooks/useExtranet'
import {
  Building2,
  Calendar,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import {
  useExtranetContext,
  formatEur,
  Section,
  StatCard,
} from '@/components/extranet/shared'

const ROLE_LABELS: Record<string, string> = {
  president: 'President',
  membre: 'Membre',
  suppleant: 'Suppleant',
}

const ROLE_COLORS: Record<string, string> = {
  president:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  membre:
    'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  suppleant:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
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
        <div className="h-40 rounded-lg bg-muted" />
        <div className="h-32 rounded-lg bg-muted" />
        <div className="h-32 rounded-lg bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
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
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue {profil.coproprietaire.prenom}{' '}
          {profil.coproprietaire.nom}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {today}
        </p>
      </div>

      {/* Ma copropriete */}
      {selectedCopro && (
        <Section title="Ma copropriete" icon={Building2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nom</p>
              <p className="text-sm font-medium">
                {selectedCopro.nom}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Adresse
              </p>
              <p className="text-sm font-medium">
                {selectedCopro.adresse}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedCopro.code_postal} {selectedCopro.ville}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Lots dans la copropriete
              </p>
              <p className="text-sm font-medium">
                {selectedCopro.nombre_lots} lot
                {selectedCopro.nombre_lots > 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Mes lots
              </p>
              <p className="text-sm font-medium">
                {userLots.length} lot
                {userLots.length > 1 ? 's' : ''} —{' '}
                {totalTantiemes} tantiemes
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Conseil syndical status */}
      {conseilRole && (
        <Section title="Conseil syndical" icon={Users}>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[conseilRole] ?? ROLE_COLORS.membre}`}
            >
              {ROLE_LABELS[conseilRole] ?? conseilRole}
            </span>
            <p className="text-sm text-muted-foreground">
              Vous etes{' '}
              {ROLE_LABELS[conseilRole]?.toLowerCase() ??
                conseilRole}{' '}
              du conseil syndical.
            </p>
          </div>
        </Section>
      )}

      {/* Mes coordonnees */}
      <Section title="Mes coordonnees" icon={User}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">
              Nom complet
            </p>
            <p className="text-sm font-medium">
              {profil.coproprietaire.prenom}{' '}
              {profil.coproprietaire.nom}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">
              {profil.coproprietaire.email ?? '\u2014'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Telephone
            </p>
            <p className="text-sm font-medium">
              {profil.coproprietaire.telephone ?? '\u2014'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Adresse de correspondance
            </p>
            <p className="text-sm font-medium">
              {profil.coproprietaire.adresse_correspondance ??
                '\u2014'}
            </p>
          </div>
        </div>
      </Section>

      {/* Mon compte */}
      <Section title="Mon compte" icon={Wallet}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total appele"
            value={formatEur(dashboard.compte.total_du)}
          />
          <StatCard
            label="Total paye"
            value={formatEur(dashboard.compte.total_paye)}
          />
          <StatCard
            label="Solde"
            value={formatEur(solde)}
            color={
              solde > 0
                ? 'text-red-600'
                : solde < 0
                  ? 'text-green-600'
                  : undefined
            }
          />
        </div>
        {solde > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
            Vous avez un solde debiteur de {formatEur(solde)}.
            Merci de regulariser votre situation.
          </div>
        )}
      </Section>

      {/* Prochaine AG */}
      {nextAG && (
        <Section
          title="Prochaine assemblee generale"
          icon={Calendar}
        >
          <div className="flex items-center justify-between rounded border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">
                AG {nextAG.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(nextAG.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {nextAG.heure ? ` a ${nextAG.heure}` : ''}
                {nextAG.lieu ? ` — ${nextAG.lieu}` : ''}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {nextAG.statut}
            </span>
          </div>
        </Section>
      )}

      {/* Acces rapide */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Acces rapide
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/extranet/profil')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Mon profil
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
            onClick={() => navigate('/extranet/appels-fonds')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Mes appels de fonds
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
