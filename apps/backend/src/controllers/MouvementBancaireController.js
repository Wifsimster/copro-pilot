import { mouvementBancaireService } from '../services/MouvementBancaireService.js'
import logger from '../logger.js'

export class MouvementBancaireController {
  static async getAllByCompte(req, res) {
    try {
      const { compteId } = req.params
      const mouvements = await mouvementBancaireService.getAllByCompte(compteId)
      res.json({ data: mouvements })
    } catch (error) {
      logger.error(`[MouvementBancaireController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer les mouvements bancaires' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const mouvement = await mouvementBancaireService.getById(id)
      if (!mouvement) return res.status(404).json({ error: 'Mouvement bancaire non trouve' })
      res.json({ data: mouvement })
    } catch (error) {
      logger.error(`[MouvementBancaireController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer le mouvement bancaire' })
    }
  }

  static async create(req, res) {
    try {
      const { compte_id, date, libelle, montant, type } = req.body
      if (!compte_id || !date || !libelle || !montant || !type) {
        return res.status(400).json({ error: 'Les champs compte_id, date, libelle, montant et type sont obligatoires' })
      }
      const result = await mouvementBancaireService.create(req.body)
      res.status(201).json({ data: result, message: 'Mouvement bancaire enregistré avec succès' })
    } catch (error) {
      logger.error(`[MouvementBancaireController] Error creating: ${error.message}`)
      res.status(500).json({ error: 'Impossible d\'enregistrer le mouvement bancaire' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await mouvementBancaireService.update(id, req.body)
      res.json({ data: result, message: 'Mouvement bancaire mis à jour avec succès' })
    } catch (error) {
      logger.error(`[MouvementBancaireController] Error updating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour le mouvement bancaire' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await mouvementBancaireService.delete(id)
      if (!deleted) return res.status(404).json({ error: 'Mouvement bancaire non trouvé' })
      res.json({ message: 'Mouvement bancaire supprimé avec succès' })
    } catch (error) {
      logger.error(`[MouvementBancaireController] Error deleting: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer le mouvement bancaire' })
    }
  }

  static async getSoldeCompte(req, res) {
    try {
      const { compteId } = req.params
      const solde = await mouvementBancaireService.getSoldeCompte(compteId)
      res.json({ data: solde })
    } catch (error) {
      logger.error(`[MouvementBancaireController] Error getting solde: ${error.message}`)
      res.status(500).json({ error: 'Impossible de calculer le solde' })
    }
  }
}
