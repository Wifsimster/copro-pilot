import { PaiementModel } from '../models/Paiement.js'
import logger from '../logger.js'

class PaiementService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await PaiementModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[PaiementService] Error getting paiements by copropriete: ${error.message}`)
            throw error
        }
    }

    async getAllByCoproprietaire(coproprietaireId) {
        try {
            return await PaiementModel.getAllByCoproprietaire(coproprietaireId)
        } catch (error) {
            logger.error(`[PaiementService] Error getting paiements: ${error.message}`)
            throw error
        }
    }

    async getAllByAppelFonds(appelFondsId) {
        try {
            return await PaiementModel.getAllByAppelFonds(appelFondsId)
        } catch (error) {
            logger.error(`[PaiementService] Error getting paiements by appel: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await PaiementModel.getById(id)
        } catch (error) {
            logger.error(`[PaiementService] Error getting paiement ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await PaiementModel.create(data)
            logger.info(`[PaiementService] Paiement créé: ${result.montant}€ (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[PaiementService] Error creating paiement: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const result = await PaiementModel.update(id, data)
            logger.info(`[PaiementService] Paiement mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[PaiementService] Error updating paiement ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await PaiementModel.getById(id)
            if (!existing) return false
            await PaiementModel.delete(id)
            logger.info(`[PaiementService] Paiement supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[PaiementService] Error deleting paiement ${id}: ${error.message}`)
            throw error
        }
    }

    async getSoldeCoproprietaire(coproprietaireId) {
        try {
            return await PaiementModel.getSoldeCoproprietaire(coproprietaireId)
        } catch (error) {
            logger.error(`[PaiementService] Error getting solde: ${error.message}`)
            throw error
        }
    }
}

export const paiementService = new PaiementService()
