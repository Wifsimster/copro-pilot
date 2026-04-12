import { agReportService } from '../services/AgReportService.js'
import logger from '../logger.js'

export class AgReportController {
  static async getAnnexe(req, res) {
    try {
      const { coproprieteId, numero } = req.params
      const annee = parseInt(req.query.annee, 10)

      if (!annee || isNaN(annee)) {
        return res
          .status(400)
          .json({ error: 'Le paramètre annee est obligatoire' })
      }

      const num = parseInt(numero, 10)
      if (num < 1 || num > 5) {
        return res.status(400).json({
          error: 'Le numéro d\'annexe doit être entre 1 et 5',
        })
      }

      const methodMap = {
        1: 'getAnnexe1',
        2: 'getAnnexe2',
        3: 'getAnnexe3',
        4: 'getAnnexe4',
        5: 'getAnnexe5',
      }

      const data = await agReportService[methodMap[num]](
        parseInt(coproprieteId, 10),
        annee
      )

      res.json({ data })
    } catch (error) {
      logger.error(
        `[AgReportController] Error getAnnexe: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de générer l\'annexe',
      })
    }
  }

  static async getPackComplet(req, res) {
    try {
      const { coproprieteId } = req.params
      const annee = parseInt(req.query.annee, 10)

      if (!annee || isNaN(annee)) {
        return res
          .status(400)
          .json({ error: 'Le paramètre annee est obligatoire' })
      }

      const data = await agReportService.getPackComplet(
        parseInt(coproprieteId, 10),
        annee
      )

      res.json({ data })
    } catch (error) {
      logger.error(
        `[AgReportController] Error getPackComplet: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de générer le pack complet',
      })
    }
  }
}
