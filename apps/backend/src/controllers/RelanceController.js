import { relanceService } from '../services/RelanceService.js'
import logger from '../logger.js'

export class RelanceController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const relances = await relanceService.getAllByCopropriete(coproprieteId)
            res.json({ data: relances })
        } catch (error) {
            logger.error(`[RelanceController] Error getting relances: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les relances' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const relance = await relanceService.getById(id)
            if (!relance) {
                return res.status(404).json({ error: 'Relance non trouvée' })
            }
            res.json({ data: relance })
        } catch (error) {
            logger.error(`[RelanceController] Error getting relance ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la relance' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, coproprietaire_id, date_relance, montant_du } = req.body
            if (!copropriete_id || !coproprietaire_id || !date_relance || !montant_du) {
                return res.status(400).json({ error: 'Les champs copropriete_id, coproprietaire_id, date_relance et montant_du sont obligatoires' })
            }
            const relance = await relanceService.create(req.body)
            res.status(201).json({ data: relance, message: 'Relance créée avec succès' })
        } catch (error) {
            logger.error(`[RelanceController] Error creating relance: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la relance' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const relance = await relanceService.update(id, req.body)
            if (!relance) {
                return res.status(404).json({ error: 'Relance non trouvée' })
            }
            res.json({ data: relance, message: 'Relance mise à jour avec succès' })
        } catch (error) {
            logger.error(`[RelanceController] Error updating relance ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la relance' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await relanceService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Relance non trouvée' })
            }
            res.json({ message: 'Relance supprimée avec succès' })
        } catch (error) {
            logger.error(`[RelanceController] Error deleting relance ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la relance' })
        }
    }
}
