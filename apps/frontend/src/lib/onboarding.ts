/**
 * Guided "première AG en 30 min" onboarding steps and progress logic.
 * Kept free of React so the progression can be unit-tested.
 */

export interface OnboardingStep {
  key: string
  title: string
  description: string
  /** Hash route the step links to. */
  href: string
}

export const PREMIERE_AG_STEPS: OnboardingStep[] = [
  {
    key: 'copropriete',
    title: 'Créer votre copropriété',
    description: 'Renseignez la copropriété et ses lots.',
    href: '/coproprietes',
  },
  {
    key: 'convocation',
    title: 'Préparer la convocation',
    description: "Date, lieu et modalités de l'assemblée générale.",
    href: '/assemblees',
  },
  {
    key: 'ordre_du_jour',
    title: "Rédiger l'ordre du jour",
    description: 'Ajoutez les résolutions à soumettre au vote.',
    href: '/assemblees',
  },
  {
    key: 'presences',
    title: 'Enregistrer présences et procurations',
    description: 'Le jour de l’AG, pointez les présents et pouvoirs.',
    href: '/assemblees',
  },
  {
    key: 'pv',
    title: 'Générer le procès-verbal',
    description: 'Éditez et diffusez le PV après le vote.',
    href: '/assemblees',
  },
]

export interface OnboardingProgress {
  completedCount: number
  total: number
  /** 0..1 */
  ratio: number
  /** First step not yet completed, or null when all done. */
  nextStep: OnboardingStep | null
  done: boolean
}

/**
 * Compute progress from a map of completed step keys. Unknown keys in the map
 * are ignored; only known steps count toward the total.
 */
export function computeOnboardingProgress(
  steps: OnboardingStep[],
  completed: Record<string, boolean>
): OnboardingProgress {
  const total = steps.length
  const completedCount = steps.filter(s => completed[s.key]).length
  const nextStep = steps.find(s => !completed[s.key]) ?? null
  return {
    completedCount,
    total,
    ratio: total > 0 ? completedCount / total : 0,
    nextStep,
    done: completedCount === total && total > 0,
  }
}
