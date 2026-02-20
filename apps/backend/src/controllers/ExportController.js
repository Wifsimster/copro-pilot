import { exportService } from '../services/ExportService.js'
import logger from '../logger.js'

export class ExportController {
  static async budgetPdf(req, res) {
    try {
      const { id } = req.params
      const pdfDoc = await exportService.getBudgetPdf(id)
      if (!pdfDoc) {
        return res.status(404).json({ error: 'Budget non trouve' })
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="budget-${id}.pdf"`)
      pdfDoc.pipe(res)
    } catch (error) {
      logger.error(`[ExportController] Error generating budget PDF: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer le PDF du budget' })
    }
  }

  static async appelFondsPdf(req, res) {
    try {
      const { id } = req.params
      const pdfDoc = await exportService.getAppelFondsPdf(id)
      if (!pdfDoc) {
        return res.status(404).json({ error: 'Appel de fonds non trouve' })
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="appel-fonds-${id}.pdf"`)
      pdfDoc.pipe(res)
    } catch (error) {
      logger.error(`[ExportController] Error generating appel de fonds PDF: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer le PDF de l\'appel de fonds' })
    }
  }

  static async feuillePresencePdf(req, res) {
    try {
      const { id } = req.params
      const pdfDoc = await exportService.getFeuillePresencePdf(id)
      if (!pdfDoc) {
        return res.status(404).json({ error: 'Assemblee generale non trouvee' })
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="feuille-presence-ag-${id}.pdf"`)
      pdfDoc.pipe(res)
    } catch (error) {
      logger.error(`[ExportController] Error generating feuille de presence PDF: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer la feuille de presence' })
    }
  }

  static async carnetEntretienPdf(req, res) {
    try {
      const { coproprieteId } = req.params
      const pdfDoc = await exportService.getCarnetEntretienPdf(coproprieteId)
      if (!pdfDoc) {
        return res.status(404).json({ error: 'Copropriete non trouvee' })
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="carnet-entretien-${coproprieteId}.pdf"`)
      pdfDoc.pipe(res)
    } catch (error) {
      logger.error(`[ExportController] Error generating carnet d'entretien PDF: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer le carnet d\'entretien' })
    }
  }

  static async etatImpayesPdf(req, res) {
    try {
      const { coproprieteId } = req.params
      const pdfDoc = await exportService.getEtatImpayesPdf(coproprieteId)
      if (!pdfDoc) {
        return res.status(404).json({ error: 'Copropriete non trouvee' })
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="etat-impayes-${coproprieteId}.pdf"`)
      pdfDoc.pipe(res)
    } catch (error) {
      logger.error(`[ExportController] Error generating etat des impayes PDF: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer l\'etat des impayes' })
    }
  }

  static async coproprietairesExcel(req, res) {
    try {
      const { coproprieteId } = req.query
      const buffer = await exportService.getCoproprietairesExcel(coproprieteId)
      const filename = coproprieteId
        ? `coproprietaires-${coproprieteId}.xlsx`
        : 'coproprietaires.xlsx'
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.end(buffer)
    } catch (error) {
      logger.error(`[ExportController] Error generating coproprietaires Excel: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer l\'export Excel des coproprietaires' })
    }
  }

  static async balanceComptesExcel(req, res) {
    try {
      const { coproprieteId } = req.params
      const buffer = await exportService.getBalanceComptesExcel(coproprieteId)
      if (!buffer) {
        return res.status(404).json({ error: 'Copropriete non trouvee' })
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="balance-comptes-${coproprieteId}.xlsx"`)
      res.end(buffer)
    } catch (error) {
      logger.error(`[ExportController] Error generating balance des comptes Excel: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer la balance des comptes' })
    }
  }

  static async etatChargesExcel(req, res) {
    try {
      const { budgetId } = req.params
      const buffer = await exportService.getEtatChargesExcel(budgetId)
      if (!buffer) {
        return res.status(404).json({ error: 'Budget non trouve' })
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="etat-charges-${budgetId}.xlsx"`)
      res.end(buffer)
    } catch (error) {
      logger.error(`[ExportController] Error generating etat des charges Excel: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer l\'etat des charges' })
    }
  }

  static async etatImpayesExcel(req, res) {
    try {
      const { coproprieteId } = req.params
      const buffer = await exportService.getEtatImpayesExcel(coproprieteId)
      if (!buffer) {
        return res.status(404).json({ error: 'Copropriete non trouvee' })
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="etat-impayes-${coproprieteId}.xlsx"`)
      res.end(buffer)
    } catch (error) {
      logger.error(`[ExportController] Error generating etat des impayes Excel: ${error.message}`)
      res.status(500).json({ error: 'Impossible de generer l\'etat des impayes' })
    }
  }
}
