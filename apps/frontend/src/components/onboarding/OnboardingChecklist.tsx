import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  computeOnboardingProgress,
  type OnboardingStep,
} from '@/lib/onboarding'

interface OnboardingChecklistProps {
  steps: OnboardingStep[]
  /** Map of completed step keys, e.g. { copropriete: true }. */
  completed?: Record<string, boolean>
}

export function OnboardingChecklist({
  steps,
  completed = {},
}: OnboardingChecklistProps) {
  const progress = computeOnboardingProgress(steps, completed)

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Votre progression</span>
          <span className="text-muted-foreground">
            {progress.completedCount}/{progress.total}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.round(progress.ratio * 100)}%` }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map(step => {
          const isDone = !!completed[step.key]
          return (
            <li
              key={step.key}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              {isDone ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    isDone
                      ? 'font-medium text-muted-foreground line-through'
                      : 'font-medium'
                  }
                >
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {!isDone && (
                <Button asChild variant="ghost" size="sm">
                  <a href={step.href} aria-label={`Aller à : ${step.title}`}>
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              )}
            </li>
          )
        })}
      </ol>

      {progress.done && (
        <p className="rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          🎉 Votre première AG est prête !
        </p>
      )}
    </div>
  )
}
