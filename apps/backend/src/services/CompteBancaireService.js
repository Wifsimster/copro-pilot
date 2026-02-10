import { CompteBancaireModel } from '../models/CompteBancaire.js'
import logger from '../logger.js'

class CompteBancaireService {
  async getAllByCopropriete(coproprieteId) {
    try {
      return await CompteBancaireModel.getAllByCopropriete(coproprieteId)
    } catch (error) {
      logger.error(`[CompteBancaireService] Error getting comptes: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await CompteBancaireModel.getById(id)
    } catch (error) {
      logger.error(`[CompteBancaireService] Error getting compte ${id}: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await CompteBancaireModel.create(data)
      logger.info(`[CompteBancaireService] Compte bancaire cree: ${result.banque} ${result.iban} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[CompteBancaireService] Error creating compte: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const result = await CompteBancaireModel.update(id, data)
      logger.info(`[CompteBancaireService] Compte bancaire mis a jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[CompteBancaireService] Error updating compte ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await CompteBancaireModel.getById(id)
      if (!existing) return false
      await CompteBancaireModel.delete(id)
      logger.info(`[CompteBancaireService] Compte bancaire supprime (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[CompteBancaireService] Error deleting compte ${id}: ${error.message}`)
      throw error
    }
  }

  async getSoldeTotal(coproprieteId) {
    try {
      return await CompteBancaireModel.getSoldeTotal(coproprieteId)
    } catch (error) {
      logger.error(`[CompteBancaireService] Error getting solde total: ${error.message}`)
      throw error
    }
  }
}

export const compteBancaireService = new CompteBancaireService()
