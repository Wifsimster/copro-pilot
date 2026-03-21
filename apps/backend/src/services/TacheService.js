import { TacheModel } from '../models/Tache.js'
import logger from '../logger.js'

class TacheService {
  async getAllByUser(userId, filters) {
    try {
      return await TacheModel.getAllByUser(userId, filters)
    } catch (error) {
      logger.error(`[TacheService] Error getting taches for user ${userId}: ${error.message}`)
      throw error
    }
  }

  async getAllByCopropriete(coproprieteId) {
    try {
      return await TacheModel.getAllByCopropriete(coproprieteId)
    } catch (error) {
      logger.error(`[TacheService] Error getting taches for copropriete ${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await TacheModel.getById(id)
    } catch (error) {
      logger.error(`[TacheService] Error getting tache ${id}: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await TacheModel.create(data)
      logger.info(`[TacheService] Tache creee: ${result.titre} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[TacheService] Error creating tache: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const existing = await TacheModel.getById(id)
      if (!existing) return null
      const result = await TacheModel.update(id, data)
      logger.info(`[TacheService] Tache mise a jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[TacheService] Error updating tache ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await TacheModel.getById(id)
      if (!existing) return false
      await TacheModel.delete(id)
      logger.info(`[TacheService] Tache supprimee (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[TacheService] Error deleting tache ${id}: ${error.message}`)
      throw error
    }
  }

  async getOverdue() {
    try {
      return await TacheModel.getOverdue()
    } catch (error) {
      logger.error(`[TacheService] Error getting overdue taches: ${error.message}`)
      throw error
    }
  }

  async getByEntity(entiteType, entiteId) {
    try {
      return await TacheModel.getByEntity(entiteType, entiteId)
    } catch (error) {
      logger.error(`[TacheService] Error getting taches for ${entiteType} ${entiteId}: ${error.message}`)
      throw error
    }
  }
}

export const tacheService = new TacheService()
