import { regularisationService } from '../services/RegularisationService.js'
import logger from '../logger.js'

export class RegularisationController {
  static async generatePostAgBudget(req, res) {
    try {
      const { agId } = req.body
      if (!agId) {
        return res
          .status(400)
          .json({ error: 'Le champ agId est obligatoire' })
      }

      const budget =
        await regularisationService.generatePostAgBudget(
          agId
        )

      if (!budget) {
        return res.status(404).json({
          error:
            'Aucune resolution de budget adoptee trouvee pour cette AG',
        })
      }

      res.status(201).json({
        data: budget,
        message:
          'Budget brouillon genere avec succes depuis l\'AG',
      })
    } catch (error) {
      logger.error(
        `[RegularisationController] Error generating post-AG budget: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de generer le budget depuis l\'AG',
      })
    }
  }

  static async generateAppelsFondsSchedule(req, res) {
    try {
      const { budgetId, coproprieteId } = req.body
      if (!budgetId || !coproprieteId) {
        return res.status(400).json({
          error:
            'Les champs budgetId et coproprieteId sont obligatoires',
        })
      }

      const appels =
        await regularisationService.generateAppelsFondsSchedule(
          budgetId,
          coproprieteId
        )

      if (!appels) {
        return res
          .status(404)
          .json({ error: 'Budget non trouve' })
      }

      res.status(201).json({
        data: appels,
        message:
          'Echeancier d\'appels de fonds genere avec succes',
      })
    } catch (error) {
      logger.error(
        `[RegularisationController] Error generating appels schedule: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de generer l\'echeancier d\'appels de fonds',
      })
    }
  }
}
