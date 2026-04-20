import { compteBancaireService } from '../services/CompteBancaireService.js'
import logger from '../logger.js'

export class CompteBancaireController {
  static async getAllByCopropriete(req, res) {
    try {
      const { coproprieteId } = req.params
      const comptes = await compteBancaireService.getAllByCopropriete(coproprieteId)
      res.json({ data: comptes })
    } catch (error) {
      logger.error(`[CompteBancaireController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer les comptes bancaires' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const compte = await compteBancaireService.getById(id)
      if (!compte) return res.status(404).json({ error: 'Compte bancaire non trouve' })
      res.json({ data: compte })
    } catch (error) {
      logger.error(`[CompteBancaireController] Error: ${error.message}`)
      res.status(500).json({ error: 'Impossible de recuperer le compte bancaire' })
    }
  }

  static async create(req, res) {
    try {
      const { copropriete_id, banque, iban } = req.body
      if (!copropriete_id || !banque || !iban) {
        return res.status(400).json({ error: 'Les champs copropriete_id, banque et iban sont obligatoires' })
      }
      const result = await compteBancaireService.create(req.body)
      res.status(201).json({ data: result, message: 'Compte bancaire créé avec succès' })
    } catch (error) {
      logger.error(`[CompteBancaireController] Error creating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer le compte bancaire' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await compteBancaireService.update(id, req.body)
      res.json({ data: result, message: 'Compte bancaire mis à jour avec succès' })
    } catch (error) {
      logger.error(`[CompteBancaireController] Error updating: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour le compte bancaire' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const deleted = await compteBancaireService.delete(id)
      if (!deleted) return res.status(404).json({ error: 'Compte bancaire non trouvé' })
      res.json({ message: 'Compte bancaire supprimé avec succès' })
    } catch (error) {
      logger.error(`[CompteBancaireController] Error deleting: ${error.message}`)
      res.status(500).json({ error: 'Impossible de supprimer le compte bancaire' })
    }
  }

  static async getSoldeTotal(req, res) {
    try {
      const { coproprieteId } = req.params
      const solde = await compteBancaireService.getSoldeTotal(coproprieteId)
      res.json({ data: { solde_total: solde } })
    } catch (error) {
      logger.error(`[CompteBancaireController] Error getting solde: ${error.message}`)
      res.status(500).json({ error: 'Impossible de calculer le solde total' })
    }
  }
}
