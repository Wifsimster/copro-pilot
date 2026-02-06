import { locataireService } from '../services/LocataireService.js'
import logger from '../logger.js'

export class LocataireController {
    static async getAllByLot(req, res) {
        try {
            const { lotId } = req.params
            const locataires = await locataireService.getAllByLot(lotId)
            res.json({ data: locataires })
        } catch (error) {
            logger.error(`[LocataireController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les locataires' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const locataire = await locataireService.getById(id)
            if (!locataire) return res.status(404).json({ error: 'Locataire non trouvé' })
            res.json({ data: locataire })
        } catch (error) {
            logger.error(`[LocataireController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le locataire' })
        }
    }

    static async create(req, res) {
        try {
            const { lot_id, nom, prenom } = req.body
            if (!lot_id || !nom || !prenom) {
                return res.status(400).json({ error: 'Les champs lot_id, nom et prenom sont obligatoires' })
            }
            const result = await locataireService.create(req.body)
            res.status(201).json({ data: result, message: 'Locataire créé avec succès' })
        } catch (error) {
            logger.error(`[LocataireController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le locataire' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await locataireService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Locataire non trouvé' })
            res.json({ data: result, message: 'Locataire mis à jour avec succès' })
        } catch (error) {
            logger.error(`[LocataireController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le locataire' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await locataireService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Locataire non trouvé' })
            res.json({ message: 'Locataire supprimé avec succès' })
        } catch (error) {
            logger.error(`[LocataireController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le locataire' })
        }
    }
}
