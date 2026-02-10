import { ProcedureModel } from '../models/Procedure.js'
import logger from '../logger.js'

class ProcedureService {
  async getAllByCopropriete(coproprieteId) {
    try {
      return await ProcedureModel.getAllByCopropriete(coproprieteId)
    } catch (error) {
      logger.error(`[ProcedureService] Error getting procedures for copropriété ${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await ProcedureModel.getById(id)
    } catch (error) {
      logger.error(`[ProcedureService] Error getting procedure ${id}: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await ProcedureModel.create(data)
      logger.info(`[ProcedureService] Procédure créée: ${result.reference_dossier || 'sans référence'} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[ProcedureService] Error creating procedure: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const existing = await ProcedureModel.getById(id)
      if (!existing) return null

      const result = await ProcedureModel.update(id, data)
      logger.info(`[ProcedureService] Procédure mise à jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[ProcedureService] Error updating procedure ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await ProcedureModel.getById(id)
      if (!existing) return false

      await ProcedureModel.delete(id)
      logger.info(`[ProcedureService] Procédure supprimée (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[ProcedureService] Error deleting procedure ${id}: ${error.message}`)
      throw error
    }
  }
}

export const procedureService = new ProcedureService()
