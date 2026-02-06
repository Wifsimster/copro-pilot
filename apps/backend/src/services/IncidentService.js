import { IncidentModel } from '../models/Incident.js'
import logger from '../logger.js'

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
