/**
 * Régularisation des charges — pure computation for the annual close.
 *
 * At the end of an exercise the provisions called during the year are
 * reconciled against the real expenses: each lot's share of the real charges
 * (by tantièmes) is compared to the provisions it paid, yielding a solde
 * (créditeur = remboursement, débiteur = complément à appeler). This is the
 * clôture act at which annual retention is decided (doc 2/3 §5, rang 3).
 *
 * Framework-free and cent-exact: per-lot shares are allocated by the
 * largest-remainder method so they sum *exactly* to the total (no rounding
 * drift, the classic répartition pitfall).
 */

const CENT = 100

export interface RegLot {
  id: number
  numero: string
  tantiemes: number
  /** Provisions actually paid by this lot, in euros. If omitted, provisions
   * are assumed called on tantièmes and derived from `totalProvisions`. */
  provisionsPayees?: number
}

export interface RegLigne {
  lotId: number
  numero: string
  tantiemes: number
  quotePart: number
  provisions: number
  /** provisions − quotePart : > 0 créditeur (remboursement), < 0 débiteur. */
  solde: number
  sens: 'crediteur' | 'debiteur' | 'equilibre'
}

export interface RegularisationResult {
  lignes: RegLigne[]
  totalTantiemes: number
  totalChargesReelles: number
  totalProvisions: number
  /** provisions − charges réelles (excédent si > 0, insuffisance si < 0). */
  soldeGlobal: number
  totalRemboursements: number
  totalComplements: number
}

/**
 * Allocate `totalCents` across integer `weights` so the parts are integers
 * summing exactly to `totalCents` (largest-remainder method).
 */
function repartirCents(totalCents: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  if (totalWeight <= 0) return weights.map(() => 0)

  const exact = weights.map(w => (totalCents * w) / totalWeight)
  const floored = exact.map(Math.floor)
  let remainder = totalCents - floored.reduce((a, b) => a + b, 0)

  // Distribute the leftover cents to the largest fractional remainders.
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)

  const result = [...floored]
  for (let k = 0; k < order.length && remainder > 0; k++) {
    result[order[k].i] += 1
    remainder -= 1
  }
  return result
}

export function computeRegularisation(
  lots: RegLot[],
  totalChargesReelles: number,
  totalProvisions: number
): RegularisationResult {
  if (!Array.isArray(lots) || lots.length === 0) {
    throw new Error('Aucun lot à régulariser.')
  }
  const totalTantiemes = lots.reduce((s, l) => s + Number(l.tantiemes || 0), 0)
  if (totalTantiemes <= 0) {
    throw new Error('La somme des tantièmes doit être positive.')
  }
  if (totalChargesReelles < 0 || totalProvisions < 0) {
    throw new Error('Les montants doivent être positifs ou nuls.')
  }

  const weights = lots.map(l => Number(l.tantiemes || 0))
  const chargeCents = repartirCents(
    Math.round(totalChargesReelles * CENT),
    weights
  )

  // Provisions: use per-lot amounts if all provided, else allocate by tantièmes.
  const hasPerLot = lots.every(
    l => l.provisionsPayees !== undefined && l.provisionsPayees !== null
  )
  const provisionCents = hasPerLot
    ? lots.map(l => Math.round(Number(l.provisionsPayees) * CENT))
    : repartirCents(Math.round(totalProvisions * CENT), weights)

  let totalRemboursementsC = 0
  let totalComplementsC = 0

  const lignes: RegLigne[] = lots.map((l, i) => {
    const soldeC = provisionCents[i] - chargeCents[i]
    if (soldeC > 0) totalRemboursementsC += soldeC
    else if (soldeC < 0) totalComplementsC += -soldeC
    return {
      lotId: l.id,
      numero: l.numero,
      tantiemes: Number(l.tantiemes || 0),
      quotePart: chargeCents[i] / CENT,
      provisions: provisionCents[i] / CENT,
      solde: soldeC / CENT,
      sens: soldeC > 0 ? 'crediteur' : soldeC < 0 ? 'debiteur' : 'equilibre',
    }
  })

  const provisionsTotalC = provisionCents.reduce((a, b) => a + b, 0)
  const chargesTotalC = chargeCents.reduce((a, b) => a + b, 0)

  return {
    lignes,
    totalTantiemes,
    totalChargesReelles: chargesTotalC / CENT,
    totalProvisions: provisionsTotalC / CENT,
    soldeGlobal: (provisionsTotalC - chargesTotalC) / CENT,
    totalRemboursements: totalRemboursementsC / CENT,
    totalComplements: totalComplementsC / CENT,
  }
}
