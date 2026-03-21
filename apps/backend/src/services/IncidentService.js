import { IncidentModel } from '../models/Incident.js'
import { workflowEventService } from './WorkflowEventService.js'
import logger from '../logger.js'

const INCIDENT_TRANSITIONS = {
    ouvert: ['en_cours', 'ferme'],
    en_cours: ['resolu', 'ferme'],
    resolu: ['ferme', 'ouvert'],
    ferme: ['ouvert'],
}

class IncidentService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await IncidentModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[IncidentService] Error getting incidents: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await IncidentModel.getById(id)
        } catch (error) {
            logger.error(`[IncidentService] Error getting incident ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await IncidentModel.create(data)
            logger.info(`[IncidentService] Incident créé: ${result.titre} (ID: ${result.id})`)
            workflowEventService.onIncidentCreated(result).catch(err =>
                logger.error(`[IncidentService] Workflow event error: ${err.message}`)
            )
            return result
        } catch (error) {
            logger.error(`[IncidentService] Error creating incident: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await IncidentModel.getById(id)
            if (!existing) return null

            // Validate status transition
            if (data.statut && data.statut !== existing.statut) {
                const allowed = INCIDENT_TRANSITIONS[existing.statut]
                if (!allowed || !allowed.includes(data.statut)) {
                    const error = new Error(
                        `Transition de statut invalide : "${existing.statut}" vers "${data.statut}". ` +
                        `Transitions autorisées : ${(allowed || []).join(', ') || 'aucune'}`
                    )
                    error.code = 'INVALID_STATUS_TRANSITION'
                    throw error
                }
            }

            const result = await IncidentModel.update(id, data)
            logger.info(`[IncidentService] Incident mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[IncidentService] Error updating incident ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await IncidentModel.getById(id)
            if (!existing) return false
            await IncidentModel.delete(id)
            logger.info(`[IncidentService] Incident supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[IncidentService] Error deleting incident ${id}: ${error.message}`)
            throw error
        }
    }
}

export const incidentService = new IncidentService()
