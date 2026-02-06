import { LotModel } from '../models/Lot.js'
import logger from '../logger.js'

class LotService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await LotModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[LotService] Error getting lots for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await LotModel.getById(id)
        } catch (error) {
            logger.error(`[LotService] Error getting lot ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await LotModel.create(data)
            logger.info(`[LotService] Lot créé: ${result.numero} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[LotService] Error creating lot: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await LotModel.getById(id)
            if (!existing) return null

            const result = await LotModel.update(id, data)
            logger.info(`[LotService] Lot mis à jour: ${result.numero} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[LotService] Error updating lot ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await LotModel.getById(id)
            if (!existing) return false

            await LotModel.delete(id)
            logger.info(`[LotService] Lot supprimé: ${existing.numero} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[LotService] Error deleting lot ${id}: ${error.message}`)
            throw error
        }
    }

    async getClesRepartition(lotId) {
        try {
            return await LotModel.getClesRepartition(lotId)
        } catch (error) {
            logger.error(`[LotService] Error getting clés de répartition for lot ${lotId}: ${error.message}`)
            throw error
        }
    }
}

export const lotService = new LotService()
