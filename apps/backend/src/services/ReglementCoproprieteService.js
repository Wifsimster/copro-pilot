import { ReglementCoproprieteModel, ArticleReglementModel } from '../models/ReglementCopropriete.js'
import logger from '../logger.js'

class ReglementCoproprieteService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await ReglementCoproprieteModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[ReglementCoproprieteService] Error getting reglements: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await ReglementCoproprieteModel.getById(id)
        } catch (error) {
            logger.error(`[ReglementCoproprieteService] Error getting reglement ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await ReglementCoproprieteModel.create(data)
            logger.info(`[ReglementCoproprieteService] Règlement créé (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[ReglementCoproprieteService] Error creating reglement: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await ReglementCoproprieteModel.getById(id)
            if (!existing) return null
            const result = await ReglementCoproprieteModel.update(id, data)
            logger.info(`[ReglementCoproprieteService] Règlement mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[ReglementCoproprieteService] Error updating reglement ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await ReglementCoproprieteModel.getById(id)
            if (!existing) return false
            await ReglementCoproprieteModel.delete(id)
            logger.info(`[ReglementCoproprieteService] Règlement supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[ReglementCoproprieteService] Error deleting reglement ${id}: ${error.message}`)
            throw error
        }
    }
}

class ArticleReglementService {
    async getAllByReglement(reglementId) {
        try {
            return await ArticleReglementModel.getAllByReglement(reglementId)
        } catch (error) {
            logger.error(`[ArticleReglementService] Error getting articles: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await ArticleReglementModel.getById(id)
        } catch (error) {
            logger.error(`[ArticleReglementService] Error getting article ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await ArticleReglementModel.create(data)
            logger.info(`[ArticleReglementService] Article créé: ${result.titre} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[ArticleReglementService] Error creating article: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await ArticleReglementModel.getById(id)
            if (!existing) return null
            const result = await ArticleReglementModel.update(id, data)
            logger.info(`[ArticleReglementService] Article mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[ArticleReglementService] Error updating article ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await ArticleReglementModel.getById(id)
            if (!existing) return false
            await ArticleReglementModel.delete(id)
            logger.info(`[ArticleReglementService] Article supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[ArticleReglementService] Error deleting article ${id}: ${error.message}`)
            throw error
        }
    }
}

export const reglementCoproprieteService = new ReglementCoproprieteService()
export const articleReglementService = new ArticleReglementService()
