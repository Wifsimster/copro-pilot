/**
 * Pure generator for a ready-to-vote AG resolution adopting CoproPilot as the
 * copropriété's management tool. Kept free of React so it can be unit-tested.
 */

export interface ResolutionInput {
  /** Copropriété name, e.g. "Résidence Les Tilleuls". */
  coproName: string
  /** Chosen plan label, e.g. "Essentiel". */
  plan: string
  /** Annual price in euros (TTC). */
  prixAnnuel: number
  /** Accounting year the vote applies to, e.g. 2026. */
  exercice: number
  /** Voting majority article — art. 24 (simple) by default. */
  majorite?: '24' | '25' | '26'
}

const MAJORITE_LABELS: Record<string, string> = {
  '24': "à la majorité de l'article 24 (majorité des voix exprimées)",
  '25': "à la majorité de l'article 25 (majorité de tous les copropriétaires)",
  '26': "à la majorité de l'article 26",
}

function formatEur(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

/**
 * Build the resolution text. Throws on invalid input so the UI can surface a
 * precise message.
 */
export function generateResolutionText(input: ResolutionInput): string {
  const {
    coproName,
    plan,
    prixAnnuel,
    exercice,
    majorite = '24',
  } = input

  if (!coproName || !coproName.trim()) {
    throw new Error('Le nom de la copropriété est requis.')
  }
  if (!plan || !plan.trim()) {
    throw new Error('Le plan est requis.')
  }
  if (!Number.isFinite(prixAnnuel) || prixAnnuel < 0) {
    throw new Error('Le prix annuel doit être positif ou nul.')
  }
  if (!Number.isInteger(exercice) || exercice < 2000) {
    throw new Error("L'exercice doit être une année valide.")
  }

  const majoriteLabel =
    MAJORITE_LABELS[majorite] ?? MAJORITE_LABELS['24']

  return `RÉSOLUTION — Adoption d'un outil de gestion de copropriété

Copropriété : ${coproName.trim()}
Exercice concerné : ${exercice}

L'assemblée générale, après en avoir délibéré, décide d'adopter le logiciel de gestion de copropriété CoproPilot (formule « ${plan.trim()} ») pour la gestion administrative, comptable et documentaire du syndicat des copropriétaires.

Le coût de l'abonnement, soit ${formatEur(prixAnnuel)} par an, est inscrit au budget prévisionnel de l'exercice ${exercice} et réparti entre les copropriétaires selon les tantièmes de charges générales.

Cette résolution est adoptée ${majoriteLabel}.

Résultat du vote :
— Pour : ____   — Contre : ____   — Abstentions : ____`
}
