import { RelanceModel } from '../models/Relance.js'
import logger from '../logger.js'

class RelanceService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await RelanceModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[RelanceService] Error getting relances for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await RelanceModel.getById(id)
        } catch (error) {
            logger.error(`[RelanceService] Error getting relance ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await RelanceModel.create(data)
            logger.info(`[RelanceService] Relance créée (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[RelanceService] Error creating relance: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await RelanceModel.getById(id)
            if (!existing) return null

            const result = await RelanceModel.update(id, data)
            logger.info(`[RelanceService] Relance mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[RelanceService] Error updating relance ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await RelanceModel.getById(id)
            if (!existing) return false

            await RelanceModel.delete(id)
            logger.info(`[RelanceService] Relance supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[RelanceService] Error deleting relance ${id}: ${error.message}`)
            throw error
        }
    }
}

export const relanceService = new RelanceService()
