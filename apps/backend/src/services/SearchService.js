import { SearchModel } from '../models/Search.js'
import logger from '../logger.js'

class SearchService {
  async search(query, coproprieteId) {
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
        SearchModel.searchCoproprietes(query),
        SearchModel.searchCoproprietaires(query),
        SearchModel.searchContrats(query, coproprieteId),
        SearchModel.searchIncidents(query, coproprieteId),
        SearchModel.searchDocuments(query, coproprieteId),
        SearchModel.searchAssemblees(query, coproprieteId),
        SearchModel.searchAssurances(query, coproprieteId),
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
