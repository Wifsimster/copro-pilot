import { tacheService } from '../services/TacheService.js'
import logger from '../logger.js'

export class TacheController {
  static async getAllByUser(req, res) {
    try {
      const userId = req.user.id
      const { statut, priorite, copropriete_id } = req.query
      const filters = {}
      if (statut) filters.statut = statut
      if (priorite) filters.priorite = priorite
      if (copropriete_id) filters.copropriete_id = copropriete_id
      const taches = await tacheService.getAllByUser(userId, filters)
      res.json({ data: taches })
    } catch (error) {
      logger.error(`[TacheController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer les taches' })
    }
  }

  static async getAllByCopropriete(req, res) {
    try {
      const { coproprieteId } = req.params
      const taches = await tacheService.getAllByCopropriete(coproprieteId)
      res.json({ data: taches })
    } catch (error) {
      logger.error(`[TacheController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer les taches' })
    }
  }

  static async getOverdue(req, res) {
    try {
      const taches = await tacheService.getOverdue()
      res.json({ data: taches })
    } catch (error) {
      logger.error(`[TacheController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer les taches en retard' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const tache = await tacheService.getById(id)
      if (!tache) return res.status(404).json({ error: 'Tache non trouvee' })
      res.json({ data: tache })
    } catch (error) {
      logger.error(`[TacheController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer la tache' })
    }
  }

  static async create(req, res) {
    try {
      const { titre } = req.body
      if (!titre) {
        return res.status(400).json({ error: 'Le champ titre est obligatoire' })
      }
      const data = {
        ...req.body,
        user_id: req.body.user_id || req.user.id,
      }
      const result = await tacheService.create(data)
      res.status(201).json({ data: result, message: 'Tache creee avec succes' })
    } catch (error) {
      logger.error(`[TacheController] Error creating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de creer la tache' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await tacheService.update(id, req.body)
      if (!result) return res.status(404).json({ error: 'Tache non trouvee' })
      res.json({ data: result, message: 'Tache mise a jour avec succes' })
    } catch (error) {
      logger.error(`[TacheController] Error updating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre a jour la tache' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await tacheService.delete(id)
      if (!deleted) return res.status(404).json({ error: 'Tache non trouvee' })
      res.json({ message: 'Tache supprimee avec succes' })
    } catch (error) {
      logger.error(`[TacheController] Error deleting: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer la tache' })
    }
  }
}
