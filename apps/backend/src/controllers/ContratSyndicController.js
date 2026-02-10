import { contratSyndicService } from '../services/ContratSyndicService.js'
import logger from '../logger.js'

export class ContratSyndicController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const contrats = await contratSyndicService.getAllByCopropriete(coproprieteId)
            res.json({ data: contrats })
        } catch (error) {
            logger.error(`[ContratSyndicController] Error getting contrats syndic: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les contrats syndic' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const contrat = await contratSyndicService.getById(id)
            if (!contrat) {
                return res.status(404).json({ error: 'Contrat syndic non trouvé' })
            }
            res.json({ data: contrat })
        } catch (error) {
            logger.error(`[ContratSyndicController] Error getting contrat syndic ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le contrat syndic' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, syndic_nom, date_debut, date_fin } = req.body
            if (!copropriete_id || !syndic_nom || !date_debut || !date_fin) {
                return res.status(400).json({ error: 'Les champs copropriete_id, syndic_nom, date_debut et date_fin sont obligatoires' })
            }
            const contrat = await contratSyndicService.create(req.body)
            res.status(201).json({ data: contrat, message: 'Contrat syndic créé avec succès' })
        } catch (error) {
            logger.error(`[ContratSyndicController] Error creating contrat syndic: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le contrat syndic' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const contrat = await contratSyndicService.update(id, req.body)
            if (!contrat) {
                return res.status(404).json({ error: 'Contrat syndic non trouvé' })
            }
            res.json({ data: contrat, message: 'Contrat syndic mis à jour avec succès' })
        } catch (error) {
            logger.error(`[ContratSyndicController] Error updating contrat syndic ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le contrat syndic' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await contratSyndicService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Contrat syndic non trouvé' })
            }
            res.json({ message: 'Contrat syndic supprimé avec succès' })
        } catch (error) {
            logger.error(`[ContratSyndicController] Error deleting contrat syndic ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le contrat syndic' })
        }
    }
}
