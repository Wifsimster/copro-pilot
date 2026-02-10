import { ConseilSyndicalModel } from '../models/ConseilSyndical.js'
import logger from '../logger.js'

class ConseilSyndicalService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await ConseilSyndicalModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[ConseilSyndicalService] Error getting conseil syndical for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await ConseilSyndicalModel.getById(id)
        } catch (error) {
            logger.error(`[ConseilSyndicalService] Error getting membre ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await ConseilSyndicalModel.create(data)
            logger.info(`[ConseilSyndicalService] Membre conseil syndical créé: ${result.role} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[ConseilSyndicalService] Error creating membre: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await ConseilSyndicalModel.getById(id)
            if (!existing) return null

            const result = await ConseilSyndicalModel.update(id, data)
            logger.info(`[ConseilSyndicalService] Membre conseil syndical mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[ConseilSyndicalService] Error updating membre ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await ConseilSyndicalModel.getById(id)
            if (!existing) return false

            await ConseilSyndicalModel.delete(id)
            logger.info(`[ConseilSyndicalService] Membre conseil syndical supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[ConseilSyndicalService] Error deleting membre ${id}: ${error.message}`)
            throw error
        }
    }
}

export const conseilSyndicalService = new ConseilSyndicalService()
