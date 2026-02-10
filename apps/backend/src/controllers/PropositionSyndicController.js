import { propositionSyndicService } from '../services/PropositionSyndicService.js'
import logger from '../logger.js'

export class PropositionSyndicController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const propositions = await propositionSyndicService.getAllByCopropriete(coproprieteId)
            res.json({ data: propositions })
        } catch (error) {
            logger.error(`[PropositionSyndicController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les propositions de syndic' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const proposition = await propositionSyndicService.getById(id)
            if (!proposition) return res.status(404).json({ error: 'Proposition de syndic non trouvée' })
            res.json({ data: proposition })
        } catch (error) {
            logger.error(`[PropositionSyndicController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la proposition de syndic' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, syndic_nom, date_reception } = req.body
            if (!copropriete_id || !syndic_nom || !date_reception) {
                return res.status(400).json({ error: 'Les champs copropriete_id, syndic_nom et date_reception sont obligatoires' })
            }
            const result = await propositionSyndicService.create(req.body)
            res.status(201).json({ data: result, message: 'Proposition de syndic créée avec succès' })
        } catch (error) {
            logger.error(`[PropositionSyndicController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la proposition de syndic' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await propositionSyndicService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Proposition de syndic non trouvée' })
            res.json({ data: result, message: 'Proposition de syndic mise à jour avec succès' })
        } catch (error) {
            logger.error(`[PropositionSyndicController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la proposition de syndic' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await propositionSyndicService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Proposition de syndic non trouvée' })
            res.json({ message: 'Proposition de syndic supprimée avec succès' })
        } catch (error) {
            logger.error(`[PropositionSyndicController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la proposition de syndic' })
        }
    }
}
