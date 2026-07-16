/**
 * Pure calculation helpers behind the public SEO calculators. Kept free of
 * React so they can be unit-tested in isolation.
 */

export interface QuotePartInput {
  /** Total number of tantièmes for the copropriété (usually 1000 or 10000). */
  totalTantiemes: number
  /** Tantièmes attached to the lot. */
  lotTantiemes: number
  /** Total amount to split across the copropriété, in euros. */
  montantTotal: number
}

export interface QuotePartResult {
  /** Share ratio in [0, 1]. */
  ratio: number
  /** Share as a percentage, rounded to 2 decimals. */
  pourcentage: number
  /** Amount owed by the lot, rounded to the cent. */
  quotePart: number
}

/**
 * Compute a lot's share of a charge from its tantièmes.
 * Throws on invalid input (non-positive total, lot greater than total,
 * negative values) so the UI can surface a precise message.
 */
export function computeQuotePart({
  totalTantiemes,
  lotTantiemes,
  montantTotal,
}: QuotePartInput): QuotePartResult {
  if (!Number.isFinite(totalTantiemes) || totalTantiemes <= 0) {
    throw new Error('Le total des tantièmes doit être un nombre positif.')
  }
  if (!Number.isFinite(lotTantiemes) || lotTantiemes < 0) {
    throw new Error('Les tantièmes du lot doivent être positifs ou nuls.')
  }
  if (lotTantiemes > totalTantiemes) {
    throw new Error(
      'Les tantièmes du lot ne peuvent pas dépasser le total.'
    )
  }
  if (!Number.isFinite(montantTotal) || montantTotal < 0) {
    throw new Error('Le montant doit être positif ou nul.')
  }

  const ratio = lotTantiemes / totalTantiemes
  return {
    ratio,
    pourcentage: Math.round(ratio * 100 * 100) / 100,
    quotePart: Math.round(montantTotal * ratio * 100) / 100,
  }
}
