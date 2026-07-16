import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Plan hierarchy, mirror of the backend `PLAN_HIERARCHY`
 * (apps/backend/src/config/stripe.js). Higher index = higher tier.
 */
export const PLAN_HIERARCHY = [
  'gratuit',
  'essentiel',
  'pro',
  'entreprise',
] as const

export type PlanName = (typeof PLAN_HIERARCHY)[number]

const PLAN_LABELS: Record<PlanName, string> = {
  gratuit: 'Gratuit',
  essentiel: 'Essentiel',
  pro: 'Pro',
  entreprise: 'Entreprise',
}

/**
 * Returns true when `current` is at least as high as `required` in the plan
 * hierarchy. An unknown or missing current plan is treated as `gratuit`; an
 * unknown requirement never blocks (fails open, matching requirePlan()).
 */
export function hasPlanAccess(
  current: string | undefined | null,
  required: PlanName
): boolean {
  const requiredLevel = PLAN_HIERARCHY.indexOf(required)
  if (requiredLevel === -1) return true
  const currentLevel = PLAN_HIERARCHY.indexOf(
    (current ?? 'gratuit') as PlanName
  )
  return currentLevel >= requiredLevel
}

interface PlanGuardProps {
  /** Minimum plan required to access the wrapped feature. */
  requiredPlan: PlanName
  /** Human-readable feature name shown in the upgrade wall. */
  feature?: string
  /** Content rendered when the current plan is sufficient. */
  children: ReactNode
  /**
   * Rendered while the subscription is loading. Defaults to `null` so the
   * upgrade wall never flashes before the real plan is known.
   */
  fallback?: ReactNode
}

/**
 * Gates a feature behind a minimum plan. When the current plan is sufficient
 * the children are rendered (and their hooks only run then); otherwise a
 * contextual upgrade wall is shown with a CTA to the subscription page —
 * instead of letting the gated request fail with a raw 403.
 */
export function PlanGuard({
  requiredPlan,
  feature,
  children,
  fallback = null,
}: PlanGuardProps) {
  const { data: subscription, isLoading } = useSubscription()

  if (isLoading) {
    return <>{fallback}</>
  }

  if (hasPlanAccess(subscription?.plan, requiredPlan)) {
    return <>{children}</>
  }

  return <PlanUpgradeWall requiredPlan={requiredPlan} feature={feature} />
}

interface PlanUpgradeWallProps {
  requiredPlan: PlanName
  feature?: string
}

export function PlanUpgradeWall({
  requiredPlan,
  feature,
}: PlanUpgradeWallProps) {
  const planLabel = PLAN_LABELS[requiredPlan] ?? requiredPlan
  const featureLabel = feature ?? 'Cette fonctionnalité'

  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardHeader>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
          <Lock className="size-6 text-amber-500 dark:text-amber-400" />
        </div>
        <CardTitle className="mt-4">
          Incluse dans le plan {planLabel}
        </CardTitle>
        <CardDescription>
          {featureLabel} est disponible à partir du plan {planLabel}. Passez à
          ce plan pour l'activer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <a href={`#/subscription?plan=${requiredPlan}`}>
            Voir le plan {planLabel}
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
