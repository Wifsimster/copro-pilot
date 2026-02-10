import { procedureService } from '../services/ProcedureService.js'
import logger from '../logger.js'

export class ProcedureController {
  static async getAllByCopropriete(req, res) {
    try {
      const { coproprieteId } = req.params
      const procedures = await procedureService.getAllByCopropriete(coproprieteId)
      res.json({ data: procedures })
    } catch (error) {
      logger.error(`[ProcedureController] Error getting procedures: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les procédures' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const procedure = await procedureService.getById(id)
      if (!procedure) {
        return res.status(404).json({ error: 'Procédure non trouvée' })
      }
      res.json({ data: procedure })
    } catch (error) {
      logger.error(`[ProcedureController] Error getting procedure ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer la procédure' })
    }
  }

  static async create(req, res) {
    try {
      const { copropriete_id, coproprietaire_id } = req.body
      if (!copropriete_id || !coproprietaire_id) {
        return res.status(400).json({ error: 'Les champs copropriete_id et coproprietaire_id sont obligatoires' })
      }
      const procedure = await procedureService.create(req.body)
      res.status(201).json({ data: procedure, message: 'Procédure créée avec succès' })
    } catch (error) {
      logger.error(`[ProcedureController] Error creating procedure: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer la procédure' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const procedure = await procedureService.update(id, req.body)
      if (!procedure) {
        return res.status(404).json({ error: 'Procédure non trouvée' })
      }
      res.json({ data: procedure, message: 'Procédure mise à jour avec succès' })
    } catch (error) {
      logger.error(`[ProcedureController] Error updating procedure ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour la procédure' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await procedureService.delete(id)
      if (!deleted) {
        return res.status(404).json({ error: 'Procédure non trouvée' })
      }
      res.json({ message: 'Procédure supprimée avec succès' })
    } catch (error) {
      logger.error(`[ProcedureController] Error deleting procedure ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer la procédure' })
    }
  }
}
