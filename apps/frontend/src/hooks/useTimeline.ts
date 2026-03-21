import { useQuery } from '@tanstack/react-query'
import { timelineApi } from '@/api/timeline'

export const TIMELINE_QUERY_KEY = ['timeline'] as const

export function useEntityTimeline(
  entityType: string | undefined,
  entityId: number | undefined
) {
  return useQuery({
    queryKey: [...TIMELINE_QUERY_KEY, entityType, entityId],
    queryFn: async () => {
      const response = await timelineApi.getByEntity(
        entityType!,
        entityId!
      )
      return response.data
    },
    enabled: !!entityType && !!entityId,
  })
}
