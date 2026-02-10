import { contratService } from '../services/ContratService.js'
import logger from '../logger.js'

export class ContratController {
  static async getAllByCopropriete(req, res) {
    try {
      const { coproprieteId } = req.params
      const contrats = await contratService.getAllByCopropriete(coproprieteId)
      res.json({ data: contrats })
    } catch (error) {
      logger.error(`[ContratController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les contrats' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const contrat = await contratService.getById(id)
      if (!contrat) return res.status(404).json({ error: 'Contrat non trouvé' })
      res.json({ data: contrat })
    } catch (error) {
      logger.error(`[ContratController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le contrat' })
    }
  }

  static async getByPrestataire(req, res) {
    try {
      const { prestataireId } = req.params
      const contrats = await contratService.getByPrestataire(prestataireId)
      res.json({ data: contrats })
    } catch (error) {
      logger.error(`[ContratController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les contrats du prestataire' })
    }
  }

  static async getExpiringSoon(req, res) {
    try {
      const { coproprieteId } = req.params
      const daysAhead = req.query.days ? parseInt(req.query.days) : 90
      const contrats = await contratService.getExpiringSoon(coproprieteId, daysAhead)
      res.json({ data: contrats })
    } catch (error) {
      logger.error(`[ContratController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les contrats arrivant à échéance' })
    }
  }

  static async create(req, res) {
    try {
      const { copropriete_id, prestataire_id, objet, date_debut } = req.body
      if (!copropriete_id || !prestataire_id || !objet || !date_debut) {
        return res.status(400).json({ error: 'Les champs copropriete_id, prestataire_id, objet et date_debut sont obligatoires' })
      }
      const result = await contratService.create(req.body)
      res.status(201).json({ data: result, message: 'Contrat créé avec succès' })
    } catch (error) {
      logger.error(`[ContratController] Error creating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer le contrat' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await contratService.update(id, req.body)
      if (!result) return res.status(404).json({ error: 'Contrat non trouvé' })
      res.json({ data: result, message: 'Contrat mis à jour avec succès' })
    } catch (error) {
      logger.error(`[ContratController] Error updating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour le contrat' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await contratService.delete(id)
      if (!deleted) return res.status(404).json({ error: 'Contrat non trouvé' })
      res.json({ message: 'Contrat supprimé avec succès' })
    } catch (error) {
      logger.error(`[ContratController] Error deleting: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer le contrat' })
    }
  }
}
