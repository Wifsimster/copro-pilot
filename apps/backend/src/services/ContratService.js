import { ContratModel } from '../models/Contrat.js'
import logger from '../logger.js'

class ContratService {
  async getAllByCopropriete(coproprieteId) {
    try {
      return await ContratModel.getAllByCopropriete(coproprieteId)
    } catch (error) {
      logger.error(`[ContratService] Error getting contrats: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await ContratModel.getById(id)
    } catch (error) {
      logger.error(`[ContratService] Error getting contrat ${id}: ${error.message}`)
      throw error
    }
  }

  async getByPrestataire(prestataireId) {
    try {
      return await ContratModel.getByPrestataire(prestataireId)
    } catch (error) {
      logger.error(`[ContratService] Error getting contrats for prestataire ${prestataireId}: ${error.message}`)
      throw error
    }
  }

  async getExpiringSoon(coproprieteId, daysAhead) {
    try {
      return await ContratModel.getExpiringSoon(coproprieteId, daysAhead)
    } catch (error) {
      logger.error(`[ContratService] Error getting expiring contrats: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await ContratModel.create(data)
      logger.info(`[ContratService] Contrat créé: ${result.objet} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[ContratService] Error creating contrat: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const existing = await ContratModel.getById(id)
      if (!existing) return null
      const result = await ContratModel.update(id, data)
      logger.info(`[ContratService] Contrat mis à jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[ContratService] Error updating contrat ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await ContratModel.getById(id)
      if (!existing) return false
      await ContratModel.delete(id)
      logger.info(`[ContratService] Contrat supprimé (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[ContratService] Error deleting contrat ${id}: ${error.message}`)
      throw error
    }
  }
}

export const contratService = new ContratService()
