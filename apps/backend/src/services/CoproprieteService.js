import { CoproprieteModel } from '../models/Copropriete.js'
import logger from '../logger.js'

class CoproprieteService {
    async getAll() {
        try {
            const coproprietes = await CoproprieteModel.getAll()
            // Enrich with stats
            const enriched = await Promise.all(
                coproprietes.map(async (copro) => {
                    const stats = await CoproprieteModel.getStats(copro.id)
                    return { ...copro, ...stats }
                })
            )
            return enriched
        } catch (error) {
            logger.error(`[CoproprieteService] Error getting all copropriétés: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const copropriete = await CoproprieteModel.getById(id)
            if (!copropriete) return null

            const stats = await CoproprieteModel.getStats(id)
            return { ...copropriete, ...stats }
        } catch (error) {
            logger.error(`[CoproprieteService] Error getting copropriété ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await CoproprieteModel.create(data)
            logger.info(`[CoproprieteService] Copropriété créée: ${result.nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[CoproprieteService] Error creating copropriété: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await CoproprieteModel.getById(id)
            if (!existing) return null

            const result = await CoproprieteModel.update(id, data)
            logger.info(`[CoproprieteService] Copropriété mise à jour: ${result.nom} (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[CoproprieteService] Error updating copropriété ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await CoproprieteModel.getById(id)
            if (!existing) return false

            await CoproprieteModel.delete(id)
            logger.info(`[CoproprieteService] Copropriété supprimée: ${existing.nom} (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[CoproprieteService] Error deleting copropriété ${id}: ${error.message}`)
            throw error
        }
    }
}

export const coproprieteService = new CoproprieteService()
