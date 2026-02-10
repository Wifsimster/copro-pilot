import { ficheSynthetiqueService } from '../services/FicheSynthetiqueService.js'
import logger from '../logger.js'

export class FicheSynthetiqueController {
  static async get(req, res) {
    try {
      const { id } = req.params
      const fiche = await ficheSynthetiqueService.getForCopropriete(id)
      if (!fiche) {
        return res.status(404).json({ error: 'Copropriété non trouvée' })
      }
      res.json({ data: fiche })
    } catch (error) {
      logger.error(`[FicheSynthetiqueController] Error: ${error.message}`)
      res
        .status(500)
        .json({ error: 'Impossible de générer la fiche synthétique' })
    }
  }
}
