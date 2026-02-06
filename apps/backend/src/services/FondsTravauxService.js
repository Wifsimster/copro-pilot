import { FondsTravauxModel } from '../models/FondsTravaux.js'
import logger from '../logger.js'

class FondsTravauxService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await FondsTravauxModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[FondsTravauxService] Error getting fonds travaux: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await FondsTravauxModel.getById(id)
        } catch (error) {
            logger.error(`[FondsTravauxService] Error getting fonds ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await FondsTravauxModel.create(data)
            logger.info(`[FondsTravauxService] Fonds travaux créé: ${result.annee} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[FondsTravauxService] Error creating fonds: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await FondsTravauxModel.getById(id)
            if (!existing) return null
            const result = await FondsTravauxModel.update(id, data)
            logger.info(`[FondsTravauxService] Fonds travaux mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[FondsTravauxService] Error updating fonds ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await FondsTravauxModel.getById(id)
            if (!existing) return false
            await FondsTravauxModel.delete(id)
            logger.info(`[FondsTravauxService] Fonds travaux supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[FondsTravauxService] Error deleting fonds ${id}: ${error.message}`)
            throw error
        }
    }
}

export const fondsTravauxService = new FondsTravauxService()
