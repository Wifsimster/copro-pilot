import { Rocket } from 'lucide-react'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { PREMIERE_AG_STEPS } from '@/lib/onboarding'

/**
 * Guided onboarding: "première AG réussie en 30 min". The completion state is
 * static for now (the checklist is a guide); wiring each step to real data
 * signals (copropriété exists, AG created, PV generated) is follow-up.
 */
export default function DemarragePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
          <Rocket className="size-5 text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Votre première AG en 30 minutes
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez ces étapes pour préparer une assemblée générale de bout en
            bout.
          </p>
        </div>
      </div>

      <OnboardingChecklist steps={PREMIERE_AG_STEPS} />

      <div className="rounded-xl border border-dashed p-4 text-sm">
        <p className="font-medium">Vous reprenez une copropriété en cours ?</p>
        <p className="mt-1 text-muted-foreground">
          L'assistant de reprise vous guide pour repartir de la balance du
          syndic sortant sans perdre un solde.
        </p>
        <a
          href="/reprise-gestion"
          className="mt-2 inline-block font-medium text-emerald-600 hover:underline"
        >
          Lancer la reprise de gestion →
        </a>
      </div>
    </div>
  )
}
