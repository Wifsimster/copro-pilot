import { reconciliationService } from '../services/ReconciliationService.js'
import logger from '../logger.js'

export class ReconciliationController {
  static async getSuggestedMatches(req, res) {
    try {
      const { compteBancaireId } = req.params
      const matches =
        await reconciliationService.getSuggestedMatches(
          compteBancaireId
        )
      res.json({ data: matches })
    } catch (error) {
      logger.error(
        `[ReconciliationController] Error: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de recuperer les suggestions de rapprochement',
      })
    }
  }

  static async confirmMatch(req, res) {
    try {
      const { mouvementId, appelFondsId } = req.body
      if (!mouvementId || !appelFondsId) {
        return res.status(400).json({
          error:
            'Les champs mouvementId et appelFondsId sont obligatoires',
        })
      }
      const result =
        await reconciliationService.confirmMatch(
          mouvementId,
          appelFondsId
        )
      res.json({
        data: result,
        message: 'Rapprochement confirme avec succes',
      })
    } catch (error) {
      logger.error(
        `[ReconciliationController] Error confirming: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de confirmer le rapprochement',
      })
    }
  }
}
