import { AppelFondsModel } from '../models/AppelFonds.js'
import logger from '../logger.js'

class AppelFondsService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await AppelFondsModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[AppelFondsService] Error getting appels de fonds: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const appel = await AppelFondsModel.getById(id)
            if (!appel) return null
            const lignes = await AppelFondsModel.getLignes(id)
            return { ...appel, lignes }
        } catch (error) {
            logger.error(`[AppelFondsService] Error getting appel ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await AppelFondsModel.create(data)
            logger.info(`[AppelFondsService] Appel de fonds créé: T${result.trimestre} ${result.annee} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error creating appel: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await AppelFondsModel.getById(id)
            if (!existing) return null
            const result = await AppelFondsModel.update(id, data)
            logger.info(`[AppelFondsService] Appel de fonds mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error updating appel ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await AppelFondsModel.getById(id)
            if (!existing) return false
            await AppelFondsModel.delete(id)
            logger.info(`[AppelFondsService] Appel de fonds supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AppelFondsService] Error deleting appel ${id}: ${error.message}`)
            throw error
        }
    }

    async getLignes(appelFondsId) {
        try {
            return await AppelFondsModel.getLignes(appelFondsId)
        } catch (error) {
            logger.error(`[AppelFondsService] Error getting lignes: ${error.message}`)
            throw error
        }
    }

    async createLigne(data) {
        try {
            const result = await AppelFondsModel.createLigne(data)
            logger.info(`[AppelFondsService] Ligne d'appel créée (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error creating ligne: ${error.message}`)
            throw error
        }
    }

    async updateLigne(id, data) {
        try {
            const result = await AppelFondsModel.updateLigne(id, data)
            if (!result) return null
            logger.info(`[AppelFondsService] Ligne d'appel mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error updating ligne ${id}: ${error.message}`)
            throw error
        }
    }

    async deleteLigne(id) {
        try {
            const deleted = await AppelFondsModel.deleteLigne(id)
            if (!deleted) return false
            logger.info(`[AppelFondsService] Ligne d'appel supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AppelFondsService] Error deleting ligne ${id}: ${error.message}`)
            throw error
        }
    }
}

export const appelFondsService = new AppelFondsService()
