import { InterventionModel } from '../models/Intervention.js'
import logger from '../logger.js'

class InterventionService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await InterventionModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[InterventionService] Error getting interventions: ${error.message}`)
            throw error
        }
    }

    async getAllByIncident(incidentId) {
        try {
            return await InterventionModel.getAllByIncident(incidentId)
        } catch (error) {
            logger.error(`[InterventionService] Error getting interventions by incident: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await InterventionModel.getById(id)
        } catch (error) {
            logger.error(`[InterventionService] Error getting intervention ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await InterventionModel.create(data)
            logger.info(`[InterventionService] Intervention créée (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[InterventionService] Error creating intervention: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await InterventionModel.getById(id)
            if (!existing) return null
            const result = await InterventionModel.update(id, data)
            logger.info(`[InterventionService] Intervention mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[InterventionService] Error updating intervention ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await InterventionModel.getById(id)
            if (!existing) return false
            await InterventionModel.delete(id)
            logger.info(`[InterventionService] Intervention supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[InterventionService] Error deleting intervention ${id}: ${error.message}`)
            throw error
        }
    }
}

export const interventionService = new InterventionService()
