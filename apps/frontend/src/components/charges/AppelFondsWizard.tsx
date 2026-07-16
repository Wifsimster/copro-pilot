import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Wand2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreateAppelFonds } from '@/hooks/useAppelsFonds'
import type { AppelFonds } from '@/types'
import {
  WIZARD_STEPS,
  evaluateStep,
  suggestTrimestrielAmount,
  type WizardStep,
  type AppelFondsDraft,
} from '@/lib/appelFondsWizard'

const STEP_TITLES: Record<WizardStep, string> = {
  periode: '1. Période',
  montant: '2. Montant',
  echeance: "3. Émission & échéance",
  recap: '4. Vérification',
}

interface AppelFondsWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  /** Existing calls, used to warn about duplicate quarters / budget overrun. */
  existing: AppelFonds[]
  /** Voted annual budget, if known — enables the amount suggestion and overrun check. */
  budgetAnnuel?: number | null
  onCreated?: () => void
}

function today() {
  return new Date().toISOString().split('T')[0]
}
function inDays(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().split('T')[0]
}

export function AppelFondsWizard({
  open,
  onOpenChange,
  coproprieteId,
  existing,
  budgetAnnuel,
  onCreated,
}: AppelFondsWizardProps) {
  const now = new Date()
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<AppelFondsDraft>({
    trimestre: Math.ceil((now.getMonth() + 1) / 3),
    annee: now.getFullYear(),
    montant_total: 0,
    date_emission: today(),
    date_echeance: inDays(30),
  })

  const createAppel = useCreateAppelFonds()
  const step = WIZARD_STEPS[stepIndex]
  const suggestion = suggestTrimestrielAmount(budgetAnnuel)

  const evaluation = useMemo(
    () => evaluateStep(step, draft, { existing, budgetAnnuel }),
    [step, draft, existing, budgetAnnuel]
  )

  function set<K extends keyof AppelFondsDraft>(
    key: K,
    value: AppelFondsDraft[K]
  ) {
    setDraft(d => ({ ...d, [key]: value }))
  }

  function next() {
    if (evaluation.canProceed && stepIndex < WIZARD_STEPS.length - 1) {
      setStepIndex(i => i + 1)
    }
  }
  function back() {
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  async function submit() {
    await createAppel.mutateAsync({
      ...draft,
      copropriete_id: coproprieteId,
    })
    onCreated?.()
    onOpenChange(false)
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="size-5 text-emerald-600" />
            Nouvel appel de fonds — assistant guidé
          </DialogTitle>
          <DialogDescription>
            {STEP_TITLES[step]} · étape {stepIndex + 1}/{WIZARD_STEPS.length}
          </DialogDescription>
        </DialogHeader>

        {/* progress */}
        <div className="flex gap-1">
          {WIZARD_STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                i <= stepIndex ? 'bg-emerald-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="space-y-4 py-2">
          {step === 'periode' && (
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="text-sm font-medium">Trimestre</span>
                <select
                  className={inputCls}
                  value={draft.trimestre}
                  onChange={e => set('trimestre', Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map(t => (
                    <option key={t} value={t}>
                      T{t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="w-32">
                <span className="text-sm font-medium">Année</span>
                <input
                  type="number"
                  className={inputCls}
                  value={draft.annee}
                  onChange={e => set('annee', Number(e.target.value))}
                />
              </label>
            </div>
          )}

          {step === 'montant' && (
            <label className="block">
              <span className="text-sm font-medium">
                Montant total à appeler (€)
              </span>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={draft.montant_total || ''}
                onChange={e => set('montant_total', Number(e.target.value))}
                placeholder="12500"
              />
              {suggestion != null && (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
                  onClick={() => set('montant_total', suggestion)}
                >
                  Suggestion : {suggestion.toLocaleString('fr-FR')} € (¼ du
                  budget voté)
                </button>
              )}
            </label>
          )}

          {step === 'echeance' && (
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="text-sm font-medium">Date d'émission</span>
                <input
                  type="date"
                  className={inputCls}
                  value={draft.date_emission}
                  onChange={e => set('date_emission', e.target.value)}
                />
              </label>
              <label className="flex-1">
                <span className="text-sm font-medium">Date d'échéance</span>
                <input
                  type="date"
                  className={inputCls}
                  value={draft.date_echeance}
                  onChange={e => set('date_echeance', e.target.value)}
                />
              </label>
            </div>
          )}

          {step === 'recap' && (
            <dl className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Période</dt>
                <dd className="font-medium">
                  T{draft.trimestre} {draft.annee}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Montant</dt>
                <dd className="font-medium">
                  {draft.montant_total.toLocaleString('fr-FR')} €
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Émission → échéance</dt>
                <dd className="font-medium">
                  {draft.date_emission} → {draft.date_echeance}
                </dd>
              </div>
            </dl>
          )}

          {/* guidance: blocking errors + non-blocking warnings */}
          {evaluation.errors.map(msg => (
            <p key={msg} className="text-sm font-medium text-destructive">
              {msg}
            </p>
          ))}
          {evaluation.warnings.map(msg => (
            <p
              key={msg}
              className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {msg}
            </p>
          ))}
        </div>

        <DialogFooter>
          {stepIndex > 0 && (
            <Button type="button" variant="outline" onClick={back}>
              <ArrowLeft className="size-4" /> Retour
            </Button>
          )}
          {step !== 'recap' ? (
            <Button
              type="button"
              onClick={next}
              disabled={!evaluation.canProceed}
            >
              Continuer <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={createAppel.isPending}
            >
              <Check className="size-4" />
              {createAppel.isPending ? 'Création…' : "Créer l'appel"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
