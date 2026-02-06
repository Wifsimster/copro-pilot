import { PartieCommuneModel } from '../models/PartieCommune.js'
import logger from '../logger.js'

class PartieCommuneService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await PartieCommuneModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[PartieCommuneService] Error getting parties communes: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await PartieCommuneModel.getById(id)
        } catch (error) {
            logger.error(`[PartieCommuneService] Error getting partie commune ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await PartieCommuneModel.create(data)
            logger.info(`[PartieCommuneService] Partie commune créée: ${result.nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[PartieCommuneService] Error creating partie commune: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await PartieCommuneModel.getById(id)
            if (!existing) return null
            const result = await PartieCommuneModel.update(id, data)
            logger.info(`[PartieCommuneService] Partie commune mise à jour: ${result.nom} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[PartieCommuneService] Error updating partie commune ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await PartieCommuneModel.getById(id)
            if (!existing) return false
            await PartieCommuneModel.delete(id)
            logger.info(`[PartieCommuneService] Partie commune supprimée: ${existing.nom} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[PartieCommuneService] Error deleting partie commune ${id}: ${error.message}`)
            throw error
        }
    }
}

export const partieCommuneService = new PartieCommuneService()
