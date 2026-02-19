import { SearchModel } from '../models/Search.js'
import logger from '../logger.js'

class SearchService {
  async search(query, coproprieteId, coproprieteIds = null) {
    try {
      const [
        coproprietes,
        coproprietaires,
        contrats,
        incidents,
        documents,
        assemblees,
        assurances,
      ] = await Promise.all([
        SearchModel.searchCoproprietes(query, 5, coproprieteIds),
        SearchModel.searchCoproprietaires(query, 5, coproprieteIds),
        SearchModel.searchContrats(query, coproprieteId, 5, coproprieteIds),
        SearchModel.searchIncidents(query, coproprieteId, 5, coproprieteIds),
        SearchModel.searchDocuments(query, coproprieteId, 5, coproprieteIds),
        SearchModel.searchAssemblees(query, coproprieteId, 5, coproprieteIds),
        SearchModel.searchAssurances(query, coproprieteId, 5, coproprieteIds),
      ])

      return {
        coproprietes,
        coproprietaires,
        contrats,
        incidents,
        documents,
        assemblees,
        assurances,
      }
    } catch (error) {
      logger.error(
        `[SearchService] Error searching: ${error.message}`
      )
      throw error
    }
  }
}

export const searchService = new SearchService()
