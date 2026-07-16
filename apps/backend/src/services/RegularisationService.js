import { RegularisationModel } from '../models/Regularisation.js'
import { LotModel } from '../models/Lot.js'
import logger from '../logger.js'

const CENT = 100

/**
 * Allocate `totalCents` across integer `weights` so the parts are integers
 * summing exactly to `totalCents` (largest-remainder method). Mirror of the
 * frontend helper — kept server-side so the persisted régularisation is
 * recomputed authoritatively, never trusted from the client.
 */
function repartirCents(totalCents, weights) {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  if (totalWeight <= 0) return weights.map(() => 0)
  const exact = weights.map(w => (totalCents * w) / totalWeight)
  const floored = exact.map(Math.floor)
  let remainder = totalCents - floored.reduce((a, b) => a + b, 0)
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

/**
 * Compute the régularisation from lots (with tantièmes), the real charges and
 * the called provisions. Cent-exact: per-lot shares sum exactly to the totals.
 */
export function computeRegularisation(lots, totalChargesReelles, totalProvisions) {
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
  const provisionCents = repartirCents(
    Math.round(totalProvisions * CENT),
    weights
  )

  let remboursementsC = 0
  let complementsC = 0
  const lignes = lots.map((l, i) => {
    const soldeC = provisionCents[i] - chargeCents[i]
    if (soldeC > 0) remboursementsC += soldeC
    else if (soldeC < 0) complementsC += -soldeC
    return {
      lot_id: l.id,
      tantiemes: Number(l.tantiemes || 0),
      quote_part: chargeCents[i] / CENT,
      provisions: provisionCents[i] / CENT,
      solde: soldeC / CENT,
      sens: soldeC > 0 ? 'crediteur' : soldeC < 0 ? 'debiteur' : 'equilibre',
    }
  })

  const chargesTotalC = chargeCents.reduce((a, b) => a + b, 0)
  const provisionsTotalC = provisionCents.reduce((a, b) => a + b, 0)

  return {
    lignes,
    total_charges_reelles: chargesTotalC / CENT,
    total_provisions: provisionsTotalC / CENT,
    solde_global: (provisionsTotalC - chargesTotalC) / CENT,
    total_remboursements: remboursementsC / CENT,
    total_complements: complementsC / CENT,
  }
}

class RegularisationService {
  async getAllByCopropriete(coproprieteId) {
    return RegularisationModel.getAllByCopropriete(coproprieteId)
  }

  async getById(id) {
    return RegularisationModel.getById(id)
  }

  /**
   * Recompute server-side from the copropriété's lots and persist.
   */
  async create({ copropriete_id, annee, charges_reelles, provisions, statut }) {
    const lots = await LotModel.getAllByCopropriete(copropriete_id)
    const computed = computeRegularisation(
      lots,
      Number(charges_reelles),
      Number(provisions)
    )
    const header = {
      copropriete_id,
      annee,
      total_charges_reelles: computed.total_charges_reelles,
      total_provisions: computed.total_provisions,
      solde_global: computed.solde_global,
      total_remboursements: computed.total_remboursements,
      total_complements: computed.total_complements,
      statut: statut === 'validee' ? 'validee' : 'brouillon',
    }
    try {
      const reg = await RegularisationModel.create(header, computed.lignes)
      return RegularisationModel.getById(reg.id)
    } catch (error) {
      logger.error(
        `[RegularisationService] Error creating régularisation: ${error.message}`
      )
      throw error
    }
  }
}

export const regularisationService = new RegularisationService()
