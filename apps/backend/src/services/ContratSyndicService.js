import { ContratSyndicModel } from '../models/ContratSyndic.js'
import logger from '../logger.js'

class ContratSyndicService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await ContratSyndicModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[ContratSyndicService] Error getting contrats syndic for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await ContratSyndicModel.getById(id)
        } catch (error) {
            logger.error(`[ContratSyndicService] Error getting contrat syndic ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await ContratSyndicModel.create(data)
            logger.info(`[ContratSyndicService] Contrat syndic créé: ${result.syndic_nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[ContratSyndicService] Error creating contrat syndic: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await ContratSyndicModel.getById(id)
            if (!existing) return null

            const result = await ContratSyndicModel.update(id, data)
            logger.info(`[ContratSyndicService] Contrat syndic mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[ContratSyndicService] Error updating contrat syndic ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await ContratSyndicModel.getById(id)
            if (!existing) return false

            await ContratSyndicModel.delete(id)
            logger.info(`[ContratSyndicService] Contrat syndic supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[ContratSyndicService] Error deleting contrat syndic ${id}: ${error.message}`)
            throw error
        }
    }
}

export const contratSyndicService = new ContratSyndicService()
