import { searchService } from '../services/SearchService.js'
import { ExtranetModel } from '../models/Extranet.js'
import logger from '../logger.js'

export class SearchController {
  static async search(req, res) {
    try {
      const { q, copropriete_id } = req.query
      if (!q || q.length < 2) {
        return res.status(400).json({
          error:
            'Le paramètre de recherche doit contenir au moins 2 caractères',
        })
      }
      const coproprieteId = copropriete_id
        ? parseInt(copropriete_id, 10)
        : null

      let coproprieteIds = null
      if (req.user?.role?.toLowerCase() === 'coproprietaire') {
        const coproprietaire =
          await ExtranetModel.getCoproprietaireByUserId(req.user.id)
        if (coproprietaire) {
          const coproprietes =
            await ExtranetModel.getCoproprietesByCoproprietaire(
              coproprietaire.id
            )
          coproprieteIds = coproprietes.map(c => c.id)
        } else {
          coproprieteIds = []
        }
      }

      const results = await searchService.search(
        q,
        coproprieteId,
        coproprieteIds
      )
      res.json({ data: results })
    } catch (error) {
      logger.error(
        `[SearchController] Error searching: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible d\'effectuer la recherche' })
    }
  }
}
