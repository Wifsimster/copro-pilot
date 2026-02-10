import { sinistreService } from '../services/SinistreService.js'
import logger from '../logger.js'

export class SinistreController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const sinistres = await sinistreService.getAllByCopropriete(coproprieteId)
            res.json({ data: sinistres })
        } catch (error) {
            logger.error(`[SinistreController] Error getting sinistres: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les sinistres' })
        }
    }

    static async getAllByAssurance(req, res) {
        try {
            const { assuranceId } = req.params
            const sinistres = await sinistreService.getAllByAssurance(assuranceId)
            res.json({ data: sinistres })
        } catch (error) {
            logger.error(`[SinistreController] Error getting sinistres for assurance: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les sinistres' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const sinistre = await sinistreService.getById(id)
            if (!sinistre) {
                return res.status(404).json({ error: 'Sinistre non trouvé' })
            }
            res.json({ data: sinistre })
        } catch (error) {
            logger.error(`[SinistreController] Error getting sinistre ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le sinistre' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, date_sinistre } = req.body
            if (!copropriete_id || !date_sinistre) {
                return res.status(400).json({ error: 'Les champs copropriete_id et date_sinistre sont obligatoires' })
            }
            const sinistre = await sinistreService.create(req.body)
            res.status(201).json({ data: sinistre, message: 'Sinistre créé avec succès' })
        } catch (error) {
            logger.error(`[SinistreController] Error creating sinistre: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le sinistre' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const sinistre = await sinistreService.update(id, req.body)
            if (!sinistre) {
                return res.status(404).json({ error: 'Sinistre non trouvé' })
            }
            res.json({ data: sinistre, message: 'Sinistre mis à jour avec succès' })
        } catch (error) {
            logger.error(`[SinistreController] Error updating sinistre ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le sinistre' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await sinistreService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Sinistre non trouvé' })
            }
            res.json({ message: 'Sinistre supprimé avec succès' })
        } catch (error) {
            logger.error(`[SinistreController] Error deleting sinistre ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le sinistre' })
        }
    }
}
