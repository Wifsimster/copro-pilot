import { LocataireModel } from '../models/Locataire.js'
import logger from '../logger.js'

class LocataireService {
    async getAllByLot(lotId) {
        try {
            return await LocataireModel.getAllByLot(lotId)
        } catch (error) {
            logger.error(`[LocataireService] Error getting locataires for lot ${lotId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await LocataireModel.getById(id)
        } catch (error) {
            logger.error(`[LocataireService] Error getting locataire ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await LocataireModel.create(data)
            logger.info(`[LocataireService] Locataire créé: ${result.nom} ${result.prenom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[LocataireService] Error creating locataire: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await LocataireModel.getById(id)
            if (!existing) return null
            const result = await LocataireModel.update(id, data)
            logger.info(`[LocataireService] Locataire mis à jour: ${result.nom} ${result.prenom} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[LocataireService] Error updating locataire ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await LocataireModel.getById(id)
            if (!existing) return false
            await LocataireModel.delete(id)
            logger.info(`[LocataireService] Locataire supprimé: ${existing.nom} ${existing.prenom} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[LocataireService] Error deleting locataire ${id}: ${error.message}`)
            throw error
        }
    }
}

export const locataireService = new LocataireService()
