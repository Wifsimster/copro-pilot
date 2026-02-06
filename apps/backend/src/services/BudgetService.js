import { BudgetModel } from '../models/Budget.js'
import logger from '../logger.js'

class BudgetService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await BudgetModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[BudgetService] Error getting budgets: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const budget = await BudgetModel.getById(id)
            if (!budget) return null
            const postes = await BudgetModel.getPostes(id)
            return { ...budget, postes }
        } catch (error) {
            logger.error(`[BudgetService] Error getting budget ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await BudgetModel.create(data)
            logger.info(`[BudgetService] Budget créé: ${result.annee} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[BudgetService] Error creating budget: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await BudgetModel.getById(id)
            if (!existing) return null
            const result = await BudgetModel.update(id, data)
            logger.info(`[BudgetService] Budget mis à jour: ${result.annee} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[BudgetService] Error updating budget ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await BudgetModel.getById(id)
            if (!existing) return false
            await BudgetModel.delete(id)
            logger.info(`[BudgetService] Budget supprimé: ${existing.annee} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[BudgetService] Error deleting budget ${id}: ${error.message}`)
            throw error
        }
    }

    async getPostes(budgetId) {
        try {
            return await BudgetModel.getPostes(budgetId)
        } catch (error) {
            logger.error(`[BudgetService] Error getting postes for budget ${budgetId}: ${error.message}`)
            throw error
        }
    }

    async createPoste(data) {
        try {
            const result = await BudgetModel.createPoste(data)
            logger.info(`[BudgetService] Poste créé: ${result.nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[BudgetService] Error creating poste: ${error.message}`)
            throw error
        }
    }

    async updatePoste(id, data) {
        try {
            const result = await BudgetModel.updatePoste(id, data)
            logger.info(`[BudgetService] Poste mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[BudgetService] Error updating poste ${id}: ${error.message}`)
            throw error
        }
    }

    async deletePoste(id) {
        try {
            await BudgetModel.deletePoste(id)
            logger.info(`[BudgetService] Poste supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[BudgetService] Error deleting poste ${id}: ${error.message}`)
            throw error
        }
    }
}

export const budgetService = new BudgetService()
