import { SearchModel } from '../models/Search.js'
import logger from '../logger.js'

const MAX_RESULTS_PER_TYPE = 5
const MAX_TOTAL_RESULTS = 20
const MIN_QUERY_LENGTH = 2

class SearchService {
  async search(query, coproprieteId, coproprieteIds = null) {
    try {
      // Minimum query length check to avoid expensive broad searches
      if (!query || query.trim().length < MIN_QUERY_LENGTH) {
        return {
          coproprietes: [],
          coproprietaires: [],
          contrats: [],
          incidents: [],
          documents: [],
          assemblees: [],
          assurances: [],
        }
      }

      const trimmedQuery = query.trim()
      const limit = MAX_RESULTS_PER_TYPE

      const [
        coproprietes,
        coproprietaires,
        contrats,
        incidents,
        documents,
        assemblees,
        assurances,
      ] = await Promise.all([
        SearchModel.searchCoproprietes(trimmedQuery, limit, coproprieteIds),
        SearchModel.searchCoproprietaires(trimmedQuery, limit, coproprieteIds),
        SearchModel.searchContrats(trimmedQuery, coproprieteId, limit, coproprieteIds),
        SearchModel.searchIncidents(trimmedQuery, coproprieteId, limit, coproprieteIds),
        SearchModel.searchDocuments(trimmedQuery, coproprieteId, limit, coproprieteIds),
        SearchModel.searchAssemblees(trimmedQuery, coproprieteId, limit, coproprieteIds),
        SearchModel.searchAssurances(trimmedQuery, coproprieteId, limit, coproprieteIds),
      ])

      const results = {
        coproprietes,
        coproprietaires,
        contrats,
        incidents,
        documents,
        assemblees,
        assurances,
      }

      // Early termination: trim results if total exceeds threshold
      const totalResults =
        coproprietes.length +
        coproprietaires.length +
        contrats.length +
        incidents.length +
        documents.length +
        assemblees.length +
        assurances.length

      if (totalResults > MAX_TOTAL_RESULTS) {
        let remaining = MAX_TOTAL_RESULTS
        for (const key of Object.keys(results)) {
          if (remaining <= 0) {
            results[key] = []
          } else {
            results[key] = results[key].slice(0, remaining)
            remaining -= results[key].length
          }
        }
      }

      return results
    } catch (error) {
      logger.error(
        `[SearchService] Error searching: ${error.message}`
      )
      throw error
    }
  }
}

export const searchService = new SearchService()
