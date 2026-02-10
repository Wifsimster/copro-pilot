import { PropositionSyndicModel } from '../models/PropositionSyndic.js'
import logger from '../logger.js'

class PropositionSyndicService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await PropositionSyndicModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[PropositionSyndicService] Error getting propositions: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await PropositionSyndicModel.getById(id)
        } catch (error) {
            logger.error(`[PropositionSyndicService] Error getting proposition ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await PropositionSyndicModel.create(data)
            logger.info(`[PropositionSyndicService] Proposition créée: ${result.syndic_nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[PropositionSyndicService] Error creating proposition: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await PropositionSyndicModel.getById(id)
            if (!existing) return null
            const result = await PropositionSyndicModel.update(id, data)
            logger.info(`[PropositionSyndicService] Proposition mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[PropositionSyndicService] Error updating proposition ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await PropositionSyndicModel.getById(id)
            if (!existing) return false
            await PropositionSyndicModel.delete(id)
            logger.info(`[PropositionSyndicService] Proposition supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[PropositionSyndicService] Error deleting proposition ${id}: ${error.message}`)
            throw error
        }
    }
}

export const propositionSyndicService = new PropositionSyndicService()
