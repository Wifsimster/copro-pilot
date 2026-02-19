import { extranetService } from '../services/ExtranetService.js'
import logger from '../logger.js'

export class ExtranetController {
  static async getMonProfil(req, res) {
    try {
      const userId = req.user.id
      const profil = await extranetService.getProfilComplet(userId)
      if (!profil) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: profil })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting profil: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le profil' })
    }
  }

  static async getEspaceDocuments(req, res) {
    try {
      const userId = req.user.id
      const { coproprieteId } = req.params
      const documents = await extranetService.getEspaceDocuments(userId, coproprieteId)
      if (!documents) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: documents })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting espace documents: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les documents' })
    }
  }

  static async getMonCompte(req, res) {
    try {
      const userId = req.user.id
      const compte = await extranetService.getMonCompte(userId)
      if (!compte) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: compte })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting mon compte: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le compte' })
    }
  }

  static async getMesCharges(req, res) {
    try {
      const userId = req.user.id
      const charges = await extranetService.getMesCharges(userId)
      if (!charges) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: charges })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting mes charges: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les charges' })
    }
  }

  static async getMesAppelsFonds(req, res) {
    try {
      const userId = req.user.id
      const appelsFonds = await extranetService.getMesAppelsFonds(userId)
      if (!appelsFonds) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: appelsFonds })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting mes appels de fonds: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les appels de fonds' })
    }
  }

  static async getMonFondsTravaux(req, res) {
    try {
      const userId = req.user.id
      const fondsTravaux = await extranetService.getMonFondsTravaux(userId)
      if (!fondsTravaux) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: fondsTravaux })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting mon fonds travaux: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le fonds travaux' })
    }
  }

  static async getDashboard(req, res) {
    try {
      const userId = req.user.id
      const dashboard = await extranetService.getDashboard(userId)
      if (!dashboard) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      res.json({ data: dashboard })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting dashboard: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le tableau de bord' })
    }
  }

  static async getDonneesConseilSyndical(req, res) {
    try {
      const userId = req.user.id
      const { coproprieteId } = req.params
      const result = await extranetService.getDonneesConseilSyndical(userId, coproprieteId)
      if (!result) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      if (result.forbidden) {
        return res.status(403).json({ error: 'Accès réservé aux membres du conseil syndical' })
      }
      res.json({ data: result })
    } catch (error) {
      logger.error(`[ExtranetController] Error getting données conseil syndical: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les données du conseil syndical' })
    }
  }
}
