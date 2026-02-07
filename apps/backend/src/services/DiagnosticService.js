import { DiagnosticModel } from '../models/Diagnostic.js'
import logger from '../logger.js'

class DiagnosticService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await DiagnosticModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[DiagnosticService] Error getting diagnostics: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await DiagnosticModel.getById(id)
        } catch (error) {
            logger.error(`[DiagnosticService] Error getting diagnostic ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await DiagnosticModel.create(data)
            logger.info(`[DiagnosticService] Diagnostic cree: ${result.type} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[DiagnosticService] Error creating diagnostic: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await DiagnosticModel.getById(id)
            if (!existing) return null
            const result = await DiagnosticModel.update(id, data)
            logger.info(`[DiagnosticService] Diagnostic mis a jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[DiagnosticService] Error updating diagnostic ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await DiagnosticModel.getById(id)
            if (!existing) return false
            await DiagnosticModel.delete(id)
            logger.info(`[DiagnosticService] Diagnostic supprime (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[DiagnosticService] Error deleting diagnostic ${id}: ${error.message}`)
            throw error
        }
    }
}

export const diagnosticService = new DiagnosticService()
