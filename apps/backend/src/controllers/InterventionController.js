import { interventionService } from '../services/InterventionService.js'
import { workflowEventService } from '../services/WorkflowEventService.js'
import logger from '../logger.js'

export class InterventionController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const interventions = await interventionService.getAllByCopropriete(coproprieteId)
            res.json({ data: interventions })
        } catch (error) {
            logger.error(`[InterventionController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les interventions' })
        }
    }

    static async getAllByIncident(req, res) {
        try {
            const { incidentId } = req.params
            const interventions = await interventionService.getAllByIncident(incidentId)
            res.json({ data: interventions })
        } catch (error) {
            logger.error(`[InterventionController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les interventions' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const intervention = await interventionService.getById(id)
            if (!intervention) return res.status(404).json({ error: 'Intervention non trouvée' })
            res.json({ data: intervention })
        } catch (error) {
            logger.error(`[InterventionController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'intervention' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id } = req.body
            if (!copropriete_id) {
                return res.status(400).json({ error: 'Le champ copropriete_id est obligatoire' })
            }
            const result = await interventionService.create(req.body)
            res.status(201).json({ data: result, message: 'Intervention créée avec succès' })
        } catch (error) {
            logger.error(`[InterventionController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'intervention' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await interventionService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Intervention non trouvée' })
            res.json({ data: result, message: 'Intervention mise à jour avec succès' })
            if (result.statut === 'terminee') {
                workflowEventService.onInterventionTerminee(result).catch(() => {})
            }
        } catch (error) {
            logger.error(`[InterventionController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'intervention' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await interventionService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Intervention non trouvée' })
            res.json({ message: 'Intervention supprimée avec succès' })
        } catch (error) {
            logger.error(`[InterventionController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'intervention' })
        }
    }
}
