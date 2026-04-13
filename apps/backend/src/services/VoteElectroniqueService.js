import knexDatabase from '../config/knex-database.js'
import { VoteElectroniqueModel } from '../models/VoteElectronique.js'
import { ProcurationModel } from '../models/Procuration.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

const ALLOWED_VOTES = ['pour', 'contre', 'abstention']
const ALLOWED_MODES = ['presentiel', 'correspondance', 'en_ligne']

class VoteElectroniqueService {
  async getByResolution(resolutionId) {
    try {
      return await VoteElectroniqueModel.getByResolution(resolutionId)
    } catch (error) {
      logger.error(
        `[VoteElectroniqueService] Error getting votes by resolution: ${error.message}`
      )
      throw error
    }
  }

  async getByAg(agId) {
    try {
      return await VoteElectroniqueModel.getByAg(agId)
    } catch (error) {
      logger.error(
        `[VoteElectroniqueService] Error getting votes by AG: ${error.message}`
      )
      throw error
    }
  }

  async getByCoproprietaire(coproprietaireId, agId) {
    try {
      return await VoteElectroniqueModel.getByCoproprietaire(
        coproprietaireId,
        agId
      )
    } catch (error) {
      logger.error(
        `[VoteElectroniqueService] Error getting votes by copro: ${error.message}`
      )
      throw error
    }
  }

  async castVote({ resolutionId, coproprietaireId, vote, mode, ipAddress }) {
    try {
      if (!resolutionId || !coproprietaireId || !vote || !mode) {
        const err = new Error('Champs obligatoires manquants')
        err.status = 400
        throw err
      }
      if (!ALLOWED_VOTES.includes(vote)) {
        const err = new Error(
          `Vote invalide. Valeurs autorisées: ${ALLOWED_VOTES.join(', ')}`
        )
        err.status = 400
        throw err
      }
      if (!ALLOWED_MODES.includes(mode)) {
        const err = new Error(
          `Mode invalide. Valeurs autorisées: ${ALLOWED_MODES.join(', ')}`
        )
        err.status = 400
        throw err
      }

      const db = getDb()

      // 1. Fetch resolution + AG to verify it's votable
      const resolution = await db('resolutions')
        .where('id', resolutionId)
        .first()
      if (!resolution) {
        const err = new Error('Résolution non trouvée')
        err.status = 404
        throw err
      }

      const ag = await db('assemblees_generales')
        .where('id', resolution.ag_id)
        .first()
      if (!ag) {
        const err = new Error('Assemblée générale non trouvée')
        err.status = 404
        throw err
      }

      // Verify votable state based on mode
      // - en_ligne / correspondance: allowed for 'convoquee' or 'en_cours'
      // - presentiel: only for 'en_cours'
      if (mode === 'presentiel' && ag.statut !== 'en_cours') {
        const err = new Error(
          'Vote présentiel possible uniquement lorsque l\'AG est en cours'
        )
        err.status = 400
        throw err
      }
      if (
        (mode === 'en_ligne' || mode === 'correspondance') &&
        ag.statut !== 'convoquee' &&
        ag.statut !== 'en_cours'
      ) {
        const err = new Error(
          'Le vote n\'est possible que lorsque l\'AG est convoquée ou en cours'
        )
        err.status = 400
        throw err
      }

      // 2. Verify copro hasn't already voted directly
      const alreadyVoted = await VoteElectroniqueModel.hasVoted(
        resolutionId,
        coproprietaireId
      )
      if (alreadyVoted) {
        const err = new Error(
          'Ce copropriétaire a déjà voté sur cette résolution'
        )
        err.status = 409
        throw err
      }

      // Verify they haven't delegated their voice via an active procuration
      const activeProcuration = await ProcurationModel.getActiveByMandant(
        coproprietaireId,
        ag.id
      )
      if (activeProcuration) {
        const err = new Error(
          'Ce copropriétaire a donné procuration pour cette AG et ne peut pas voter directement'
        )
        err.status = 409
        throw err
      }

      // 3. Compute tantieme weight from lots
      const [{ total }] = await db('lots')
        .where({
          copropriete_id: ag.copropriete_id,
          coproprietaire_id: coproprietaireId,
        })
        .sum({ total: 'tantiemes' })
      const poidsVoix = parseInt(total, 10) || 0

      if (poidsVoix <= 0) {
        const err = new Error(
          'Ce copropriétaire ne possède aucun lot dans cette copropriété'
        )
        err.status = 400
        throw err
      }

      // Add weight of procurations received (as mandataire)
      const procurationsRecues = await db('procurations')
        .where({
          ag_id: ag.id,
          mandataire_id: coproprietaireId,
          statut: 'active',
        })
      let poidsProcurations = 0
      for (const proc of procurationsRecues) {
        const [{ total: t }] = await db('lots')
          .where({
            copropriete_id: ag.copropriete_id,
            coproprietaire_id: proc.mandant_id,
          })
          .sum({ total: 'tantiemes' })
        poidsProcurations += parseInt(t, 10) || 0
      }

      const totalPoids = poidsVoix + poidsProcurations

      // 4. Create vote with hash
      const result = await VoteElectroniqueModel.create({
        resolution_id: resolutionId,
        coproprietaire_id: coproprietaireId,
        vote,
        poids_voix: totalPoids,
        mode,
        ip_address: ipAddress || null,
      })

      logger.info(
        `[VoteElectroniqueService] Vote enregistré: resolution ${resolutionId}, copro ${coproprietaireId}, vote ${vote}, poids ${totalPoids}`
      )
      return result
    } catch (error) {
      logger.error(
        `[VoteElectroniqueService] Error casting vote: ${error.message}`
      )
      throw error
    }
  }

