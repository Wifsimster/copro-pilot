import knexDatabase from '../config/knex-database.js'
import { MouvementBancaireModel } from '../models/MouvementBancaire.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class ReconciliationService {
  async getSuggestedMatches(compteBancaireId) {
    try {
      const db = getDb()

      // Get the compte to find its copropriete_id
      const compte = await db('comptes_bancaires')
        .where('id', compteBancaireId)
        .first()
      if (!compte) {
        throw new Error('Compte bancaire non trouve')
      }

      // Get unreconciled movements
      const mouvements = await db('mouvements_bancaires')
        .where('compte_id', compteBancaireId)
        .where('rapproche', false)
        .orderBy('date', 'desc')

      // Get open appels de fonds for the same copropriete
      const appelsFonds = await db('appels_fonds')
        .where('copropriete_id', compte.copropriete_id)
        .where('statut', 'emis')
        .orderBy('date_echeance', 'desc')

      const matches = []

      for (const mouvement of mouvements) {
        for (const appel of appelsFonds) {
          const score = this._calculateScore(
            mouvement,
            appel
          )
          if (score <= 0) continue

          let confidence = 'faible'
          if (score >= 200) confidence = 'haute'
          else if (score >= 100) confidence = 'moyenne'

          matches.push({
            mouvement_id: mouvement.id,
            mouvement_libelle: mouvement.libelle,
            mouvement_montant: parseFloat(mouvement.montant),
            mouvement_date: mouvement.date,
            appel_fonds_id: appel.id,
            appel_fonds_reference: `T${appel.trimestre}-${appel.annee}`,
            appel_fonds_montant: parseFloat(
              appel.montant_total
            ),
            appel_fonds_date: appel.date_echeance,
            score,
            confidence,
          })
        }
      }

      matches.sort((a, b) => b.score - a.score)

      logger.info(
        `[ReconciliationService] Found ${matches.length} suggested matches for compte ${compteBancaireId}`
      )
      return matches
    } catch (error) {
      logger.error(
        `[ReconciliationService] Error getting suggestions: ${error.message}`
      )
      throw error
    }
  }

  _calculateScore(mouvement, appel) {
    let score = 0

    // Amount match
    const mouvMontant = Math.abs(parseFloat(mouvement.montant))
    const appelMontant = Math.abs(
      parseFloat(appel.montant_total)
    )

    if (mouvMontant > 0 && appelMontant > 0) {
      const diff =
        Math.abs(mouvMontant - appelMontant) / appelMontant
      if (diff === 0) score += 100
      else if (diff <= 0.02) score += 80
      else if (diff <= 0.05) score += 50
    }

    // Date proximity
    const mouvDate = new Date(mouvement.date)
    const appelDate = new Date(appel.date_echeance)
    const daysDiff = Math.abs(
      (mouvDate - appelDate) / 86400000
    )

    if (daysDiff === 0) score += 50
    else if (daysDiff <= 5) score += 30
    else if (daysDiff <= 15) score += 10

    // Reference match
    const reference = `T${appel.trimestre}-${appel.annee}`
    const mouvRef = (mouvement.reference || '').toLowerCase()
    const mouvLib = (mouvement.libelle || '').toLowerCase()
    const appelRef = reference.toLowerCase()

    if (
      mouvRef.includes(appelRef) ||
      mouvLib.includes(appelRef)
    ) {
      score += 100
    }

    return score
  }

  async confirmMatch(mouvementId, appelFondsId) {
    try {
      const db = getDb()

      // Verify both exist
      const mouvement =
        await MouvementBancaireModel.getById(mouvementId)
      if (!mouvement) {
        throw new Error('Mouvement bancaire non trouve')
      }

      const appel = await db('appels_fonds')
        .where('id', appelFondsId)
        .first()
      if (!appel) {
        throw new Error('Appel de fonds non trouve')
      }

      // Update mouvement as reconciled
      await MouvementBancaireModel.update(mouvementId, {
        rapproche: true,
      })

      logger.info(
        `[ReconciliationService] Confirmed match: mouvement ${mouvementId} <-> appel de fonds ${appelFondsId}`
      )

      return {
        mouvement_id: mouvementId,
        appel_fonds_id: appelFondsId,
        statut: 'rapproche',
      }
    } catch (error) {
      logger.error(
        `[ReconciliationService] Error confirming match: ${error.message}`
      )
      throw error
    }
  }
}

export const reconciliationService =
  new ReconciliationService()
