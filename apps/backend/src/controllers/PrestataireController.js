import { prestataireService } from '../services/PrestataireService.js'
import logger from '../logger.js'

export class PrestataireController {
  static async getAll(req, res) {
    try {
      const prestataires = await prestataireService.getAll()
      res.json({ data: prestataires })
    } catch (error) {
      logger.error(`[PrestataireController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les prestataires' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const prestataire = await prestataireService.getById(id)
      if (!prestataire) return res.status(404).json({ error: 'Prestataire non trouvé' })
      res.json({ data: prestataire })
    } catch (error) {
      logger.error(`[PrestataireController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le prestataire' })
    }
  }

  static async create(req, res) {
    try {
      const { nom } = req.body
      if (!nom) {
        return res.status(400).json({ error: 'Le champ nom est obligatoire' })
      }
      const result = await prestataireService.create(req.body)
      res.status(201).json({ data: result, message: 'Prestataire créé avec succès' })
    } catch (error) {
      logger.error(`[PrestataireController] Error creating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer le prestataire' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await prestataireService.update(id, req.body)
      if (!result) return res.status(404).json({ error: 'Prestataire non trouvé' })
      res.json({ data: result, message: 'Prestataire mis à jour avec succès' })
    } catch (error) {
      logger.error(`[PrestataireController] Error updating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour le prestataire' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await prestataireService.delete(id)
      if (!deleted) return res.status(404).json({ error: 'Prestataire non trouvé' })
      res.json({ message: 'Prestataire supprimé avec succès' })
    } catch (error) {
      logger.error(`[PrestataireController] Error deleting: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer le prestataire' })
    }
  }
}
