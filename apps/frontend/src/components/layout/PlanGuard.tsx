import { Button } from '@/components/ui/button'
import { CreditCard, Lock } from 'lucide-react'

const planLabels: Record<string, string> = {
  essentiel: 'Essentiel (19 €/mois)',
  pro: 'Pro (49 €/mois)',
  entreprise: 'Entreprise (149 €/mois)',
}

interface PlanGuardProps {
  requiredPlan: string
  feature: string
}

/**
 * Displays an upgrade CTA when a feature requires a higher plan.
 * Use this component in pages where a 403 plan error is expected.
 */
export function PlanGuard({ requiredPlan, feature }: PlanGuardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Lock className="size-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Fonctionnalité premium
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {feature} nécessite le plan{' '}
        <strong>{planLabels[requiredPlan] || requiredPlan}</strong>.
        Passez à un plan supérieur pour débloquer cette fonctionnalité.
      </p>
      <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
        <a href="/#/subscription">
          <CreditCard className="size-4" />
          Voir les plans
        </a>
      </Button>
    </div>
  )
}
