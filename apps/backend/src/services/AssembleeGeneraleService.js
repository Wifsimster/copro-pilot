import { AssembleeGeneraleModel } from '../models/AssembleeGenerale.js'
import { CoproprieteModel } from '../models/Copropriete.js'
import { pvGenerationService } from './PvGenerationService.js'
import logger from '../logger.js'

class AssembleeGeneraleService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await AssembleeGeneraleModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[AGService] Error getting assemblées: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const ag = await AssembleeGeneraleModel.getById(id)
            if (!ag) return null
            const resolutions = await AssembleeGeneraleModel.getResolutions(id)
            const presences = await AssembleeGeneraleModel.getPresences(id)
            return { ...ag, resolutions, presences }
        } catch (error) {
            logger.error(`[AGService] Error getting AG ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await AssembleeGeneraleModel.create(data)
            logger.info(`[AGService] AG créée: ${result.date} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AGService] Error creating AG: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await AssembleeGeneraleModel.getById(id)
            if (!existing) return null
            const result = await AssembleeGeneraleModel.update(id, data)
            logger.info(`[AGService] AG mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AGService] Error updating AG ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await AssembleeGeneraleModel.getById(id)
            if (!existing) return false
            await AssembleeGeneraleModel.delete(id)
            logger.info(`[AGService] AG supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AGService] Error deleting AG ${id}: ${error.message}`)
            throw error
        }
    }

    // Résolutions
    async getResolutions(agId) {
        try {
            return await AssembleeGeneraleModel.getResolutions(agId)
        } catch (error) {
            logger.error(`[AGService] Error getting résolutions: ${error.message}`)
            throw error
        }
    }

    async createResolution(data) {
        try {
            const result = await AssembleeGeneraleModel.createResolution(data)
            logger.info(`[AGService] Résolution créée: #${result.numero} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AGService] Error creating résolution: ${error.message}`)
            throw error
        }
    }

    async updateResolution(id, data) {
        try {
            const result = await AssembleeGeneraleModel.updateResolution(id, data)
            logger.info(`[AGService] Résolution mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AGService] Error updating résolution ${id}: ${error.message}`)
            throw error
        }
    }

    async deleteResolution(id) {
        try {
            await AssembleeGeneraleModel.deleteResolution(id)
            logger.info(`[AGService] Résolution supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AGService] Error deleting résolution ${id}: ${error.message}`)
            throw error
        }
    }

    // Présences
    async getPresences(agId) {
        try {
            return await AssembleeGeneraleModel.getPresences(agId)
        } catch (error) {
            logger.error(`[AGService] Error getting présences: ${error.message}`)
            throw error
        }
    }

    async setPresence(data) {
        try {
            const result = await AssembleeGeneraleModel.setPresence(data)
            logger.info(`[AGService] Présence définie: copro ${data.coproprietaire_id} = ${data.statut}`)
            return result
        } catch (error) {
            logger.error(`[AGService] Error setting présence: ${error.message}`)
            throw error
        }
    }

    async deletePresence(id) {
        try {
            await AssembleeGeneraleModel.deletePresence(id)
            logger.info(`[AGService] Présence supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AGService] Error deleting présence ${id}: ${error.message}`)
            throw error
        }
    }

    // Génération PV
    async genererPv(agId) {
        try {
            const ag = await this.getById(agId)
            if (!ag) return null
            const copropriete = await CoproprieteModel.getById(ag.copropriete_id)
            const pdfDoc = pvGenerationService.generatePdf(ag, copropriete)
            logger.info(`[AGService] PV généré pour AG ${agId}`)
            return pdfDoc
        } catch (error) {
            logger.error(`[AGService] Error generating PV for AG ${agId}: ${error.message}`)
            throw error
        }
    }
}

export const assembleeGeneraleService = new AssembleeGeneraleService()
