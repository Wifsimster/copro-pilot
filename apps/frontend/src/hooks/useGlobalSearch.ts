import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { searchApi } from '@/api/search'

const SEARCH_QUERY_KEY = ['global-search'] as const

export function useGlobalSearch(coproprieteId?: number) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: [...SEARCH_QUERY_KEY, debouncedQuery, coproprieteId],
    queryFn: async () => {
      const response = await searchApi.search(
        debouncedQuery,
        coproprieteId
      )
      return response.data
    },
    enabled: debouncedQuery.length >= 2,
  })

  return {
    query,
    setQuery,
    results: data,
    isLoading: isLoading && debouncedQuery.length >= 2,
  }
}
