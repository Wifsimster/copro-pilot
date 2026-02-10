import { SinistreModel } from '../models/Sinistre.js'
import logger from '../logger.js'

class SinistreService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await SinistreModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[SinistreService] Error getting sinistres for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getAllByAssurance(assuranceId) {
        try {
            return await SinistreModel.getAllByAssurance(assuranceId)
        } catch (error) {
            logger.error(`[SinistreService] Error getting sinistres for assurance ${assuranceId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await SinistreModel.getById(id)
        } catch (error) {
            logger.error(`[SinistreService] Error getting sinistre ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await SinistreModel.create(data)
            logger.info(`[SinistreService] Sinistre créé: ${result.numero_sinistre || 'N/A'} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[SinistreService] Error creating sinistre: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await SinistreModel.getById(id)
            if (!existing) return null

            const result = await SinistreModel.update(id, data)
            logger.info(`[SinistreService] Sinistre mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[SinistreService] Error updating sinistre ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await SinistreModel.getById(id)
            if (!existing) return false

            await SinistreModel.delete(id)
            logger.info(`[SinistreService] Sinistre supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[SinistreService] Error deleting sinistre ${id}: ${error.message}`)
            throw error
        }
    }
}

export const sinistreService = new SinistreService()
