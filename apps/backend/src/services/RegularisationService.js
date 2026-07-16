import { RegularisationModel } from '../models/Regularisation.js'
import { LotModel } from '../models/Lot.js'
import knexDatabase from '../config/knex-database.js'
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

/**
 * Build the complementary appel de fonds from a régularisation's per-lot
 * soldes. A lot's line = −solde : a débiteur (solde < 0) is called for the
 * shortfall (positive), a créditeur (solde > 0) is credited (negative). The
 * total nets to −solde_global (positive = net call, negative = net refund).
 * `coproByLot` maps lot_id → coproprietaire_id (Map or plain object).
 */
export function buildRegularisationAppel(regularisation, coproByLot) {
  const lookup = lotId =>
    coproByLot instanceof Map
      ? (coproByLot.get(lotId) ?? null)
      : (coproByLot?.[lotId] ?? null)

  const lignes = (regularisation.lignes || []).map(l => ({
    lot_id: l.lot_id,
    coproprietaire_id: lookup(l.lot_id),
    montant: Math.round(-Number(l.solde) * 100) / 100,
  }))
  const montant_total =
    Math.round(lignes.reduce((s, l) => s + l.montant, 0) * 100) / 100
  return { montant_total, lignes }
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

  /**
   * Generate the complementary appel de fonds (débiteurs called, créditeurs
   * credited) from a saved régularisation, and mark the régularisation validée.
   * Idempotent: refuses if an appel already exists for this régularisation.
   */
  async genererAppel(regularisationId) {
    const db = knexDatabase.getKnex()
    const reg = await RegularisationModel.getById(regularisationId)
    if (!reg) throw new Error('Régularisation introuvable')

    const existing = await db('appels_fonds')
      .where('regularisation_id', regularisationId)
      .first()
    if (existing) {
      throw new Error(
        'Un appel de régularisation existe déjà pour cette régularisation.'
      )
    }

    const lots = await LotModel.getAllByCopropriete(reg.copropriete_id)
    const coproByLot = new Map(lots.map(l => [l.id, l.coproprietaire_id]))
    const { montant_total, lignes } = buildRegularisationAppel(reg, coproByLot)

    return db.transaction(async trx => {
      const [appel] = await trx('appels_fonds')
        .insert({
          copropriete_id: reg.copropriete_id,
          regularisation_id: reg.id,
          trimestre: 4,
          annee: reg.annee,
          montant_total,
          date_emission: `${reg.annee}-12-01`,
          date_echeance: `${reg.annee + 1}-01-31`,
          statut: 'brouillon',
        })
        .returning('*')

      if (lignes.length) {
        await trx('appels_fonds_lignes').insert(
          lignes.map(l => ({ ...l, appel_fonds_id: appel.id }))
        )
      }

      await trx('regularisations')
        .where('id', reg.id)
        .update({ statut: 'validee', updated_at: trx.fn.now() })

      return appel
    })
  }
}

export const regularisationService = new RegularisationService()
