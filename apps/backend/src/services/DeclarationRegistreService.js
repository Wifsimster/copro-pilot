import { DeclarationRegistreModel } from '../models/DeclarationRegistre.js'
import logger from '../logger.js'

class DeclarationRegistreService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await DeclarationRegistreModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[DeclarationRegistreService] Error getting declarations for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await DeclarationRegistreModel.getById(id)
        } catch (error) {
            logger.error(`[DeclarationRegistreService] Error getting declaration ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await DeclarationRegistreModel.create(data)
            logger.info(`[DeclarationRegistreService] Declaration créée: année ${result.annee} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[DeclarationRegistreService] Error creating declaration: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await DeclarationRegistreModel.getById(id)
            if (!existing) return null

            const result = await DeclarationRegistreModel.update(id, data)
            logger.info(`[DeclarationRegistreService] Declaration mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[DeclarationRegistreService] Error updating declaration ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await DeclarationRegistreModel.getById(id)
            if (!existing) return false

            await DeclarationRegistreModel.delete(id)
            logger.info(`[DeclarationRegistreService] Declaration supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[DeclarationRegistreService] Error deleting declaration ${id}: ${error.message}`)
            throw error
        }
    }

    async preparerDonnees(coproprieteId, annee) {
        try {
            const donnees = await DeclarationRegistreModel.preparerDonnees(coproprieteId, annee)
            if (!donnees) return null
            logger.info(`[DeclarationRegistreService] Données préparées pour copropriété ${coproprieteId}, année ${annee}`)
            return donnees
        } catch (error) {
            logger.error(`[DeclarationRegistreService] Error preparing data for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }
}

export const declarationRegistreService = new DeclarationRegistreService()
