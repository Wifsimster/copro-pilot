import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  useSubscription,
  useCheckout,
  usePortalSession,
  useUsage,
} from '@/hooks/useSubscription'
import type { Cadence } from '@/api/stripe'
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Building2,
  Users,
} from 'lucide-react'

const planLabels: Record<string, string> = {
  gratuit: 'Cloud Gratuit',
  essentiel: 'Essentiel',
  pro: 'Pro',
  entreprise: 'Entreprise',
}

const PLAN_PRICES: Record<
  string,
  { monthly: number; yearly: number } | null
> = {
  gratuit: null,
  essentiel: { monthly: 9, yearly: 69 },
  pro: { monthly: 29, yearly: 219 },
  entreprise: { monthly: 99, yearly: 749 },
}

function formatPrice(plan: string, cadence: Cadence): string {
  if (plan === 'gratuit') return '0 €/mois'
  const prices = PLAN_PRICES[plan]
  if (!prices) return ''
  return cadence === 'yearly'
    ? `${prices.yearly} €/an`
    : `${prices.monthly} €/mois`
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: 'text-green-600' },
  trialing: { label: "Période d'essai", color: 'text-emerald-700' },
  past_due: {
    label: 'Paiement en retard',
    color: 'text-orange-600',
  },
  canceled: { label: 'Résilié', color: 'text-red-600' },
  incomplete: { label: 'Incomplet', color: 'text-amber-600' },
}

function UsageBar({
  current,
  limit,
  label,
  icon: Icon,
}: {
  current: number
  limit: number | null
  label: string
  icon: React.ElementType
}) {
  if (limit === null) return null

  const pct = Math.min((current / limit) * 100, 100)
  const isNearLimit = pct >= 80
  const isAtLimit = current >= limit

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span
          className={`font-medium ${
            isAtLimit
              ? 'text-red-600'
              : isNearLimit
                ? 'text-amber-600'
                : 'text-foreground'
          }`}
        >
          {current} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function CadenceToggle({
  value,
  onChange,
  disabled,
}: {
  value: Cadence
  onChange: (c: Cadence) => void
  disabled?: boolean
}) {
  return (
    <fieldset
      className="m-0 inline-flex min-w-0 items-center rounded-full border border-slate-200 dark:border-slate-700 p-1 text-sm"
      aria-label="Cadence de facturation"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('monthly')}
        className={`px-3 py-1 rounded-full transition ${
          value === 'monthly'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Mensuel
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('yearly')}
        className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
          value === 'yearly'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Annuel
        <span
          className={`text-xs font-semibold ${
            value === 'yearly'
              ? 'text-primary-foreground/90'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          −36 %
        </span>
      </button>
    </fieldset>
  )
}

export default function SubscriptionPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || undefined
  const { data: subscription, isLoading } =
    useSubscription(sessionId)
  const { data: usage } = useUsage()
  const checkout = useCheckout()
  const portal = usePortalSession()

  const [cadence, setCadence] = useState<Cadence>(
    (searchParams.get('cadence') as Cadence) || 'monthly'
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const plan = subscription?.plan || 'gratuit'
  const status = subscription?.status || 'active'
  const statusInfo = statusLabels[status] || statusLabels.active
  const isSuccess = !!sessionId
  const currentCadence: Cadence = subscription?.cadence || 'monthly'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon abonnement</h1>

      {isSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4 flex items-start gap-3">
          <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Paiement confirmé !
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Votre abonnement {planLabels[plan]} est maintenant
              actif.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="size-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">
                Plan {planLabels[plan]}
              </h2>
              <p className="text-sm text-muted-foreground">
                {formatPrice(plan, currentCadence)}
              </p>
            </div>
          </div>
          <span
            className={`text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {status === 'past_due' && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-3 flex items-start gap-2">
            <AlertTriangle className="size-4 text-orange-500 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Un paiement a échoué. Mettez à jour votre moyen de
              paiement pour éviter l'interruption du service.
            </p>
          </div>
        )}

        {subscription?.current_period_end && (
          <p className="text-sm text-muted-foreground">
            Prochaine facturation :{' '}
            {new Date(
              subscription.current_period_end
            ).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {plan === 'gratuit' && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Cadence de facturation
            </span>
            <CadenceToggle
              value={cadence}
              onChange={setCadence}
              disabled={checkout.isPending}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {plan !== 'gratuit' &&
            subscription?.stripe_customer_id && (
              <Button
                variant="outline"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                <ExternalLink className="size-4" />
                Gérer mon abonnement
              </Button>
            )}

          {plan === 'gratuit' && (
            <Button
              onClick={() =>
                checkout.mutate({ plan: 'pro', cadence })
              }
              disabled={checkout.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="size-4" />
              Passer au plan Pro - {formatPrice('pro', cadence)}
            </Button>
          )}

          {plan === 'essentiel' && (
            <Button
              onClick={() =>
                checkout.mutate({
                  plan: 'pro',
                  cadence: currentCadence,
                })
              }
              disabled={checkout.isPending}
            >
              Passer au plan Pro
            </Button>
          )}
        </div>
      </div>

      {usage && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Utilisation</h2>

          <div className="space-y-4">
            <UsageBar
              current={usage.coproprietes.current}
              limit={usage.coproprietes.limit}
              label="Copropriétés"
              icon={Building2}
            />
            <UsageBar
              current={usage.users.current}
              limit={usage.users.limit}
              label="Utilisateurs"
              icon={Users}
            />
          </div>

          {usage.total_extra_cost > 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Surcoût estimé ce mois :{' '}
                <strong>{usage.total_extra_cost} €</strong>
                {usage.coproprietes.extra > 0 && (
                  <span>
                    {' '}
                    ({usage.coproprietes.extra} copropriété(s)
                    supplémentaire(s))
                  </span>
                )}
                {usage.users.extra > 0 && (
                  <span>
                    {' '}
                    ({usage.users.extra} utilisateur(s)
                    supplémentaire(s))
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
