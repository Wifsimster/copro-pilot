import { EmployeSyndicatModel } from '../models/EmployeSyndicat.js'
import logger from '../logger.js'

class EmployeSyndicatService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await EmployeSyndicatModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[EmployeSyndicatService] Error getting employés for copropriété ${coproprieteId}: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await EmployeSyndicatModel.getById(id)
        } catch (error) {
            logger.error(`[EmployeSyndicatService] Error getting employé ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await EmployeSyndicatModel.create(data)
            logger.info(`[EmployeSyndicatService] Employé créé: ${result.nom} ${result.prenom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[EmployeSyndicatService] Error creating employé: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await EmployeSyndicatModel.getById(id)
            if (!existing) return null

            const result = await EmployeSyndicatModel.update(id, data)
            logger.info(`[EmployeSyndicatService] Employé mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[EmployeSyndicatService] Error updating employé ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await EmployeSyndicatModel.getById(id)
            if (!existing) return false

            await EmployeSyndicatModel.delete(id)
            logger.info(`[EmployeSyndicatService] Employé supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[EmployeSyndicatService] Error deleting employé ${id}: ${error.message}`)
            throw error
        }
    }
}

export const employeSyndicatService = new EmployeSyndicatService()
