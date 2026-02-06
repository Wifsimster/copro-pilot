import { MutationModel } from '../models/Mutation.js'
import logger from '../logger.js'

class MutationService {
    async getAllByLot(lotId) {
        try {
            return await MutationModel.getAllByLot(lotId)
        } catch (error) {
            logger.error(`[MutationService] Error getting mutations for lot ${lotId}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await MutationModel.create(data)
            logger.info(`[MutationService] Mutation créée: lot ${data.lot_id}, type ${data.type} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[MutationService] Error creating mutation: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            await MutationModel.delete(id)
            logger.info(`[MutationService] Mutation supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[MutationService] Error deleting mutation ${id}: ${error.message}`)
            throw error
        }
    }
}

export const mutationService = new MutationService()
