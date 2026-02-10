import { PrestataireModel } from '../models/Prestataire.js'
import logger from '../logger.js'

class PrestataireService {
  async getAll() {
    try {
      return await PrestataireModel.getAll()
    } catch (error) {
      logger.error(`[PrestataireService] Error getting prestataires: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await PrestataireModel.getById(id)
    } catch (error) {
      logger.error(`[PrestataireService] Error getting prestataire ${id}: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await PrestataireModel.create(data)
      logger.info(`[PrestataireService] Prestataire créé: ${result.nom} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[PrestataireService] Error creating prestataire: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const existing = await PrestataireModel.getById(id)
      if (!existing) return null
      const result = await PrestataireModel.update(id, data)
      logger.info(`[PrestataireService] Prestataire mis à jour: ${result.nom} (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[PrestataireService] Error updating prestataire ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await PrestataireModel.getById(id)
      if (!existing) return false
      await PrestataireModel.delete(id)
      logger.info(`[PrestataireService] Prestataire supprimé: ${existing.nom} (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[PrestataireService] Error deleting prestataire ${id}: ${error.message}`)
      throw error
    }
  }
}

export const prestataireService = new PrestataireService()
