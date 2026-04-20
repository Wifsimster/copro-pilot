import { ticketService } from '../services/TicketService.js'
import logger from '../logger.js'

export class TicketController {
  static async getAll(req, res) {
    try {
      const { copropriete_id, user_id } = req.query
      if (copropriete_id) {
        const tickets = await ticketService.getAllByCopropriete(copropriete_id)
        return res.json({ data: tickets })
      }
      if (user_id) {
        const tickets = await ticketService.getAllByUser(user_id)
        return res.json({ data: tickets })
      }
      return res.status(400).json({ error: 'Le parametre copropriete_id ou user_id est requis' })
    } catch (error) {
      logger.error(`[TicketController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer les tickets' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const ticket = await ticketService.getById(id)
      if (!ticket) return res.status(404).json({ error: 'Ticket non trouve' })
      res.json({ data: ticket })
    } catch (error) {
      logger.error(`[TicketController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer le ticket' })
    }
  }

  static async create(req, res) {
    try {
      const { copropriete_id, sujet } = req.body
      if (!copropriete_id || !sujet) {
        return res.status(400).json({ error: 'Les champs copropriete_id et sujet sont obligatoires' })
      }
      // Set auteur_id from authenticated user
      const data = {
        ...req.body,
        auteur_id: req.body.auteur_id || req.user?.id,
      }
      const result = await ticketService.create(data)
      res.status(201).json({ data: result, message: 'Ticket créé avec succès' })
    } catch (error) {
      logger.error(`[TicketController] Error creating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer le ticket' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await ticketService.update(id, req.body)
      if (!result) return res.status(404).json({ error: 'Ticket non trouvé' })
      res.json({ data: result, message: 'Ticket mis à jour avec succès' })
    } catch (error) {
      logger.error(`[TicketController] Error updating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour le ticket' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await ticketService.delete(id)
      if (!deleted) return res.status(404).json({ error: 'Ticket non trouvé' })
      res.json({ message: 'Ticket supprimé avec succès' })
    } catch (error) {
      logger.error(`[TicketController] Error deleting: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer le ticket' })
    }
  }

  static async addMessage(req, res) {
    try {
      const { id } = req.params
      const { contenu } = req.body
      if (!contenu) {
        return res.status(400).json({ error: 'Le champ contenu est obligatoire' })
      }
      const data = {
        contenu,
        auteur_id: req.body.auteur_id || req.user?.id,
      }
      const result = await ticketService.addMessage(id, data)
      if (!result) return res.status(404).json({ error: 'Ticket non trouvé' })
      res.status(201).json({ data: result, message: 'Message ajouté avec succès' })
    } catch (error) {
      logger.error(`[TicketController] Error adding message: ${error.message}`)
      res.status(500).json({ error: 'Impossible d\'ajouter le message' })
    }
  }
}
