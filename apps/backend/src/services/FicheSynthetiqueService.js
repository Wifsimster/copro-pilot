import { FicheSynthetiqueModel } from '../models/FicheSynthetique.js'
import logger from '../logger.js'

class FicheSynthetiqueService {
  async getForCopropriete(coproprieteId) {
    try {
      const fiche = await FicheSynthetiqueModel.getForCopropriete(
        coproprieteId
      )
      if (!fiche) return null
      logger.info(
        `[FicheSynthetiqueService] Fiche synthétique générée pour copropriété ${coproprieteId}`
      )
      return fiche
    } catch (error) {
      logger.error(
        `[FicheSynthetiqueService] Error generating fiche synthétique for copropriété ${coproprieteId}: ${error.message}`
      )
      throw error
    }
  }
}

export const ficheSynthetiqueService = new FicheSynthetiqueService()
