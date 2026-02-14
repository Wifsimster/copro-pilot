import { api } from './api'
import type { ApiResponse, SearchResults } from '@/types'

export const searchApi = {
  search: (
    query: string,
    coproprieteId?: number
  ) =>
    api.get<ApiResponse<SearchResults>>('/search', {
      q: query,
      copropriete_id: coproprieteId,
    }),
}
