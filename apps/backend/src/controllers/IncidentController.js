import { incidentService } from '../services/IncidentService.js'
import { IncidentModel } from '../models/Incident.js'
import { parsePaginationParams, paginatedResponse } from '../utils/pagination.js'
import logger from '../logger.js'

export class IncidentController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const { page, limit, sortBy, sortOrder } = req.query
            if (page || limit || sortBy || sortOrder) {
                const params = parsePaginationParams(req.query)
                const { data, total } = await IncidentModel.getAllByCoproprietePaginated(coproprieteId, params)
                return res.json(paginatedResponse(data, total, params))
            }
            const incidents = await incidentService.getAllByCopropriete(coproprieteId)
            res.json({ data: incidents })
        } catch (error) {
            logger.error(`[IncidentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les incidents' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const incident = await incidentService.getById(id)
            if (!incident) return res.status(404).json({ error: 'Incident non trouvé' })
            res.json({ data: incident })
        } catch (error) {
            logger.error(`[IncidentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'incident' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, titre, date_signalement } = req.body
            if (!copropriete_id || !titre || !date_signalement) {
                return res.status(400).json({ error: 'Les champs copropriete_id, titre et date_signalement sont obligatoires' })
            }
            const result = await incidentService.create(req.body)
            res.status(201).json({ data: result, message: 'Incident créé avec succès' })
        } catch (error) {
            logger.error(`[IncidentController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'incident' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await incidentService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Incident non trouvé' })
            res.json({ data: result, message: 'Incident mis à jour avec succès' })
        } catch (error) {
            if (error.code === 'INVALID_STATUS_TRANSITION') {
                return res.status(400).json({ error: error.message })
            }
            logger.error(`[IncidentController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'incident' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await incidentService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Incident non trouvé' })
            res.json({ message: 'Incident supprimé avec succès' })
        } catch (error) {
            logger.error(`[IncidentController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'incident' })
        }
    }
}
