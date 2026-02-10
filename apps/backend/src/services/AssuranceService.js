import { AssuranceModel } from '../models/Assurance.js'
import logger from '../logger.js'

class AssuranceService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await AssuranceModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[AssuranceService] Error getting assurances for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await AssuranceModel.getById(id)
        } catch (error) {
            logger.error(`[AssuranceService] Error getting assurance ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await AssuranceModel.create(data)
            logger.info(`[AssuranceService] Assurance créée: ${result.compagnie} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AssuranceService] Error creating assurance: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await AssuranceModel.getById(id)
            if (!existing) return null

            const result = await AssuranceModel.update(id, data)
            logger.info(`[AssuranceService] Assurance mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AssuranceService] Error updating assurance ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await AssuranceModel.getById(id)
            if (!existing) return false

            await AssuranceModel.delete(id)
            logger.info(`[AssuranceService] Assurance supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AssuranceService] Error deleting assurance ${id}: ${error.message}`)
            throw error
        }
    }
}

export const assuranceService = new AssuranceService()
