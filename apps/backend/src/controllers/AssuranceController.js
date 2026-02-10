import { assuranceService } from '../services/AssuranceService.js'
import logger from '../logger.js'

export class AssuranceController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const assurances = await assuranceService.getAllByCopropriete(coproprieteId)
            res.json({ data: assurances })
        } catch (error) {
            logger.error(`[AssuranceController] Error getting assurances: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les assurances' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const assurance = await assuranceService.getById(id)
            if (!assurance) {
                return res.status(404).json({ error: 'Assurance non trouvée' })
            }
            res.json({ data: assurance })
        } catch (error) {
            logger.error(`[AssuranceController] Error getting assurance ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'assurance' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, compagnie, date_debut } = req.body
            if (!copropriete_id || !compagnie || !date_debut) {
                return res.status(400).json({ error: 'Les champs copropriete_id, compagnie et date_debut sont obligatoires' })
            }
            const assurance = await assuranceService.create(req.body)
            res.status(201).json({ data: assurance, message: 'Assurance créée avec succès' })
        } catch (error) {
            logger.error(`[AssuranceController] Error creating assurance: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'assurance' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const assurance = await assuranceService.update(id, req.body)
            if (!assurance) {
                return res.status(404).json({ error: 'Assurance non trouvée' })
            }
            res.json({ data: assurance, message: 'Assurance mise à jour avec succès' })
        } catch (error) {
            logger.error(`[AssuranceController] Error updating assurance ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'assurance' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await assuranceService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Assurance non trouvée' })
            }
            res.json({ message: 'Assurance supprimée avec succès' })
        } catch (error) {
            logger.error(`[AssuranceController] Error deleting assurance ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'assurance' })
        }
    }
}
