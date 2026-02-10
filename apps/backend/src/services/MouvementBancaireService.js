import { MouvementBancaireModel } from '../models/MouvementBancaire.js'
import logger from '../logger.js'

class MouvementBancaireService {
  async getAllByCompte(compteId) {
    try {
      return await MouvementBancaireModel.getAllByCompte(compteId)
    } catch (error) {
      logger.error(`[MouvementBancaireService] Error getting mouvements: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await MouvementBancaireModel.getById(id)
    } catch (error) {
      logger.error(`[MouvementBancaireService] Error getting mouvement ${id}: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await MouvementBancaireModel.create(data)
      logger.info(`[MouvementBancaireService] Mouvement cree: ${result.type} ${result.montant}EUR (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[MouvementBancaireService] Error creating mouvement: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const result = await MouvementBancaireModel.update(id, data)
      logger.info(`[MouvementBancaireService] Mouvement mis a jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[MouvementBancaireService] Error updating mouvement ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await MouvementBancaireModel.getById(id)
      if (!existing) return false
      await MouvementBancaireModel.delete(id)
      logger.info(`[MouvementBancaireService] Mouvement supprime (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[MouvementBancaireService] Error deleting mouvement ${id}: ${error.message}`)
      throw error
    }
  }

  async getSoldeCompte(compteId) {
    try {
      return await MouvementBancaireModel.getSoldeCompte(compteId)
    } catch (error) {
      logger.error(`[MouvementBancaireService] Error getting solde: ${error.message}`)
      throw error
    }
  }
}

export const mouvementBancaireService = new MouvementBancaireService()
