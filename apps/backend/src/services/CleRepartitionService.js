import { CleRepartitionModel } from '../models/CleRepartition.js'
import logger from '../logger.js'

class CleRepartitionService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await CleRepartitionModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[CleRepartitionService] Error getting clés de répartition: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const cle = await CleRepartitionModel.getById(id)
            if (!cle) return null
            const quoteParts = await CleRepartitionModel.getLotQuoteParts(id)
            return { ...cle, quote_parts: quoteParts }
        } catch (error) {
            logger.error(`[CleRepartitionService] Error getting clé ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await CleRepartitionModel.create(data)
            logger.info(`[CleRepartitionService] Clé créée: ${result.nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[CleRepartitionService] Error creating clé: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await CleRepartitionModel.getById(id)
            if (!existing) return null
            const result = await CleRepartitionModel.update(id, data)
            logger.info(`[CleRepartitionService] Clé mise à jour: ${result.nom} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[CleRepartitionService] Error updating clé ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await CleRepartitionModel.getById(id)
            if (!existing) return false
            await CleRepartitionModel.delete(id)
            logger.info(`[CleRepartitionService] Clé supprimée: ${existing.nom} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[CleRepartitionService] Error deleting clé ${id}: ${error.message}`)
            throw error
        }
    }

    async setLotQuotePart(lotId, cleRepartitionId, quotePart) {
        try {
            const result = await CleRepartitionModel.setLotQuotePart(lotId, cleRepartitionId, quotePart)
            logger.info(`[CleRepartitionService] Quote-part définie: lot ${lotId}, clé ${cleRepartitionId} = ${quotePart}`)
            return result
        } catch (error) {
            logger.error(`[CleRepartitionService] Error setting quote-part: ${error.message}`)
            throw error
        }
    }

    async removeLotQuotePart(lotId, cleRepartitionId) {
        try {
            await CleRepartitionModel.removeLotQuotePart(lotId, cleRepartitionId)
            logger.info(`[CleRepartitionService] Quote-part supprimée: lot ${lotId}, clé ${cleRepartitionId}`)
            return true
        } catch (error) {
            logger.error(`[CleRepartitionService] Error removing quote-part: ${error.message}`)
            throw error
        }
    }
}

export const cleRepartitionService = new CleRepartitionService()
