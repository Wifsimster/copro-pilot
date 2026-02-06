import { CarnetEntretienModel } from '../models/CarnetEntretien.js'
import logger from '../logger.js'

class CarnetEntretienService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await CarnetEntretienModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[CarnetEntretienService] Error getting entrées: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await CarnetEntretienModel.getById(id)
        } catch (error) {
            logger.error(`[CarnetEntretienService] Error getting entrée ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await CarnetEntretienModel.create(data)
            logger.info(`[CarnetEntretienService] Entrée créée: ${result.titre} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[CarnetEntretienService] Error creating entrée: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await CarnetEntretienModel.getById(id)
            if (!existing) return null
            const result = await CarnetEntretienModel.update(id, data)
            logger.info(`[CarnetEntretienService] Entrée mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[CarnetEntretienService] Error updating entrée ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await CarnetEntretienModel.getById(id)
            if (!existing) return false
            await CarnetEntretienModel.delete(id)
            logger.info(`[CarnetEntretienService] Entrée supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[CarnetEntretienService] Error deleting entrée ${id}: ${error.message}`)
            throw error
        }
    }
}

export const carnetEntretienService = new CarnetEntretienService()
