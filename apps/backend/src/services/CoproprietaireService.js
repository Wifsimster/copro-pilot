import { CoproprietaireModel } from '../models/Coproprietaire.js'
import logger from '../logger.js'

class CoproprietaireService {
    async getAll() {
        try {
            return await CoproprietaireModel.getAll()
        } catch (error) {
            logger.error(`[CoproprietaireService] Error getting all copropriétaires: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const coproprietaire = await CoproprietaireModel.getById(id)
            if (!coproprietaire) return null

            const lots = await CoproprietaireModel.getLots(id)
            return { ...coproprietaire, lots }
        } catch (error) {
            logger.error(`[CoproprietaireService] Error getting copropriétaire ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await CoproprietaireModel.create(data)
            logger.info(`[CoproprietaireService] Copropriétaire créé: ${result.nom} ${result.prenom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[CoproprietaireService] Error creating copropriétaire: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await CoproprietaireModel.getById(id)
            if (!existing) return null

            const result = await CoproprietaireModel.update(id, data)
            logger.info(`[CoproprietaireService] Copropriétaire mis à jour: ${result.nom} ${result.prenom} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[CoproprietaireService] Error updating copropriétaire ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await CoproprietaireModel.getById(id)
            if (!existing) return false

            await CoproprietaireModel.delete(id)
            logger.info(`[CoproprietaireService] Copropriétaire supprimé: ${existing.nom} ${existing.prenom} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[CoproprietaireService] Error deleting copropriétaire ${id}: ${error.message}`)
            throw error
        }
    }

    async search(query) {
        try {
            return await CoproprietaireModel.search(query)
        } catch (error) {
            logger.error(`[CoproprietaireService] Error searching copropriétaires: ${error.message}`)
            throw error
        }
    }
}

export const coproprietaireService = new CoproprietaireService()
