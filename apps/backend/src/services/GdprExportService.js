import { GdprExportModel } from '../models/GdprExport.js'
import logger from '../logger.js'

class GdprExportService {
  async exportUserData(userId) {
    try {
      const data = await GdprExportModel.getUserData(userId)
      logger.info('[GdprExportService] Data exported')
      return data
    } catch (error) {
      logger.error(
        `[GdprExportService] Error exporting data: ${error.message}`
      )
      throw error
    }
  }
}

export const gdprExportService = new GdprExportService()
