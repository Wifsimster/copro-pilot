/**
 * Guided AG builder — pure helpers. Framework-free so they can be unit-tested.
 *
 * The value of guiding an AG (vs a flat form) is catching the mistakes that
 * get an AG annulled: the convocation notice delay and the voting majority.
 */

export type TypeMajorite =
  | 'article_24'
  | 'article_25'
  | 'article_26'
  | 'unanimite'

export const MAJORITE_OPTIONS: { value: TypeMajorite; label: string }[] = [
  { value: 'article_24', label: 'Art. 24 — majorité des voix exprimées' },
  {
    value: 'article_25',
    label: 'Art. 25 — majorité de tous les copropriétaires',
  },
  { value: 'article_26', label: 'Art. 26 — double majorité' },
  { value: 'unanimite', label: 'Unanimité' },
]

/** Whole days between two ISO dates (YYYY-MM-DD), d2 − d1. */
export function joursEntre(d1: string, d2: string): number {
  const a = Date.parse(`${d1}T00:00:00Z`)
  const b = Date.parse(`${d2}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN
  return Math.round((b - a) / 86400000)
}

/** Legal minimum notice: the convocation must reach copropriétaires at least
 * 21 days before the AG (art. 9 décret du 17 mars 1967). */
export const DELAI_CONVOCATION_MIN = 21

export function verifierDelaiConvocation(
  dateConvocation: string,
  dateAG: string
): { ok: boolean; jours: number; message?: string } {
  const jours = joursEntre(dateConvocation, dateAG)
  if (Number.isNaN(jours)) {
    return { ok: false, jours: NaN, message: 'Dates invalides.' }
  }
  if (jours < DELAI_CONVOCATION_MIN) {
    return {
      ok: false,
      jours,
      message: `Délai de convocation insuffisant : ${jours} jours (minimum légal ${DELAI_CONVOCATION_MIN} jours, art. 9). Une AG convoquée trop tard est annulable.`,
    }
  }
  return { ok: true, jours }
}
