/**
 * Guidance rules for the appel-de-fonds guided workflow. Pure and framework-
 * free so they can be unit-tested. These encode the "guided, not a form"
 * differentiator: at each step the product checks the things a volunteer
 * syndic gets wrong and would be liable for (duplicate quarter, amount out of
 * line with the voted budget, échéance before émission).
 */

export interface AppelFondsDraft {
  trimestre: number
  annee: number
  montant_total: number
  date_emission: string
  date_echeance: string
}

interface ExistingAppel {
  trimestre: number
  annee: number
  montant_total: number
}

/** An appel already exists for this quarter/year → risk of double call. */
export function isDuplicateTrimestre(
  existing: ExistingAppel[],
  trimestre: number,
  annee: number
): boolean {
  return (existing ?? []).some(
    a => a.trimestre === trimestre && a.annee === annee
  )
}

/** Usual quarterly call = voted annual budget / 4 (rounded to the euro). */
export function suggestTrimestrielAmount(
  budgetAnnuel: number | null | undefined
): number | null {
  if (!budgetAnnuel || budgetAnnuel <= 0) return null
  return Math.round(budgetAnnuel / 4)
}

/**
 * Would this call push the year's cumulated calls above the voted budget?
 * Returns null when the annual budget is unknown (check skipped).
 */
export function budgetOverrun(
  existing: ExistingAppel[],
  annee: number,
  montantTotal: number,
  budgetAnnuel: number | null | undefined
): { over: boolean; cumul: number; budget: number } | null {
  if (!budgetAnnuel || budgetAnnuel <= 0) return null
  const cumul =
    (existing ?? [])
      .filter(a => a.annee === annee)
      .reduce((s, a) => s + Number(a.montant_total || 0), 0) +
    Number(montantTotal || 0)
  return { over: cumul > budgetAnnuel + 0.5, cumul, budget: budgetAnnuel }
}

/** Échéance must be on/after émission (an appel can't be due before it is issued). */
export function validateEcheance(
  emission: string,
  echeance: string
): { ok: boolean; message?: string } {
  if (!emission || !echeance) {
    return { ok: false, message: "Renseignez les deux dates." }
  }
  if (echeance < emission) {
    return {
      ok: false,
      message: "L'échéance ne peut pas précéder la date d'émission.",
    }
  }
  return { ok: true }
}

export type WizardStep = 'periode' | 'montant' | 'echeance' | 'recap'

export const WIZARD_STEPS: WizardStep[] = [
  'periode',
  'montant',
  'echeance',
  'recap',
]

/**
 * Per-step gate: blocking errors prevent advancing, warnings are shown but do
 * not block (the syndic may knowingly proceed).
 */
export function evaluateStep(
  step: WizardStep,
  draft: AppelFondsDraft,
  ctx: { existing: ExistingAppel[]; budgetAnnuel?: number | null }
): { canProceed: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (step === 'periode') {
    if (!draft.trimestre || draft.trimestre < 1 || draft.trimestre > 4) {
      errors.push('Choisissez un trimestre.')
    }
    if (!draft.annee || draft.annee < 2000) {
      errors.push('Renseignez une année valide.')
    }
    if (isDuplicateTrimestre(ctx.existing, draft.trimestre, draft.annee)) {
      warnings.push(
        `Un appel existe déjà pour le T${draft.trimestre} ${draft.annee} — vérifiez que vous n'appelez pas deux fois.`
      )
    }
  }

  if (step === 'montant') {
    if (!draft.montant_total || draft.montant_total <= 0) {
      errors.push('Le montant doit être supérieur à 0.')
    }
    const overrun = budgetOverrun(
      ctx.existing,
      draft.annee,
      draft.montant_total,
      ctx.budgetAnnuel
    )
    if (overrun?.over) {
      warnings.push(
        `Le cumul des appels ${draft.annee} (${overrun.cumul.toLocaleString('fr-FR')} €) dépasse le budget voté (${overrun.budget.toLocaleString('fr-FR')} €).`
      )
    }
  }

  if (step === 'echeance') {
    const v = validateEcheance(draft.date_emission, draft.date_echeance)
    if (!v.ok && v.message) errors.push(v.message)
  }

  return { canProceed: errors.length === 0, errors, warnings }
}