  async getTally(resolutionId) {
    try {
      const db = getDb()
      const resolution = await db('resolutions')
        .where('id', resolutionId)
        .first()
      if (!resolution) {
        const err = new Error('Résolution non trouvée')
        err.status = 404
        throw err
      }

      const ag = await db('assemblees_generales')
        .where('id', resolution.ag_id)
        .first()
      if (!ag) {
        const err = new Error('Assemblée générale non trouvée')
        err.status = 404
        throw err
      }

      const tally = await VoteElectroniqueModel.getTally(resolutionId)

      // Total tantiemes of the copropriete (all lots)
      const [{ total: totalTantiemes }] = await db('lots')
        .where('copropriete_id', ag.copropriete_id)
        .sum({ total: 'tantiemes' })
      const total = parseInt(totalTantiemes, 10) || 0

      const percent = n =>
        total > 0 ? Math.round((n / total) * 10000) / 100 : 0

      return {
        ...tally,
        total_tantiemes: total,
        pourcentage_pour: percent(tally.pour),
        pourcentage_contre: percent(tally.contre),
        pourcentage_abstention: percent(tally.abstention),
        pourcentage_exprimes: percent(tally.total_voix),
      }
    } catch (error) {
      logger.error(
        `[VoteElectroniqueService] Error getting tally: ${error.message}`
      )
      throw error
    }
  }

  async validateResolution(resolutionId) {
    try {
      const db = getDb()
      const resolution = await db('resolutions')
        .where('id', resolutionId)
        .first()
      if (!resolution) {
        const err = new Error('Résolution non trouvée')
        err.status = 404
        throw err
      }

      const tally = await this.getTally(resolutionId)
      const total = tally.total_tantiemes
      const pour = tally.pour
      const contre = tally.contre
      const exprimes = pour + contre // abstentions excluded for majority computations

      let adopted = false
      let rule = resolution.majorite

      switch (rule) {
        case 'article_24': {
          // Simple majority of expressed votes (present + represented)
          adopted = exprimes > 0 && pour > contre
          break
        }
        case 'article_25': {
          // Absolute majority of ALL voices (tous les copropriétaires)
          adopted = total > 0 && pour * 2 > total
          break
        }
        case 'article_26': {
          // Double majority: majority of copro members AND 2/3 of voices
          // Here we approximate with 2/3 of all tantiemes
          adopted = total > 0 && pour * 3 >= total * 2
          break
        }
        case 'unanimite': {
          // Unanimity of ALL voices
          adopted = total > 0 && pour === total
          break
        }
        default: {
          adopted = exprimes > 0 && pour > contre
        }
      }

      return {
        resolution_id: resolutionId,
        majorite: rule,
        tally,
        adoptee: adopted,
        resultat: adopted ? 'adoptee' : 'rejetee',
      }
    } catch (error) {
      logger.error(
        `[VoteElectroniqueService] Error validating resolution: ${error.message}`
      )
      throw error
    }
  }
}

export const voteElectroniqueService = new VoteElectroniqueService()
